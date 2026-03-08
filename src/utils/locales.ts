export const locales = [
  { code: 'pl', label: 'Polski', pathPrefix: '' },
  { code: 'en', label: 'English (US & UK)', pathPrefix: '/en' },
  { code: 'fr', label: 'Français', pathPrefix: '/fr' },
  { code: 'nl', label: 'Nederlands', pathPrefix: '/nl' },
  { code: 'uk', label: 'United Kingdom (alias)', pathPrefix: '/uk', isAlias: true },
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
  fr: 'fr_FR',
  nl: 'nl_NL',
  uk: 'en_GB',
};

export const defaultLocale: LocaleCode = 'pl';

type LocalizedRouteMap = Partial<Record<LocaleCode, string>>;

const localizedRoutes: Record<string, LocalizedRouteMap> = {
  '/': {
    pl: '/',
    en: '/en/',
    fr: '/fr/',
    nl: '/nl/',
    uk: '/uk/',
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
  const localeRootMatch = path.match(/^\/(en|fr|nl|uk)\/?$/);
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
  return locales.filter(({ isAlias }) => !isAlias).map(({ code }) => {
    const localeCode = code as LocaleCode;
    const existingLocalized = findExistingLocalizedPath(basePath, localeCode);
    const fallbackPath = localizedPath('/', localeCode);
    const localized = existingLocalized ?? fallbackPath;
    return { locale: localeCode, href: new URL(localized, siteUrl).href };
  });
};

export const buildHreflangUrls = (pathname: string, siteUrl: URL) => {
  const basePath = basePathFromLocale(pathname);
  const currentLocale = detectLocale(pathname);

  return locales.flatMap(({ code }) => {
    const localeCode = code as LocaleCode;

    if (localeCode === currentLocale) {
      const existingLocalized = findExistingLocalizedPath(basePath, currentLocale);
      const selfPath = existingLocalized ?? localizedPath(basePath, currentLocale);
      const normalizedSelfPath = normalizeHreflangPath(selfPath);
      return [{ locale: localeCode, href: new URL(normalizedSelfPath, siteUrl).href }];
    }

    const existingLocalized = findExistingLocalizedPath(basePath, localeCode);
    if (!existingLocalized) {
      return [];
    }

    const normalizedPath = normalizeHreflangPath(existingLocalized);
    return [{ locale: localeCode, href: new URL(normalizedPath, siteUrl).href }];
  });
};
