import { pathToFileURL } from 'node:url';

export const urls = [
  'https://kunkeconsulting.pl/availability/',
  'https://kunkeconsulting.pl/en/availability/',
];
const maxAgeMs = 48 * 60 * 60 * 1000;

export function assessPage(html, now = Date.now()) {
  const matches = [...html.matchAll(/\bdata-availability-checked-at="([^"]*)"/g)];
  if (matches.length !== 1) return { status: 'unverifiable', reason: 'missing-or-duplicate-timestamp' };
  const checkedAt = matches[0][1];
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(checkedAt)) {
    return { status: 'unverifiable', reason: 'invalid-timestamp' };
  }
  const checkedMs = Date.parse(checkedAt);
  const canonical = checkedAt.includes('.') ? checkedAt : checkedAt.replace('Z', '.000Z');
  if (!Number.isFinite(checkedMs) || new Date(checkedMs).toISOString() !== canonical) {
    return { status: 'unverifiable', reason: 'invalid-timestamp' };
  }
  if (!Number.isFinite(now) || checkedMs > now + 5 * 60 * 1000) {
    return { status: 'unverifiable', reason: 'future-timestamp' };
  }
  const ageMs = now - checkedMs;
  return { status: ageMs > maxAgeMs ? 'stale' : 'fresh', checkedAt, ageHours: ageMs / 3600000 };
}

export async function checkAvailability({ now = Date.now(), fetchPage = fetch } = {}) {
  const pages = await Promise.all(urls.map(async url => {
    try {
      const response = await fetchPage(url, {
        headers: { 'Cache-Control': 'no-cache' },
        signal: AbortSignal.timeout(20000),
      });
      if (!response.ok) return { url, status: 'unverifiable', reason: 'http-error', httpStatus: response.status };
      return { url, ...assessPage(await response.text(), now) };
    } catch (error) {
      return { url, status: 'unverifiable', reason: 'fetch-failed', error: String(error.message ?? error) };
    }
  }));
  const stale = pages.filter(p => p.status === 'stale');
  const unknown = pages.filter(p => p.status === 'unverifiable');
  const mismatch = unknown.length === 0 && Date.parse(pages[0].checkedAt) !== Date.parse(pages[1].checkedAt);
  const status = stale.length ? 'stale' : unknown.length || mismatch ? 'unverifiable' : 'fresh';
  const incidentKey = status === 'fresh' ? null : JSON.stringify(pages.map(p => ({
    url: p.url, checkedAt: p.checkedAt ?? null, reason: p.reason ?? (mismatch ? 'language-mismatch' : p.status),
  })));
  return { status, checkedAt: new Date(now).toISOString(), thresholdHours: 48, languageMismatch: mismatch, incidentKey, pages };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = await checkAvailability();
  console.log(JSON.stringify(result, null, 2));
  process.exitCode = result.status === 'fresh' ? 0 : result.status === 'stale' ? 1 : 2;
}
