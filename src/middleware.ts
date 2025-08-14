// src/middleware.ts
import { defineMiddleware } from 'astro:middleware';
import { generateNonce } from './utils/nonce';

const DEFAULT_LANG = 'pl';
const OTHER_LANG = 'en';
const LANG_COOKIE_NAME = 'lc';

// This maps Polish slugs to their English counterparts.
const slugTranslations: Record<string, string> = {
  'konsulting-ai': 'ai-consulting',
  'szkolenia-ai-online': 'ai-training-online',
  'szkolenia-ai-poznan': 'ai-training-poznan',
  'szkolenia-ai': 'ai-training',
  'zespol': 'team',
  // blog routes are handled by their directory structure, but we can add more if needed
};

const getTranslatedPath = (pathname: string, lang: string): string => {
  if (lang === DEFAULT_LANG) {
    // We are translating from English to Polish
    const slug = pathname.split('/').pop() || '';
    const plSlug = Object.keys(slugTranslations).find(key => slugTranslations[key] === slug);
    return plSlug ? `/${plSlug}` : '/';
  } else {
    // We are translating from Polish to English
    const slug = pathname.split('/').pop() || '';
    const enSlug = slugTranslations[slug];
    return enSlug ? `/${OTHER_LANG}/${enSlug}` : `/${OTHER_LANG}`;
  }
};


export const onRequest = defineMiddleware(async (context, next) => {
  const { url, request, cookies, redirect } = context;
  const pathname = url.pathname;

  // 1. Generate nonce for CSP - must happen on every request
  const nonce = generateNonce();
  context.locals.nonce = nonce;

  // --- Start i18n Logic ---

  // 2. Ignore assets and API routes
  if (pathname.includes('.') || pathname.startsWith('/api/')) {
    return next();
  }

  // 3. Bot detection: Never redirect bots
  const userAgent = request.headers.get('user-agent')?.toLowerCase() || '';
  const isBot = /bot|crawl|spider|slurp|ia_archiver/i.test(userAgent);
  if (isBot) {
    return next();
  }

  // 4. Handle manual language override with ?lang=...
  const langParam = url.searchParams.get('lang');
  if (langParam === DEFAULT_LANG || langParam === OTHER_LANG) {
    const targetPath = pathname.startsWith(`/${OTHER_LANG}`)
      ? getTranslatedPath(pathname, DEFAULT_LANG)
      : pathname;

    const finalPath = langParam === OTHER_LANG
      ? (pathname.startsWith(`/${OTHER_LANG}`) ? pathname : getTranslatedPath(pathname, OTHER_LANG))
      : targetPath;

    cookies.set(LANG_COOKIE_NAME, langParam, { path: '/', maxAge: 60 * 60 * 24 * 180, sameSite: 'lax' });
    if (finalPath !== pathname) {
      return redirect(finalPath, 302);
    }
  }

  // 5. Check for language cookie
  const langCookie = cookies.get(LANG_COOKIE_NAME)?.value;
  if (langCookie) {
    // If user has a cookie, respect it and do nothing.
    return next();
  }

  // 6. One-time language detection from headers
  const acceptLanguage = request.headers.get('accept-language');
  const preferredLang = acceptLanguage?.split(',')[0]?.split('-')[0].toLowerCase();

  const isOnPlPage = !pathname.startsWith(`/${OTHER_LANG}/`);

  if (preferredLang !== DEFAULT_LANG && isOnPlPage) {
    const targetPath = getTranslatedPath(pathname, OTHER_LANG);
    // Persist the choice
    cookies.set(LANG_COOKIE_NAME, OTHER_LANG, { path: '/', maxAge: 60 * 60 * 24 * 180, sameSite: 'lax' });
    return redirect(targetPath, 302);
  }

  // --- End i18n Logic ---

  const res = await next();

  // --- Start CSP Logic ---
  const csp = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://www.googletagmanager.com https://www.google-analytics.com`,
    `style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com`,
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' formspree.io https://www.google-analytics.com https://region1.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://stats.g.doubleclick.net",
    "img-src 'self' data: blob: https://www.google-analytics.com https://*.googletagmanager.com https://stats.g.doubleclick.net",
    "frame-src https://www.googletagmanager.com",
    "worker-src 'self'",
    "upgrade-insecure-requests"
  ].join('; ');

  res.headers.set('Content-Security-Policy', csp);
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.headers.set('X-Frame-Options', 'DENY');

  return res;
});
