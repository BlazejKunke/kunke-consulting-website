# CLAUDE.md

Guidance for Claude Code (claude.ai/code) working in this repository.

## What this business is

^Kunke Consulting sells two things:

1. **AI workshops** — in-person, hands-on training for teams
2. **AI advisory** — helping small and mid-sized companies work out where AI actually fits, and then implementing it

That is the whole public message. Keep it that way.

Błażej occasionally takes on other work — "Excel + AI", "Intro to Excel" — but does
**not** promote it publicly. Do not add Excel training, spreadsheet services or any
other side offering to the site, the metadata, the structured data or the copy. If a
task seems to call for it, ask first. Older versions of this site did market Excel
training; that positioning is retired, and `/ai-excel` now redirects to the homepage.

The audience is Polish SMEs, plus English-speaking equivalents. Delivery is based in
Poznań and in person by preference.

## Branding

The caret (`^`) in "^Kunke Consulting" and "^KC" is deliberate brand identity, not a
typo or a stray character. Preserve it everywhere — code, docs, and user-facing copy.

## Development commands

```bash
npm install      # install dependencies
npm run dev      # dev server at http://localhost:4321
npm run build    # production build to ./dist/
npm run preview  # preview the production build
```

There is no test command. `tests/availabilityDates.test.ts` exists but no runner is
configured, so it does not execute.

## Hosting and deploys

The site is on **Netlify**, publishing automatically from GitHub `main`. Pushing to
`main` deploys to production, usually within about 30 seconds.

Only two files control routing and headers in production:

- `public/_redirects` — all redirects. These are real 301s
- `public/_headers` — security headers

Redirects declared in `astro.config.mjs` are **not** real 301s. Astro builds them as
static meta-refresh pages: browsers follow them, search engines weight them less.
Anything that matters for SEO belongs in `public/_redirects`.

`SECURITY_HEADERS_GUIDE.md` keeps Apache and Nginx recipes for reference. They are
inactive. There is no `vercel.json` — one existed, held redirect rules that never ran
on Netlify, and was deleted in July 2026. Do not recreate it.

## How Blaze wants to work

He is a founder, not a developer, and does not read code.

- Make the change, commit it, push it to `main`. No feature branch, no pull request, no preview link, no "shall I proceed?" checkpoint
- Always build before pushing
- After pushing, wait for the deploy, check the affected live URLs yourself, and report what you verified in a short table. This replaces his review — it is not optional
- Lead with the outcome in plain language. Skip the Git mechanics unless asked
- Ask first only where reverting does not undo the damage: unrecoverable deletions, domain or DNS changes, or sending mail to real people

Redirects deserve particular care, because they fail invisibly: every page still loads
while search engines quietly collect 404s. That is exactly the failure mode "revert it
later" does not protect against.

## Architecture

Astro 5 static site, TypeScript in strict mode, no UI framework.

### Two page families

This is the most important structural fact, and the easiest thing to get wrong.

**Standalone pages** — `src/pages/index.astro` (Polish) and `src/pages/en/index.astro`
(English). These carry the current design and deliberately avoid both `BaseLayout` and
`global.css`, which would override their type scale (`global.css` forces
`section { width: min(90%, 72rem) }`, centred `h2`s and the Inter stack). Everything a
layout would normally provide — hreflang, Open Graph, GTM, JSON-LD, the cookie banner —
is inlined in each page. The two mirror each other: **change one, change the other.**

Their design tokens are `--kc-*`, declared per page: background `#faf9f6`, ink
`#12201b`, brand green `#0a4731`, body `#3a4a43`, muted `#52625a`. Type is a
Helvetica/Arial system stack with a monospace face for eyebrows and prices. Any
component dropped into these pages needs those tokens redeclared locally.

**`BaseLayout` pages** — `privacy-policy`, `thank-you`, `availability`,
`kalkulator-roi-ai`, `ai-readiness-score`. These use `BaseLayout.astro`, which supplies
`global.css`, Inter from Google Fonts, the CSP nonce, SEO meta and the language
switcher. This is the older look; it survives on utility pages where it does not matter.

**Blog** — `src/components/BlogShell.astro` owns the shared blog chrome: the `--kc-*`
tokens, the sticky header, the footer, the index hero and the featured card. Both blog
indexes and the article template render through it, so a change there hits all of them.
It follows the standalone pattern, not `BaseLayout`.

### Adding a component

Do not assume a shared layout. Check which family the target page belongs to first — a
component relying on `global.css` tokens will render unstyled on a standalone page.

### Content collections

Blog posts live in `src/content/blog/` as Markdown, validated by Zod in
`src/content/config.ts`:

- Required: `title`, `description`, `date`
- Optional: `seoTitle`, `author`, `tags`, `category`, `heroImage`
- `language` is `"pl"` or `"en"`, defaulting to `"pl"`

Routing is via `src/pages/blog/[slug].astro`. `src/utils/blog.ts` handles the index
filter chips and the tag fallback for posts without a `category`.

### Languages

**Polish and English only.** French and Dutch were retired in July 2026; `/fr/` and
`/nl/` 301 to `/en/`, as do `/uk/` and `/us/`.

`src/utils/locales.ts` is the single source for hreflang alternates, the language
switcher and the sitemap locales. Adding a language means editing that file, not just
adding a page.

### Security

- CSP assembled in `src/middleware.ts`, with a per-request nonce from `src/utils/nonce.ts`
- `checkOrigin` enabled in `astro.config.mjs`
- Security headers in `public/_headers`
- Inline scripts and styles need `nonce={nonce}`

## Contact

**There is no contact form.** The site is mailto-only, by Blaze's decision — every CTA
opens an email to `info@kunkeconsulting.pl`. Do not reintroduce a form without asking.

A `ContactForm.astro` wired to a Google Apps Script used to sit on the retired offer
pages. It was deleted on 2026-07-27 once nothing rendered it, but the setup is written
up in [`docs/contact-form-archive.md`](docs/contact-form-archive.md) — the endpoint, the
field names, the honeypot, the `/thank-you` redirect, and the command to recover the
original file from Git. Read that before ever rebuilding a form. Its endpoint and shared
secret were public for years, so both need rotating rather than reusing.

Social links are LinkedIn and YouTube. There is no Facebook link.

## Pages that are not marketing pages

- `/ai-info/` — plain structured text about the company, written for AI assistants and search systems rather than humans. No styling by design
- `/verify.html` — certificate verification, a static file in `public/`. Left on the old design deliberately; low priority
- `/availability/` — Blaze's live availability calendar, driven by `src/content/availability.ts`
- `/kalkulator-roi-ai/` and `/ai-readiness-score/` — interactive lead tools

## History worth knowing

In July 2026 the site was cut back hard. Ten thin offer pages built on the old design —
`/szkolenia-ai/`, `/ai-dla-firm/`, `/ai-workshop/`, `/konsulting-ai/`,
`/szkolenia-ai-poznan/`, `/szkolenia-ai-online/`, `/projekty-ai/`, `/konsultacja-ai/`,
plus two dated lead magnets — were retired and now 301 to the homepage, which carries
the whole offer. Several were AI-generated placeholders that were never good enough.

Do not recreate per-service or per-city landing pages without asking. The homepage is
deliberately the single offer page.

`/AIDlaFirm` and `/aidlafirm` are offline marketing shortlinks pointing at the homepage.
Check them after touching `public/_redirects` — nothing on the site links to them, so
breakage would go unnoticed.
