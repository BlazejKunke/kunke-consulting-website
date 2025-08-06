import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const nonce = crypto.randomUUID();
  context.locals.nonce = nonce;

  const response = await next();

  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://www.googletagmanager.com https://www.google-analytics.com https://ssl.google-analytics.com https://tagmanager.google.com`,
    `style-src 'self' 'nonce-${nonce}' 'unsafe-inline' https://fonts.googleapis.com https://tagmanager.google.com`,
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' formspree.io https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://region1.google-analytics.com https://analytics.google.com",
    "form-action 'self' formspree.io",
    "img-src 'self' data: blob: https://*.google-analytics.com https://*.googletagmanager.com https://www.google.com https://googleads.g.doubleclick.net https://www.google.pl",
    "frame-src https://www.googletagmanager.com",
    "object-src 'none'",
    "base-uri 'self'",
    "frame-ancestors 'none'"
  ].join('; ');

  response.headers.set('Content-Security-Policy', csp);
  
  // Debug: Log CSP to console in development
  if (import.meta.env.DEV) {
    console.log('CSP Applied:', csp);
  }
  
  return response;
});