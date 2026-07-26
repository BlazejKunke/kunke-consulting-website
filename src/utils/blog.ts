// Shared helpers for the blog index pages and the article template.
//
// The redesign (Claude Design project "Blog ^Kunke Consulting.dc.html") groups
// posts under four broad categories shown as filter chips. The existing `tags`
// are free-form and per-post SEO keywords, so categories live in their own
// frontmatter field with a small tag-based fallback for posts that predate it.

export type BlogCategory = 'implementation' | 'strategy' | 'tools' | 'practice';

export const blogCategories: BlogCategory[] = ['implementation', 'strategy', 'tools', 'practice'];

type Labels = Record<BlogCategory | 'all', string>;

const categoryLabels: Record<'pl' | 'en', Labels> = {
  pl: {
    all: 'Wszystkie',
    implementation: 'Wdrożenia',
    strategy: 'Strategia',
    tools: 'Narzędzia',
    practice: 'Praktyka'
  },
  en: {
    all: 'All',
    implementation: 'Implementation',
    strategy: 'Strategy',
    tools: 'Tools',
    practice: 'Practice'
  }
};

export const categoryLabel = (category: BlogCategory | 'all', language: 'pl' | 'en'): string =>
  categoryLabels[language][category];

/* Fallback for posts without an explicit `category:`. Ordered — the first
   matching tag wins — so "Wdrożenia AI" beats "Strategia AI" on a post tagged
   with both, which matches how those posts read. */
const tagFallback: Array<[BlogCategory, RegExp]> = [
  ['implementation', /wdro[żz]en|implementation|automatyzacj|roi/i],
  ['tools', /chatgpt|gpt|claude|fable|mythos|anthropic|openai|excel|narz[eę]dzi|livestream|image generation/i],
  ['strategy', /strategi|strategy|konsulting|consulting|doradztwo|leadership|zarz[ąa]dzanie|transformacj|ekonomi/i],
  ['practice', /warsztat|workshop|szkoleni|training|praktyk|zesp[óo][ł]|team/i]
];

export const resolveCategory = (data: { category?: BlogCategory; tags?: string[] }): BlogCategory => {
  if (data.category) return data.category;

  const haystack = (data.tags ?? []).join(' ');
  for (const [category, pattern] of tagFallback) {
    if (pattern.test(haystack)) return category;
  }
  return 'practice';
};

/* 200 words a minute is the usual reading-time constant; the markdown source is
   close enough to the rendered text once syntax characters are stripped. */
export const readingMinutes = (body: string): number => {
  const words = body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#*_>[\]()!`|-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;

  return Math.max(1, Math.round(words / 200));
};

export const readingTimeLabel = (body: string, language: 'pl' | 'en'): string => {
  const minutes = readingMinutes(body);
  return language === 'en' ? `${minutes} min read` : `${minutes} min czytania`;
};

/* One card in the blog index grid. Lives here rather than in the component so
   the index pages can import the type without importing from a .astro file. */
export interface GridPost {
  href: string;
  title: string;
  excerpt: string;
  date: string;
  isoDate: string;
  category: string;
  categoryLabel: string;
  image?: string;
}

export const formatDate = (date: Date, language: 'pl' | 'en'): string =>
  language === 'en'
    ? date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : date.toLocaleDateString('pl-PL');
