// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  security: {
    checkOrigin: true
  },
  vite: {
    define: {
      __CSP_NONCE__: JSON.stringify(Math.random().toString(36).substring(2, 15))
    }
  }
});
