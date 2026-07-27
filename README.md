# ^Kunke Consulting

The website for ^Kunke Consulting — **AI workshops and AI advisory for small and
mid-sized companies**, based in Poznań and working across Poland in Polish and English.

Live at [kunkeconsulting.pl](https://kunkeconsulting.pl).

## Branding: the `^` symbol

The caret in "^Kunke Consulting" and the shorthand "^KC" is an intentional part of the
brand identity. It is **not** a stray character or a typo. Keep it in every reference to
the brand, in the site and in the documentation.

## What the site contains

- **Homepage** in Polish (`/`) and English (`/en/`) — carries the entire offer: workshops, implementation and longer-term projects
- **Blog** in both languages, with articles on practical AI adoption
- **AI Readiness Score** and **ROI calculator** — interactive tools for prospective clients
- **Availability calendar** — Blaze's current open dates
- Privacy policy, certificate verification, and a plain-text company summary at `/ai-info/` written for AI assistants

Contact is by email throughout. There is no contact form.

## Tech stack

- [Astro 5](https://astro.build/) — static site generation, no UI framework
- TypeScript in strict mode
- Astro Content Collections with Zod validation for the blog
- Hosted on [Netlify](https://netlify.com), deployed automatically from `main`

## Commands

| Command | Action |
| :------ | :----- |
| `npm install` | Install dependencies |
| `npm run dev` | Dev server at `localhost:4321` |
| `npm run build` | Build to `./dist/` |
| `npm run preview` | Preview the production build |
| `npm run optimize-images` | Regenerate WebP versions of images in `public/images/` |

## Project structure

```text
/
├── public/
│   ├── _redirects        # all production redirects (real 301s)
│   ├── _headers          # security headers
│   ├── images/
│   └── styles/global.css # used by BaseLayout pages only
├── src/
│   ├── pages/            # routes; index.astro and en/index.astro are standalone
│   ├── components/       # BlogShell owns the blog chrome; BaseLayout the utility pages
│   ├── content/blog/     # Markdown posts
│   └── utils/locales.ts  # single source for languages and hreflang
└── astro.config.mjs
```

Two things to know before editing:

**The homepages are standalone.** `src/pages/index.astro` and `src/pages/en/index.astro`
carry their own styling and skip both `BaseLayout` and `global.css` on purpose. They
mirror each other — change one, change the other.

**Redirects go in `public/_redirects`.** Redirects declared in `astro.config.mjs` build
as meta-refresh pages rather than real 301s, which search engines weight less.

Further guidance for AI coding agents is in [CLAUDE.md](CLAUDE.md) and
[AGENTS.md](AGENTS.md).
