import assert from 'node:assert/strict';
import test from 'node:test';

import {
  collectCanonicalUrls,
  extractLocations,
  notifyIndexNow
} from '../plugins/indexnow/lib.js';

const siteUrl = 'https://kunkeconsulting.pl';
const sitemapUrl = `${siteUrl}/sitemap-index.xml`;
const childSitemapUrl = `${siteUrl}/sitemap-0.xml`;
const key = '044a4c96024e35c1f37f67ebc74c9aaf';

test('extractLocations decodes XML entities', () => {
  assert.deepEqual(
    extractLocations('<urlset><url><loc>https://example.com/a?x=1&amp;y=2</loc></url></urlset>'),
    ['https://example.com/a?x=1&y=2']
  );
});

test('collectCanonicalUrls follows sitemap indexes and rejects off-site URLs', async () => {
  const fetchImpl = async (url: Parameters<typeof fetch>[0]) => {
    if (url === sitemapUrl) {
      return new Response(`<sitemapindex><sitemap><loc>${childSitemapUrl}</loc></sitemap></sitemapindex>`);
    }

    return new Response(
      '<urlset><url><loc>https://kunkeconsulting.pl/</loc></url><url><loc>https://example.com/</loc></url></urlset>'
    );
  };

  assert.deepEqual(await collectCanonicalUrls({ sitemapUrl, siteUrl, fetchImpl }), [
    'https://kunkeconsulting.pl/'
  ]);
});

test('notifyIndexNow posts canonical URLs with the public verification key', async () => {
  let submittedBody = '';
  const fetchImpl = async (url: Parameters<typeof fetch>[0], init?: RequestInit) => {
    if (url === sitemapUrl) {
      return new Response(`<sitemapindex><sitemap><loc>${childSitemapUrl}</loc></sitemap></sitemapindex>`);
    }

    if (url === childSitemapUrl) {
      return new Response('<urlset><url><loc>https://kunkeconsulting.pl/</loc></url></urlset>');
    }

    submittedBody = String(init?.body ?? '');
    return new Response('', { status: 202 });
  };

  const result = await notifyIndexNow({
    inputs: { siteUrl, sitemapUrl, key },
    fetchImpl
  });

  assert.deepEqual(result, { status: 202, submitted: 1 });
  assert.deepEqual(JSON.parse(submittedBody), {
    host: 'kunkeconsulting.pl',
    key,
    keyLocation: `https://kunkeconsulting.pl/${key}.txt`,
    urlList: ['https://kunkeconsulting.pl/']
  });
});
