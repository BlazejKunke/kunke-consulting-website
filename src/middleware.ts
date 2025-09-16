// src/middleware.ts
import { defineMiddleware } from 'astro:middleware';
import { generateNonce } from './utils/nonce';

export const onRequest = defineMiddleware(async (context, next) => {
  const isDev = import.meta.env.DEV; // true when running npm run dev

  const nonce = generateNonce();
  context.locals.nonce = nonce;

  const res = await next();

  if (isDev) {
    // Local preview: allow Astro/Vite helper scripts and websocket connections
    const scriptSources = [
      "'self'",
      "'unsafe-inline'",
      "'unsafe-eval'",
      'https://www.googletagmanager.com',
      'https://www.google-analytics.com'
    ];

    const styleSources = [
      "'self'",
      "'unsafe-inline'",
      'https://fonts.googleapis.com'
    ];

    const connectSources = [
      "'self'",
      'ws://localhost:*',
      'http://localhost:*',
      'https://script.google.com',
      'https://script.googleusercontent.com',
      'https://www.google-analytics.com',
      'https://region1.google-analytics.com',
      'https://*.analytics.google.com',
      'https://*.googletagmanager.com',
      'https://stats.g.doubleclick.net'
    ];

    const formActionSources = ["'self'", 'https://script.google.com'];

    const devCsp = [
      "default-src 'self'",
      `script-src ${scriptSources.join(' ')}`,
      `style-src ${styleSources.join(' ')}`,
      "img-src 'self' data: blob: https://www.google-analytics.com https://*.googletagmanager.com https://stats.g.doubleclick.net",
      "font-src 'self' https://fonts.gstatic.com",
      `connect-src ${connectSources.join(' ')}`,
      `form-action ${formActionSources.join(' ')}`,
      "frame-src https://www.googletagmanager.com"
    ].join('; ');

    res.headers.set('Content-Security-Policy', devCsp);
  } else {
    const scriptSources = [
      "'self'",
      `'nonce-${nonce}'`,
      "'strict-dynamic'",
      'https://www.googletagmanager.com',
      'https://www.google-analytics.com'
    ];

    const styleSources = [
      "'self'",
      `'nonce-${nonce}'`,
      'https://fonts.googleapis.com'
    ];

    const connectSources = [
      "'self'",
      'https://script.google.com',
      'https://script.googleusercontent.com',
      'https://www.google-analytics.com',
      'https://region1.google-analytics.com',
      'https://*.analytics.google.com',
      'https://*.googletagmanager.com',
      'https://stats.g.doubleclick.net'
    ];

    const formActionSources = ["'self'", 'https://script.google.com'];

    const prodCsp = [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      `script-src ${scriptSources.join(' ')}`,
      `style-src ${styleSources.join(' ')}`,
      "font-src 'self' https://fonts.gstatic.com",
      `connect-src ${connectSources.join(' ')}`,
      `form-action ${formActionSources.join(' ')}`,
      "img-src 'self' data: blob: https://www.google-analytics.com https://*.googletagmanager.com https://stats.g.doubleclick.net",
      "frame-src https://www.googletagmanager.com",
      "worker-src 'self'",
      "upgrade-insecure-requests"
    ].join('; ');

    res.headers.set('Content-Security-Policy', prodCsp);
  }

  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.headers.set('X-Frame-Options', 'DENY');

  return res;
});
