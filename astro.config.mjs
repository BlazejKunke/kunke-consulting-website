// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const sitemapExcludedPaths = [
  '/thank-you',
  '/redesigned',
  '/AIDlaFirm',
  '/aidlafirm',
  '/ai-excel',
  '/new',
  '/us',
  '/zespol',
  '/team',
  '/uk',
  // Retired July 2026; the redirect stubs must not resurface in the sitemap.
  '/fr/',
  '/nl/',
];

// https://astro.build/config
export default defineConfig({
  site: 'https://kunkeconsulting.pl',
  integrations: [
    sitemap({
      // These codes end up in the sitemap's own hreflang alternates, so they
      // must match localeHreflangMap in src/utils/locales.ts. They said pl-PL
      // and en-US while the HTML said pl-PL and en — three conventions across
      // two files, for a site that targets languages rather than countries.
      i18n: {
        defaultLocale: 'pl',
        locales: {
          pl: 'pl',
          en: 'en'
        }
      },
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      filter: (page) => !sitemapExcludedPaths.some((path) => page.includes(path))
    })
  ],
  redirects: {
    '/avaliability': {
      status: 301,
      destination: '/availability'
    },
    '/ai-excel': {
      status: 301,
      destination: '/'
    },
    '/new': {
      status: 301,
      destination: '/'
    },
    '/redesigned': {
      status: 301,
      destination: '/'
    },
    '/us': {
      status: 301,
      destination: '/en/'
    },
    // French and Dutch retired July 2026. English is the closest page a
    // visitor from either can still read, same as /uk/ and /us/.
    '/fr': {
      status: 301,
      destination: '/en/'
    },
    '/nl': {
      status: 301,
      destination: '/en/'
    },
    '/uk': {
      status: 301,
      destination: '/en/'
    },
    '/zespol': {
      status: 301,
      destination: '/#zespol'
    },
    '/team': {
      status: 301,
      destination: '/en/#team'
    },
  },
  security: {
    checkOrigin: true
  },
  vite: {
    define: {
      __CSP_NONCE__: JSON.stringify(Math.random().toString(36).substring(2, 15))
    }
  }
});
