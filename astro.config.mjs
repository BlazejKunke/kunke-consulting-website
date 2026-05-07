// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const sitemapExcludedPaths = [
  '/thank-you',
  '/AIDlaFirm',
  '/aidlafirm',
  '/ai-excel',
  '/us',
];

// https://astro.build/config
export default defineConfig({
  site: 'https://kunkeconsulting.pl',
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'pl',
        locales: {
          pl: 'pl-PL',
          en: 'en',
          fr: 'fr-FR',
          nl: 'nl-NL',
          uk: 'en-GB'
        }
      },
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      filter: (page) => !sitemapExcludedPaths.some((path) => page.includes(path))
    })
  ],
  redirects: {
    '/ai-excel': {
      status: 301,
      destination: '/szkolenia-ai'
    },
    '/us': {
      status: 301,
      destination: '/en'
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
