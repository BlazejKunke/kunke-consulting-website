import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync, readFileSync } from 'node:fs';
import { buildHreflangLinks } from '../src/utils/locales.ts';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
const page = read('../src/components/HowWeWorkPage.astro');
const site = new URL('https://kunkeconsulting.pl');
const PDF = 'Kunke-Consulting-Ethical-Conduct-Guide.pdf';

test('the Polish and English pages are one language pair, from either side', () => {
  const pl = buildHreflangLinks('/jak-pracujemy/', site);
  const en = buildHreflangLinks('/en/how-we-work/', site);
  assert.deepEqual(pl, en);
  assert.deepEqual(pl.map((link) => link.href), [
    'https://kunkeconsulting.pl/jak-pracujemy/',
    'https://kunkeconsulting.pl/en/how-we-work/',
    'https://kunkeconsulting.pl/jak-pracujemy/',
  ]);
});

test('the pages link the guide PDF, and the PDF is there', () => {
  assert.ok(existsSync(new URL(`../public/${PDF}`, import.meta.url)));
  assert.match(page, new RegExp(`const PDF = '/${PDF}'`));
  assert.match(read('../public/_headers'), new RegExp(`^/${PDF}$`, 'm'));
});

test('both languages carry the same version and the same sections', () => {
  const version = page.match(/const GUIDE_VERSION = '([\d.]+)'/)?.[1];
  assert.ok(version);
  // The English copy block comes first, the Polish one after "  : {".
  const [en, pl] = page.split(/const copy = en\n/)[1].split(/^ {2}: \{$/m);
  assert.ok(en && pl);
  for (const block of [en, pl]) {
    assert.match(block, /version: `\w+ \$\{GUIDE_VERSION\}, 18 \w+ 2026`/);
    assert.equal([...block.matchAll(/\bid: '[^']+', title: /g)].length, 9);
  }
});

test('the menu lists the page in both languages', () => {
  const nav = read('../src/components/SiteNav.astro');
  assert.match(nav, /\['Jak pracujemy', '\/jak-pracujemy\/'\]/);
  assert.match(nav, /\['How we work', '\/en\/how-we-work\/'\]/);
});
