import pl from '../i18n/pl.json';
import en from '../i18n/en.json';

const languages = {
  pl,
  en,
};

export type Language = keyof typeof languages;
export type Dictionary = typeof pl;

export const getLangFromUrl = (url: URL): Language => {
  const [, lang] = url.pathname.split('/');
  if (lang in languages) return lang as Language;
  return 'pl';
};

export const useTranslations = (lang: Language) => {
  return function t(key: keyof Dictionary) {
    // This is a simplified implementation. A more robust solution would
    // handle nested keys. For this project, we'll keep it simple.
    // e.g., t('site.title')
    const keys = key.split('.');
    let value: any = languages[lang];
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Return the key itself if not found
      }
    }
    return value;
  };
};
