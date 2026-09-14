const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';

const decodeXmlText = (value) =>
  value
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&apos;', "'");

export const extractLocations = (xml) =>
  [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/giu)].map((match) => decodeXmlText(match[1]));

const fetchXml = async (url, fetchImpl) => {
  const response = await fetchImpl(url, {
    headers: { 'user-agent': '^Kunke Consulting IndexNow notifier' }
  });

  if (!response.ok) {
    throw new Error(`Could not read ${url}: HTTP ${response.status}`);
  }

  return response.text();
};

export const collectCanonicalUrls = async ({ sitemapUrl, siteUrl, fetchImpl = fetch }) => {
  const site = new URL(siteUrl);
  const sitemapXml = await fetchXml(sitemapUrl, fetchImpl);
  const locations = extractLocations(sitemapXml);

  const pageLocations = sitemapXml.includes('<sitemapindex')
    ? (
        await Promise.all(
          locations.map(async (childSitemapUrl) =>
            extractLocations(await fetchXml(childSitemapUrl, fetchImpl))
          )
        )
      ).flat()
    : locations;

  return [
    ...new Set(
      pageLocations.filter((location) => {
        try {
          return new URL(location).host === site.host;
        } catch {
          return false;
        }
      })
    )
  ];
};

export const notifyIndexNow = async ({ inputs, fetchImpl = fetch }) => {
  const { siteUrl, sitemapUrl, key } = inputs;

  if (!siteUrl || !sitemapUrl || !/^[A-Za-z0-9-]{8,128}$/u.test(key ?? '')) {
    throw new Error('IndexNow requires valid siteUrl, sitemapUrl, and key inputs.');
  }

  const site = new URL(siteUrl);
  const urlList = await collectCanonicalUrls({ sitemapUrl, siteUrl, fetchImpl });

  if (urlList.length === 0) {
    throw new Error('The production sitemap did not contain any canonical site URLs.');
  }

  const response = await fetchImpl(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: site.host,
      key,
      keyLocation: `${site.origin}/${key}.txt`,
      urlList
    })
  });

  if (response.status !== 200 && response.status !== 202) {
    const detail = await response.text();
    throw new Error(`IndexNow rejected the notification: HTTP ${response.status} ${detail}`.trim());
  }

  return { status: response.status, submitted: urlList.length };
};
