// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const sitemapExcludedPaths = [
  '/thank-you',
  '/AIDlaFirm',
  '/aidlafirm',
  '/ai-excel',
  '/new',
  '/us',
  '/zespol',
  '/team',
  '/uk',
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
          en: 'en-US',
          fr: 'fr-FR',
          nl: 'nl-NL'
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
      destination: '/szkolenia-ai'
    },
    '/new': {
      status: 301,
      destination: '/'
    },
    '/us': {
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
