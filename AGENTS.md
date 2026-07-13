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

- Maintain one global English version at `/en/`; `/uk/` redirects to it.
- Use American English for global English copy.
- Show AI team training from `$1,500 USD`; AI implementation and ongoing projects are priced on request unless Blaze explicitly changes this.
