// @ts-check
import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';

// https://astro.build/config
export default defineConfig({
  site: 'https://kunkeconsulting.pl',
  output: 'server',
  adapter: netlify({
    edgeMiddleware: true,
  }),
  security: {
    checkOrigin: true
  },
  vite: {
    define: {
      __CSP_NONCE__: JSON.stringify(Math.random().toString(36).substring(2, 15))
    }
  }
});
