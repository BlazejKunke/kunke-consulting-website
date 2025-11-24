export const locales = [
  { code: 'pl', label: 'Polski', pathPrefix: '' },
  { code: 'en', label: 'English', pathPrefix: '/en' },
  { code: 'fr', label: 'Français', pathPrefix: '/fr' },
  { code: 'nl', label: 'Nederlands', pathPrefix: '/nl' },
  { code: 'uk', label: 'United Kingdom', pathPrefix: '/uk' },
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
  en: 'en_GB',
  fr: 'fr_FR',
  nl: 'nl_NL',
  uk: 'en_GB',
};

export const defaultLocale: LocaleCode = 'pl';

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

export const buildAlternateUrls = (pathname: string, siteUrl: URL) => {
  const basePath = basePathFromLocale(pathname);
  return locales.map(({ code }) => {
    const localized = localizedPath(basePath, code as LocaleCode);
    return { locale: code as LocaleCode, href: new URL(localized, siteUrl).href };
  });
};
