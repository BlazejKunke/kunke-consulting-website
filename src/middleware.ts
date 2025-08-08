import { defineMiddleware } from 'astro:middleware';
import { generateNonce } from './utils/nonce';

export const onRequest = defineMiddleware(async (context, next) => {
  const nonce = generateNonce();
  context.locals.nonce = nonce;

  const res = await next();

  const csp = [
    // Baseline
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",

    // Scripts: nonce + strict-dynamic; keep hosts for legacy
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://www.googletagmanager.com https://www.google-analytics.com`,

    // Styles: no unsafe-inline; rely on nonce & external
    `style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com`,

    // Fonts
    "font-src 'self' https://fonts.gstatic.com",

    // XHR/fetch/beacon
    "connect-src 'self' formspree.io https://www.google-analytics.com https://region1.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://stats.g.doubleclick.net",

    // Images (incl. GA/GTM pixels)
    "img-src 'self' data: blob: https://www.google-analytics.com https://*.googletagmanager.com https://stats.g.doubleclick.net",

    // Frames you embed (GTM noscript + Tag Assistant)
    "frame-src https://www.googletagmanager.com",

    // Optional extras
    "worker-src 'self'",
    "upgrade-insecure-requests"
  ].join('; ');

  res.headers.set('Content-Security-Policy', csp);

  // Move these to real headers (meta won’t work)
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()'); // adjust if you need them
  // For legacy clickjacking protection alongside CSP:
  res.headers.set('X-Frame-Options', 'DENY');

  return res;
});
