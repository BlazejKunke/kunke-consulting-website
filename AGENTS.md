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
- Prefer the connected Codex GitHub app for pull request creation, updates, checks, and merges.
- The GitHub CLI is an optional fallback. Its login is separate from normal Git access; a signed-out CLI does not mean GitHub access is unavailable.
- Never install GitHub tooling or request reauthorization solely because the optional CLI is unavailable or signed out.
- Before publishing: inspect the diff, isolate the intended files, run the relevant build/checks, and present a preview when requested.
- After approval: push a dedicated branch, use a pull request for meaningful site changes, wait for Netlify checks, merge, and verify the live public pages.
- If GitHub reauthorization is truly unavoidable, use Blaze’s personal Chrome profile and explain the reason in plain language.

## English website

- Maintain one English version at `/en/`; `/uk/` and `/us/` redirect to it.
- Use American English for English copy.
- `/en/` is an English translation of the Polish homepage, not a separate global offer. It mirrors `src/pages/redesigned.astro` — same design, section order and mailto-only contact — and its copy, pricing and positioning should track the Polish page. Blaze decided this in July 2026, replacing the earlier worldwide-English positioning.
- Show prices in PLN, matching the Polish page. The earlier `$1,500 USD` / priced-on-request rule no longer applies.
- The offer is in-person training based in Poznań, serving Poland. Keep metadata consistent with that (`areaServed: 'PL'`); do not restore a worldwide service area while the visible copy describes in-person delivery in Poland.
- `src/pages/en/index.astro` is standalone: it does not use a shared layout or `global.css`, and carries its own hreflang, Open Graph, GTM, JSON-LD and cookie-banner tokens. Components that rely on `global.css` design tokens need those tokens redeclared on the page.
