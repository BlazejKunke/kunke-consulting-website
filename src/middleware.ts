import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const nonce = crypto.randomUUID();
  context.locals.nonce = nonce;

  const response = await next();

  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://www.googletagmanager.com`,
    `style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com`,
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' formspree.io https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com",
    "form-action 'self' formspree.io",
    "img-src 'self' data: https://*.google-analytics.com https://*.googletagmanager.com",
    "object-src 'none'",
    "base-uri 'self'",
    "frame-ancestors 'none'"
  ].join('; ');

  response.headers.set('Content-Security-Policy', csp);
  return response;
});