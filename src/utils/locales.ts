// French and Dutch were retired in July 2026 — /fr/ and /nl/ now 301 to /en/.
// Dropping them here is what removes their hreflang alternates, their entries
// in the language switcher, and their sitemap locale declarations.
export const locales = [
  { code: 'pl', label: 'Polski', pathPrefix: '' },
  { code: 'en', label: 'English', pathPrefix: '/en' },
] as const;

export type LocaleCode = typeof locales[number]['code'];

export const localeLabels = locales.reduce(
  (labels, locale) => {
    labels[locale.code] = locale.label;
    return labels;
  },
  {} as Record<LocaleCode, string>
);

export const localeOgMap: Record<LocaleCode, string> = {
  pl: 'pl_PL',
  en: 'en_US',
};

export const localeHtmlLangMap: Record<LocaleCode, string> = {
  pl: 'pl',
  en: 'en',
};

// Bare codes, not region-qualified. The site targets Polish speakers and English
// speakers, not residents of Poland and the United States — /uk/ and /us/ both
// land on /en/, so declaring en-US would narrow it wrongly. astro.config.mjs
// declares the same two codes for the sitemap; the pair must stay in step.
export const localeHreflangMap: Record<LocaleCode, string> = {
  pl: 'pl',
  en: 'en',
};

export const defaultLocale: LocaleCode = 'pl';

type LocalizedRouteMap = Partial<Record<LocaleCode, string>>;

// The registry of pages that genuinely exist in more than one language. This is
// the only thing that grants a page hreflang tags — see buildHreflangLinks.
// Translating a page means adding it here; nothing else needs to change.
const localizedRoutes: Record<string, LocalizedRouteMap> = {
  '/': {
    pl: '/',
    en: '/en/',
  },
  '/blog': {
    pl: '/blog/',
    en: '/en/blog/',
  },
};

export const localePrefixes: Record<LocaleCode, string> = locales.reduce(
  (prefixes, locale) => {
    prefixes[locale.code] = locale.pathPrefix;
    return prefixes;
  },
  {} as Record<LocaleCode, string>
);

export const detectLocale = (pathname: string): LocaleCode => {
  for (const locale of locales) {
    const { code, pathPrefix } = locale;
    if (!pathPrefix) continue;
    if (pathname === pathPrefix || pathname.startsWith(`${pathPrefix}/`)) {
      return code as LocaleCode;
    }
  }
  return defaultLocale;
};

export const basePathFromLocale = (pathname: string): string => {
  for (const locale of locales) {
    const { pathPrefix } = locale;
    if (!pathPrefix) continue;
    if (pathname === pathPrefix) return '/';
    if (pathname.startsWith(`${pathPrefix}/`)) {
      const stripped = pathname.slice(pathPrefix.length) || '/';
      return stripped.startsWith('/') ? stripped : `/${stripped}`;
    }
  }
  return pathname || '/';
};

export const localizedPath = (basePath: string, locale: LocaleCode): string => {
  const normalizedBase = basePath.startsWith('/') ? basePath : `/${basePath}`;
  const prefix = localePrefixes[locale];
  if (!prefix) return normalizedBase;
  return `${prefix}${normalizedBase === '/' ? '' : normalizedBase}`;
};

const normalizePath = (path: string): string => {
  if (!path || path === '/') return '/';
  const withLeadingSlash = path.startsWith('/') ? path : `/${path}`;
  const withoutTrailingSlash = withLeadingSlash.replace(/\/+$/, '');
  return withoutTrailingSlash || '/';
};

const normalizeLocaleRootPath = (path: string): string => {
  const localeRootMatch = path.match(/^\/(en)\/?$/);
  if (!localeRootMatch) {
    return path;
  }

  return `/${localeRootMatch[1]}/`;
};

const normalizeHreflangPath = (path: string): string => {
  const [pathAndQuery = '', hashFragment = ''] = path.split('#', 2);
  const [rawPath = '', queryString = ''] = pathAndQuery.split('?', 2);

  const withLeadingSlash = `/${rawPath}`;
  const normalizedPath = withLeadingSlash.replace(/\/{2,}/g, '/');
  const localeRootNormalizedPath = normalizeLocaleRootPath(normalizedPath);

  const query = queryString ? `?${queryString}` : '';
  const hash = hashFragment ? `#${hashFragment}` : '';

  return `${localeRootNormalizedPath}${query}${hash}`;
};

const findExistingLocalizedPath = (basePath: string, locale: LocaleCode): string | undefined => {
  const routeMap = localizedRoutes[normalizePath(basePath)];
  if (!routeMap) return undefined;
  return routeMap[locale];
};

export const buildLanguageSwitcherUrls = (pathname: string, siteUrl: URL) => {
  const basePath = basePathFromLocale(pathname);
  return locales.map(({ code }) => {
    const localeCode = code as LocaleCode;
    const existingLocalized = findExistingLocalizedPath(basePath, localeCode);
    const fallbackPath = localizedPath('/', localeCode);
    const localized = existingLocalized ?? fallbackPath;
    return { locale: localeCode, href: new URL(localized, siteUrl).href };
  });
};

export interface HreflangLink {
  hreflang: string;
  href: string;
}

/**
 * The complete hreflang set for a page — alternates *and* x-default — or an
 * empty array when the page has no translation.
 *
 * Two rules make this hard to break, and both matter more than they look:
 *
 * 1. The set is derived from `localizedRoutes` alone, never from the page doing
 *    the asking. Every page in a group therefore emits a byte-identical list,
 *    so each one points back at the others by construction. Reciprocity is not
 *    something a future edit has to remember.
 *
 * 2. A page outside the registry gets nothing at all. Untranslated pages used
 *    to emit a self-reference plus an x-default aimed at the homepage, which
 *    quietly enrolled the homepage in a group it did not belong to. Google saw
 *    a one-way claim and discarded the group — the "no return-tag" error that
 *    was patched and lost four times (PRs #57, #74, #118, #121). The absence of
 *    tags on /privacy-policy/ and friends is deliberate. Do not add them back.
 *
 * scripts/check-hreflang.mjs enforces both against the built output.
 */
export const buildHreflangLinks = (pathname: string, siteUrl: URL): HreflangLink[] => {
  const basePath = basePathFromLocale(pathname);
  const routeMap = localizedRoutes[normalizePath(basePath)];
  if (!routeMap) return [];

  const translated = locales.filter(({ code }) => routeMap[code as LocaleCode]);
  if (translated.length < 2) return [];

  const links: HreflangLink[] = translated.map(({ code }) => {
    const localeCode = code as LocaleCode;
    const path = normalizeHreflangPath(routeMap[localeCode] as string);
    return { hreflang: localeHreflangMap[localeCode], href: new URL(path, siteUrl).href };
  });

  // x-default belongs to the group too, which is exactly why it must point at a
  // member of it rather than at whatever page seems like a sensible fallback.
  const defaultPath = routeMap[defaultLocale];
  if (defaultPath) {
    links.push({
      hreflang: 'x-default',
      href: new URL(normalizeHreflangPath(defaultPath), siteUrl).href,
    });
  }

  return links;
};
