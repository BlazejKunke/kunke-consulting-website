// Verifies the hreflang tags in the built site, and fails the run if they are
// wrong.
//
// This exists because the same bug has been fixed and lost four times (PRs #57,
// #74, #118, #121). Each fix patched the pages Ahrefs happened to flag; none of
// them stopped the next page inheriting the bug. src/utils/locales.ts now makes
// the correct output structural, and this checks that the structure survived
// contact with the build.
//
// It reads dist/, not the source, so it catches breakage introduced anywhere:
// the shared helper, a hand-written tag in a template, or the sitemap config.
//
// Run: node scripts/check-hreflang.mjs   (after npm run build)

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = 'dist';
const SITE = 'https://kunkeconsulting.pl';

// Bare language codes only. Region-qualified codes are not wrong in general,
// but this site targets languages, and mixing the two conventions is how the
// sitemap and the HTML drifted apart in the first place.
const ALLOWED = new Set(['pl', 'en', 'x-default']);

const errors = [];

const htmlFiles = (dir) =>
  readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return htmlFiles(full);
    return full.endsWith('.html') ? [full] : [];
  });

// dist/foo/index.html -> https://kunkeconsulting.pl/foo/
const urlForFile = (file) => {
  const path = relative(DIST, file).split('\\').join('/');
  if (path === 'index.html') return `${SITE}/`;
  if (path.endsWith('/index.html')) return `${SITE}/${path.slice(0, -'index.html'.length)}`;
  return `${SITE}/${path}`;
};

// https://kunkeconsulting.pl/foo/ -> dist/foo/index.html, so we can tell a real
// page from a URL that only looks plausible.
const fileForUrl = (url) => {
  if (!url.startsWith(SITE)) return null;
  const path = url.slice(SITE.length).split('?')[0].split('#')[0];
  const candidates = path.endsWith('/')
    ? [join(DIST, path, 'index.html')]
    : [join(DIST, path), join(DIST, `${path}.html`), join(DIST, path, 'index.html')];
  return candidates.find((candidate) => {
    try {
      return statSync(candidate).isFile();
    } catch {
      return false;
    }
  }) ?? null;
};

const ALTERNATE_TAG = /<link\b[^>]*\brel=["']alternate["'][^>]*>/gi;
const HREFLANG_ATTR = /\bhreflang=["']([^"']+)["']/i;
const HREF_ATTR = /\bhref=["']([^"']+)["']/i;

// url -> [{ hreflang, href }]
const clusters = new Map();

for (const file of htmlFiles(DIST)) {
  const html = readFileSync(file, 'utf8');
  const pageUrl = urlForFile(file);
  const links = [];

  for (const tag of html.match(ALTERNATE_TAG) ?? []) {
    const hreflang = tag.match(HREFLANG_ATTR)?.[1];
    // rel="alternate" is also used for feeds and manifests; only hreflang tags
    // are ours.
    if (!hreflang) continue;
    const href = tag.match(HREF_ATTR)?.[1];
    if (!href) {
      errors.push(`${pageUrl}\n    hreflang="${hreflang}" tag has no href`);
      continue;
    }
    links.push({ hreflang, href });
  }

  if (links.length) clusters.set(pageUrl, links);
}

for (const [pageUrl, links] of clusters) {
  const alternates = links.filter(({ hreflang }) => hreflang !== 'x-default');

  for (const { hreflang, href } of links) {
    if (!ALLOWED.has(hreflang)) {
      errors.push(
        `${pageUrl}\n    unexpected hreflang="${hreflang}" — allowed: ${[...ALLOWED].join(', ')}`
      );
    }
    if (!fileForUrl(href)) {
      errors.push(
        `${pageUrl}\n    hreflang="${hreflang}" points at ${href}, which is not a page in this build`
      );
    }
  }

  // A group of one is the exact shape of the old bug: a lone self-reference,
  // usually paired with an x-default aimed at some other page.
  if (alternates.length === 1) {
    errors.push(
      `${pageUrl}\n    declares a language group of one (hreflang="${alternates[0].hreflang}").` +
        `\n    A page with no translation should emit no hreflang at all.`
    );
  }

  // Self-reference: every member of a group must list itself.
  if (alternates.length > 1 && !alternates.some(({ href }) => href === pageUrl)) {
    errors.push(
      `${pageUrl}\n    lists alternates but not itself. Every page in a language group must self-reference.`
    );
  }

  // Reciprocity: whatever this page claims as an alternate must claim it back,
  // with the identical set. This is the "no return-tag" error Ahrefs reports.
  for (const { hreflang, href } of alternates) {
    if (href === pageUrl) continue;
    const theirs = clusters.get(href);
    if (!theirs) {
      errors.push(
        `${pageUrl}\n    claims ${href} as its hreflang="${hreflang}" alternate,` +
          `\n    but that page emits no hreflang at all. One-way claim — Google discards the whole group.`
      );
      continue;
    }
    if (!theirs.some((link) => link.href === pageUrl)) {
      errors.push(
        `${pageUrl}\n    claims ${href} as an alternate, but ${href} does not point back.`
      );
    }
  }

  // x-default is a member of the group, so it has to point inside it.
  for (const { href } of links.filter(({ hreflang }) => hreflang === 'x-default')) {
    if (!alternates.some((alternate) => alternate.href === href)) {
      errors.push(
        `${pageUrl}\n    x-default points at ${href}, which is not in this page's language group.` +
          `\n    That is what enrols an unrelated page in the group and breaks it.`
      );
    }
  }
}

// The sitemap carries its own copy of the same claims, from a different config.
// They have disagreed with the HTML before.
for (const file of readdirSync(DIST).filter((f) => /^sitemap-\d+\.xml$/.test(f))) {
  const xml = readFileSync(join(DIST, file), 'utf8');
  for (const [, code] of xml.matchAll(/<xhtml:link[^>]*\bhreflang="([^"]+)"/g)) {
    if (!ALLOWED.has(code)) {
      errors.push(
        `${file}\n    sitemap declares hreflang="${code}", which the pages do not use.` +
          `\n    Fix the i18n locales in astro.config.mjs.`
      );
    }
  }
}

if (errors.length) {
  console.error(`\nhreflang check FAILED — ${errors.length} problem(s):\n`);
  for (const error of [...new Set(errors)]) console.error(`  ${error}\n`);
  console.error('See the comment at the top of src/utils/locales.ts for the rule.\n');
  process.exit(1);
}

const groups = [...clusters.keys()].length;
console.log(`hreflang check passed — ${groups} page(s) emit hreflang, all reciprocal.`);
