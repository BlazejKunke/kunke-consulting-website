# Instructions for Codex

## Communication

- Błażej “Blaze” Kunke is a business and economics founder with basic practical technology knowledge, not a developer.
- Lead with the outcome and use plain language. Avoid command-line jargon unless it is required to explain a genuine blocker.
- Do not ask Blaze to choose installation tools or authentication methods when Codex can safely make and execute the normal choice.
- If setup is safe and within the requested task, handle it. If it needs meaningful new permission or carries material risk, explain that briefly and ask only for the specific approval required.

## Website publishing

- Preserve the existing repository and deployment workflow. Netlify publishes the live site from GitHub `main`.
- Reuse existing authorization before requesting a login or installation.
- Normal Git access uses the HTTPS remote and credentials stored in the macOS Keychain. Try normal `git fetch` and `git push` first.
- The GitHub CLI is an optional fallback. Its login is separate from normal Git access; a signed-out CLI does not mean GitHub access is unavailable.
- Never install GitHub tooling or request reauthorization solely because the optional CLI is unavailable or signed out.
- If GitHub reauthorization is truly unavoidable, use Blaze’s personal Chrome profile and explain the reason in plain language.

### Ship straight to `main`

Blaze decided this in July 2026, replacing the earlier branch-and-pull-request
rule. He is the sole owner of this site, does not read code, and treats Git
history as the safety net: a bad change gets reverted, not prevented.

- When Blaze asks for a change, make it, commit it, and push it to `main`. Do not create a branch, open a pull request, or ask him to approve a diff.
- Do not offer Netlify deploy previews or ask him to review anything before it goes live. He checks the live site like any other visitor.
- Still run the build before pushing. Speed is the goal; shipping something that does not compile is not speed.
- After pushing, wait for the Netlify deploy and verify the affected public URLs yourself, then report what you checked. This replaces his review — it does not get skipped.
- Ask first only where reverting does not actually undo the damage: deleting things not recoverable from Git, anything touching the domain or DNS, or anything sending mail to real people. Ordinary page and content changes are never in this category.

## English website

- Maintain one English version at `/en/`; `/uk/` and `/us/` redirect to it.
- Use American English for English copy.
- `/en/` is an English translation of the Polish homepage, not a separate global offer. It mirrors the Polish homepage `src/pages/index.astro` — same design, section order and mailto-only contact — and its copy, pricing and positioning should track the Polish page. Blaze decided this in July 2026, replacing the earlier worldwide-English positioning.
- Show prices in PLN, matching the Polish page. The earlier `$1,500 USD` / priced-on-request rule no longer applies.
- The offer is in-person training based in Poznań, serving Poland. Keep metadata consistent with that (`areaServed: 'PL'`); do not restore a worldwide service area while the visible copy describes in-person delivery in Poland.
- `src/pages/en/index.astro` is standalone: it does not use a shared layout or `global.css`, and carries its own hreflang, Open Graph, GTM, JSON-LD and cookie-banner tokens. Components that rely on `global.css` design tokens need those tokens redeclared on the page.

## Retired languages

- French and Dutch were retired in July 2026. `/fr/` and `/nl/` 301 to `/en/`; their pages and their sixteen dedicated components are deleted. Do not recreate them.
- `src/utils/locales.ts` is the single source for hreflang alternates, the language switcher and the sitemap locales — the site now declares Polish and English only. Adding a language means adding it there, not just adding a page.
- The French PDFs in `public/` (`Transformation-IA-PragmatIQ-Expertise-et-Performance.pdf`, `PytAInIQ-Report-French.pdf`) are deliberately kept and still downloadable, in case they were shared directly. They are no longer linked from any page.

## Blog

- The blog runs on the homepage design, imported from the Claude Design project "Blog ^Kunke Consulting.dc.html" in July 2026. Like the homepages it avoids `BaseLayout` and `global.css`, which would override the type scale.
- `src/components/BlogShell.astro` owns the shared chrome: the `--kc-*` tokens, the sticky header, the one-line footer, the index hero and the featured card. Both blog indexes and the article template render through it, so a change there hits all of them.
- `src/pages/blog/index.astro` (Polish) and `src/pages/en/blog/index.astro` (English) mirror each other — keep them in sync. Articles themselves are shared and live at `/blog/<slug>/` in both languages, rendered by `src/pages/blog/[slug].astro`.
- Blaze chose homepage chrome over the design's own dark green PL/EN strip and four-column footer, so blog and homepage match. The design's newsletter block is left out until there is a list to sign people up to.
- Posts carry a `category:` (`implementation` / `strategy` / `tools` / `practice`) that drives the index filter chips; `src/utils/blog.ts` maps it to Polish and English labels and falls back to a tag lookup when the field is missing.
- Do not repeat the post title as an `# H1` in the markdown body — the title band already renders it, and a second H1 hurts SEO.
