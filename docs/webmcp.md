# WebMCP (Site Tools)

Added 2026-08-26. The two homepages offer three tools to an AI agent running in
the visitor's browser — ChatGPT's Site Tools, Chrome's WebMCP, and anything else
that implements the same draft standard. Nothing about the page a human sees
changed.

References followed: the [WebMCP draft
spec](https://webmachinelearning.github.io/webmcp/), the [Chrome
guide](https://developer.chrome.com/docs/ai/webmcp) and [OpenAI Site
Tools](https://learn.chatgpt.com/docs/webmcp).

## What an agent can do

| Tool | Does | Read-only |
| --- | --- | --- |
| `get_services` | Lists the three packages with their bullet lists, prices and who each suits, in Polish or English | yes |
| `recommend_service` | Takes company size, AI maturity and objective; names the package that fits, with a one-line reason and a second choice | yes |
| `prepare_inquiry` | Returns a subject, a body and a `mailto:` link for an enquiry | yes |

`prepare_inquiry` composes text and hands it back. It does not send mail, open
the mail client, write to storage, or call the network — the visitor's own click
on the link is what starts an email, exactly as the site's existing CTAs do. It
is annotated `readOnlyHint: true` because that is accurate, and its description
says so to the agent as well. It also carries `untrustedContentHint: true`,
because its body echoes the visitor's own `notes` back.

WebMCP's `ToolAnnotations` dictionary defines those two members and nothing
else. MCP's wider set — `openWorldHint`, `idempotentHint` — is not part of this
spec; a test fails if one reappears.

## Response budget

Chrome's security guidance sets a **1.5K character limit per individual tool
output**. Every answer here is one compact object, not a human-readable string
plus a duplicate structured copy, and `MAX_RESPONSE_CHARS` in
`src/utils/webmcp.ts` is asserted over every reachable input combination in the
tests. `get_services` is the tight one at roughly 1,450 characters, so new copy
in the catalogue will fail the suite before it ships.

`prepare_inquiry` is the only tool whose size a caller controls. Percent-encoding
a Polish letter into the `mailto:` URL costs six characters, so a note inside its
own 160-character cap could still burst the budget; the composer shrinks the note
until the whole response fits. Free text is the only field it is safe to lose.

## Invalid input is an error, not a guess

Required enum arguments — `company_size`, `ai_maturity`, `objective` on
`recommend_service`, and `service` on `prepare_inquiry` — return
`{ error: 'invalid_input', field, allowed, message }` when they are missing or
unrecognised. The first version guessed instead, which meant a call with no
arguments at all produced a confident-looking recommendation for a company that
had described nothing, and an enquiry about a package nobody had chosen. That is
the one failure mode that turns a helpful tool into a misleading one.

Optional arguments stay lenient: an unusable `language` or `team_size` is
dropped, which cannot mislead anyone.

## Files

- `src/utils/webmcp.ts` — the service catalogue, the recommendation ladder and
  the enquiry composer. Pure functions, no DOM, no globals
- `src/utils/webmcpTools.ts` — the three tool descriptors (JSON Schema inputs,
  validation, annotations) and `registerWebMcpTools`, which is the
  feature-detection guard
- `src/components/WebMcpTools.astro` — renders no markup; its module script
  calls the guard once on load. Included on `src/pages/index.astro` and
  `src/pages/en/index.astro`
- `tests/webmcp.test.ts` — `npm test`

## The two things that must not drift

**Prices.** `SERVICES` in `src/utils/webmcp.ts` repeats the `packages` arrays
from both homepages verbatim — names, bullet lists and prices. Change a price on
the homepage and it must change here, or an agent will quote a stale one. A test
pins the six price strings, so `npm test` fails loudly if only one side moves.

**The offer.** The tools describe AI training and AI advisory and nothing else.
A test asserts the catalogue contains no mention of Excel, for the same reason
the site does not.

## Why it is invisible in browsers without WebMCP

`registerWebMcpTools` returns immediately unless
`document.modelContext.registerTool` is a function. In Chrome and Safari today it
is not, so the module loads, returns, and stops. The component renders no
elements and no styles, which is also why it is safe on the standalone
homepages, where a component expecting `global.css` tokens would render
unstyled.

The script is bundled to `/_astro/` and served from the site's own origin, so the
existing `script-src 'self'` in `public/_headers` already covers it. No CSP
change was needed, and none should be needed later — this code talks to no third
party.

## Input design

Every input is an enum or a capped string, per the Site Tools guidance to keep
inputs narrow:

- `company_size`: `micro` | `small` | `medium` | `large`
- `ai_maturity`: `none` | `experimenting` | `piloting` | `scaling`
- `objective`: `team_skills` | `find_use_cases` | `automate_process` |
  `compliance` | `ongoing_support`
- `service`: the three package ids
- `team_size`: integer 1–500
- `notes`: 160 characters, newlines folded before it reaches the `mailto:` URL

Schemas are `additionalProperties: false`, and the handlers re-check every value
against the same lists anyway: a model can send whatever it likes, and the
schema is a hint to it, not a guarantee to us.

Tool `title` is localized per page, because that is what a browser shows in its
own UI. Descriptions stay in English on both pages — they are read by the model,
not displayed.

## Testing

```bash
npm test
```

`node --test` with Node's type stripping, so the `.ts` files run directly. This
is also what finally made `tests/availabilityDates.test.ts` execute; it had been
sitting unrun since July 2025 because no runner was configured.

## Not done, deliberately

- Only the two homepages register the tools. The blog and the utility pages do
  not. Worth revisiting if agent traffic shows up in analytics
- No declarative (HTML form annotation) tools. There are no forms on the site
- No cross-origin exposure (`exposedTo` / `fromOrigins`). Nothing needs it
- No end-to-end test against a real agent. No shipping browser exposes
  `document.modelContext` yet, so the live proof so far is a stubbed
  `modelContext` executed against the deployed bundle. Redo it for real once
  ChatGPT's site-tools setting or Chrome's origin trial is reachable

## Review history

Reviewed by OpenAI Codex on 2026-08-26. It was right about all five of its
findings: silent fallbacks on required inputs, responses roughly twice the
Chrome budget, the missing `untrustedContentHint`, English titles on the Polish
page, and swallowed registration errors. All five are fixed above. Its one
retracted claim, a PLN 1,399 price, was a stale browser cache; that string
appears nowhere in the repository.
