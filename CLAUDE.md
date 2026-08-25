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

`npm test` runs `node --test` with type stripping over `tests/*.test.ts`.

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
- Ask first only where reverting does not undo the damage: unrecoverable deletions, domain or DNS changes, or sending mail to real people

### How to write to him

**Short, plain, and about what happens next.** He asked for this explicitly on
2026-07-31, after a set of answers that were long, technical and hard to act on. If a
reply is more than a few short paragraphs, it is probably wrong for him.

- **Lead with the outcome, in the first sentence.** What changed, what it means for the
  business. Not what was investigated, not how it works
- **Default to a paragraph.** Add a short table only for live-URL verification, where it
  genuinely reads faster. Avoid stacked headings, nested bullets and long option surveys
- **No mechanics unless asked** — no file paths, function names, Git commands, code or
  config in the reply. Those belong in the commit message and in `docs/`, which is where
  the detail from a task should go. He does not read code, and will not read a wall of it
- **Say plainly when something is not worth much.** He asked "so my page shows higher on
  Google?" about the hreflang work, and the honest answer was no — it clears warnings and
  stops a recurring bug. That answer was more useful than a defence of the work
- **End with the decision or the action, if there is one**, and make it one line. What he
  should do, or what you need from him
- Detail is available on request. Give the headline first and let him ask for more,
  rather than pre-empting every question

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

**`BaseLayout` pages** — `privacy-policy`, `thank-you`, `availability`. These use
`BaseLayout.astro`, which supplies `global.css`, Inter from Google Fonts, SEO meta and
the language switcher. This is the older look; it survives on utility pages where it
does not matter. It is not a place to put anything a visitor is meant to convert on —
the two lead magnets were archived in July 2026 partly because being on this design sent
people from the redesigned site to a page that looked like a different company.

**Blog** — `src/components/BlogShell.astro` owns the shared blog chrome: the `--kc-*`
tokens, the sticky header, the footer, the index hero and the featured card. Both blog
indexes and the article template render through it, so a change there hits all of them.
It follows the standalone pattern, not `BaseLayout`.

### Adding a component

Do not assume a shared layout. Check which family the target page belongs to first — a
component relying on `global.css` tokens will render unstyled on a standalone page.

### WebMCP (Site Tools)

Both homepages register three read-only tools for AI agents running in the
visitor's browser — `get_services`, `recommend_service`, `prepare_inquiry`. They
render nothing and change nothing visually, and a browser without
`document.modelContext` gets no tools and no behaviour change.

`src/utils/webmcp.ts` repeats the homepage `packages` arrays **verbatim, prices
included**. Change a package name, bullet or price on either homepage and you
must change it there too, or an agent will quote a number the page does not
show. `npm test` pins all six price strings and fails if only one side moves.
[`docs/webmcp.md`](docs/webmcp.md) has the rest.

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

**hreflang: a page gets tags only if it is registered as translated.** The
`localizedRoutes` map in `locales.ts` lists the pages that genuinely exist in more than
one language — today just `/` and `/blog/`. `buildHreflangLinks` builds the whole set,
x-default included, from that map alone, so every page in a group emits an identical
list and points back at the others by construction. A page outside the map gets nothing.

That absence is deliberate. Untranslated pages used to emit a self-reference plus an
x-default aimed at the homepage, which enrolled the homepage in a group it was not part
of; Google saw a one-way claim and discarded the group. Ahrefs reported it as "missing
reciprocal hreflang". It was fixed and lost four times (PRs #57, #74, #118, #121)
because each fix patched the flagged pages instead of the rule.

- Do **not** hand-write `<link rel="alternate" hreflang=...>` in a page. Register the
  pair in `locales.ts` instead
- Language codes are bare `pl` and `en`, in the HTML and in the sitemap i18n config in
  `astro.config.mjs`. The site targets languages, not countries — `/uk/` and `/us/` both
  land on `/en/`. Keep the two files in step
- `scripts/check-hreflang.mjs` reads `dist/` and fails on a broken cluster, an
  unreciprocated claim, an out-of-group x-default or an unexpected code. It runs in CI;
  run it locally with `npm run check:hreflang` after a build
- Blog posts emit no hreflang. Some PL/EN pairs are genuine translations, but nothing in
  the frontmatter records that. Linking them needs a new content field, not hand-written
  tags

### Security

**Every security header, including the CSP, lives in `public/_headers`. That file is
the only one that reaches visitors.** The build is static with no adapter, so
`src/middleware.ts` runs at build time and the headers it sets are thrown away. It
claimed to provide a CSP for months and never did; two AI security reviews read it and
believed it. `src/middleware.ts` and `src/utils/nonce.ts` are dead and should be
deleted. `checkOrigin` in `astro.config.mjs` is SSR-only and does nothing here.

- The CSP is enforced, not report-only. To roll it back in a hurry, rename the header
  to `Content-Security-Policy-Report-Only` in `public/_headers` and push
- It allows `'unsafe-inline'` for scripts on purpose: a static site cannot issue a
  per-request nonce, and pinning hashes would break analytics silently on the next
  edit. Do **not** add `nonce={nonce}` to anything — nonces were removed in July 2026
- Adding a third-party script or tag means adding its host to `_headers`, or the
  browser will block it. This includes new tags added inside the GTM container
- Inline `<script>` blocks that must stay inline need `is:inline`, otherwise Astro
  bundles them as modules and the timing changes

## Contact

**There is no contact form.** The site is mailto-only, by Blaze's decision — every CTA
opens an email to `info@kunkeconsulting.pl`. Do not reintroduce a form without asking.

A `ContactForm.astro` wired to a Google Apps Script used to sit on the retired offer
pages. It was deleted on 2026-07-27 once nothing rendered it, but the setup is written
up in [`docs/contact-form-archive.md`](docs/contact-form-archive.md) — the endpoint, the
field names, the honeypot, the `/thank-you` redirect, and the command to recover the
original file from Git. Read that before ever rebuilding a form. Its endpoint and shared
secret were public for years, so both need rotating rather than reusing.

A second form outlived the first: `/ai-readiness-score/` posted visitor emails to the
same public Apps Script endpoint, with the same fake `FormSecret`, until it was removed
on 2026-07-27. That page was archived four days later. **The site collects no personal
data through any form.**

Social links are LinkedIn, YouTube and — despite what this file said until July 2026 —
Facebook, pointing at Błażej's personal profile from `SiteFooter.astro`,
`thank-you.astro` and the `sameAs` arrays in both homepages and `BaseLayout`. Whether it
belongs on a business site is Blaze's call, not a thing to change silently.

## Pages that are not marketing pages

- `/ai-info/` — plain structured text about the company, written for AI assistants and search systems rather than humans. No styling by design
- `/verify.html` — certificate verification, a static file in `public/`. Left on the old design deliberately; low priority
- `/availability/` — Blaze's live availability calendar, driven by `src/content/availability.ts`

**There are no interactive lead tools.** `/kalkulator-roi-ai/` and `/ai-readiness-score/`
were archived on 2026-07-31 and 301 to the homepage. Both were on the old design, so
every link into them threw a visitor from the redesigned site onto a page that looked
like a different company; the readiness test also had zero inbound internal links and
was reachable only by typing the URL. Blaze expects to rebuild **one** of them in the
new design — the ROI calculator is the better-built candidate, but the analytics should
decide. [`docs/lead-magnets-archive.md`](docs/lead-magnets-archive.md) holds the ROI
model's constants, both tools' history and the commands to recover the code from Git.
Read it before rebuilding either, and do not simply restore the old files.

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
