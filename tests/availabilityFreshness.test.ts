import assert from 'node:assert/strict';
import test from 'node:test';
import { assessPage, checkAvailability, urls } from '../scripts/check-availability-freshness.mjs';

const html = (stamp: string) => `<time datetime="2026-11-11" data-availability-checked-at="${stamp}">11 November 2026</time>`;
const stamp = '2026-11-11T11:40:39Z';

test('alerts only after 48 elapsed hours, not at the boundary', () => {
  const boundary = Date.parse(stamp) + 48 * 3600000;
  assert.equal(assessPage(html(stamp), boundary).status, 'fresh');
  assert.equal(assessPage(html(stamp), boundary + 1).status, 'stale');
});

test('elapsed time remains correct over the Warsaw daylight-saving transition', () => {
  assert.equal(assessPage(html('2027-03-27T05:00:00Z'), Date.parse('2027-03-29T04:00:00Z')).status, 'fresh');
  assert.equal(assessPage(html('2027-03-27T05:00:00Z'), Date.parse('2027-03-29T05:00:01Z')).status, 'stale');
});

test('missing, duplicate, invalid and future timestamps never appear healthy', () => {
  const now = Date.parse('2026-11-11T12:00:00Z');
  for (const page of ['', html(stamp) + html(stamp), html('2026-02-30T00:00:00Z'), html('2026-11-11'), html('2026-11-12T00:00:00Z')]) {
    assert.equal(assessPage(page, now).status, 'unverifiable');
  }
});

test('checks both languages and detects a stale English deployment', async () => {
  const result = await checkAvailability({
    now: Date.parse('2026-11-12T12:00:00Z'),
    fetchPage: async (url: string) => new Response(html(url === urls[0] ? stamp : '2026-11-09T06:00:00Z')),
  });
  assert.equal(result.status, 'stale');
  assert.deepEqual(result.pages.map(p => p.status), ['fresh', 'stale']);
  assert.equal(result.languageMismatch, true);
});

test('network failures and inconsistent fresh pages are unverifiable', async () => {
  const now = Date.parse('2026-11-11T12:00:00Z');
  const failed = await checkAvailability({ now, fetchPage: async () => { throw new Error('offline'); } });
  assert.equal(failed.status, 'unverifiable');
  const http = await checkAvailability({ now, fetchPage: async () => new Response('', { status: 503 }) });
  assert.equal(http.status, 'unverifiable');
  const mismatch = await checkAvailability({ now, fetchPage: async (url: string) => new Response(html(url === urls[0] ? stamp : '2026-11-11T10:00:00Z')) });
  assert.equal(mismatch.status, 'unverifiable');
});

test('incident identity is stable until the published snapshot changes, then clears on recovery', async () => {
  const fetchPage = async () => new Response(html(stamp));
  const a = await checkAvailability({ now: Date.parse('2026-11-14T08:00:00Z'), fetchPage });
  const b = await checkAvailability({ now: Date.parse('2026-11-15T08:00:00Z'), fetchPage });
  assert.equal(a.incidentKey, b.incidentKey);
  const recovered = await checkAvailability({ now: Date.parse('2026-11-11T12:00:00Z'), fetchPage });
  assert.equal(recovered.status, 'fresh');
  assert.equal(recovered.incidentKey, null);
});
