# Archived: the two interactive lead magnets

Both tools were taken off the site on **2026-07-31**. `/kalkulator-roi-ai/` and
`/ai-readiness-score/` now 301 to the homepage.

Nothing here is live. This file exists so the decision, and the work, are not lost.

## Why they were parked

Both were built on the **old design** — Inter, `global.css`, the pre-redesign layout.
The homepage and the blog are the new design. So every internal link into either tool
threw a visitor from the redesigned site onto a page that looked like a different
company. That cost was invisible while nobody was auditing internal links, and became
obvious the moment someone was.

The trigger was an SEO audit noting that `/ai-readiness-score/` had **zero inbound
internal links** anywhere on the site — reachable only by typing the URL — while the ROI
calculator was linked from the blog index and the foot of every Polish blog post. The
asymmetry was accidental. The fix looked like "link the readiness test the same way",
but linking either one properly meant first deciding whether it should exist in the new
design at all.

Blaze's call: park both, likely rebuild **one** of them later. Two lead magnets split
attention and double the maintenance, and these two ask different questions — the
calculator asks *what is this worth to me*, which is a buyer's question; the readiness
test asks *how mature are we*, which is more a consultant's question.

**Before rebuilding either, look at the analytics.** How many people finished each tool,
and how many enquiries followed? That number was never checked, and it should decide
which one comes back — not intuition, and not which one is easier to port.

## What each one was

### ROI calculator — `/kalkulator-roi-ai/`

Added 2026-06-16 in a single commit (`d8b46ef`) and never needed a fix afterwards. The
better-built of the two, and the more likely candidate to revive.

Six questions, two scenarios (cautious and optimistic), with the assumptions published
on the page under a "Jak to liczę?" toggle and an explicit "estimate, not a promise"
disclaimer. The model, all in `RoiCalculator.astro`:

| Constant | Value | Meaning |
| :--- | :--- | :--- |
| `WORK_HOURS_YEAR` | 1840 | working hours per year |
| `EMPLOYER_MULT` | 1.2 | gross salary to true employer cost |
| `CONS_RATE` / `OPT_RATE` | 0.15 / 0.35 | time saved on an affected task |
| `REACH_CONS` / `REACH_OPT` | 0.40 / 0.75 | share of the team a rollout actually reaches |
| `BLUE_HOURLY` | 35 | PLN/h assumed for non-office staff |
| `BLUE_HRS_SAVED_OPT` | 25 | hours/year saved per non-office employee, optimistic |
| `maturityHeadroom` | 1.0 → 0.3 | the more AI you already use, the less headroom is left |
| `typeMult` | 0.4 for software companies | they have automated more already |
| `taskShare` | 0.11 per task, capped 0.55 | share of the working day the chosen tasks occupy |

Salary bands were 5 000 / 8 000 / 12 500 / 18 000 PLN gross monthly. **These are 2026
figures — revisit them before reuse.** Ends in a Calendly link and a mailto.

### AI readiness score — `/ai-readiness-score/`

Added 2026-02-14 (`1875bef`), on the previous website. Nine commits, six of them
repairs: a JSON parsing bug (#113), a broken Calendly link (#114), two rounds of
language simplification (#115, #116), a brand-spelling fix (#117).

Nine questions across three axes, producing a 0–100 score, one of four maturity levels
and a profile tag, with per-level summaries, three next steps and three pitfalls. The
scoring lived in `src/utils/aiReadinessScoring.ts` and the copy in
`src/content/ai-readiness-recommendations.ts` — that separation was good, and worth
keeping if it is rebuilt. Results were handed to the visitor through a prefilled
`mailto:`.

It also carried the leaky Apps Script lead endpoint until 2026-07-27 — see
[`contact-form-archive.md`](contact-form-archive.md). **The endpoint and its fake
`FormSecret` must not come back.** A CI check in
[`.github/workflows/build-check.yml`](../.github/workflows/build-check.yml) fails the
build if either reappears.

## Recovering the code

Everything was deleted in one commit. The last commit that still contains all of it is
**`4218e27`**:

```bash
git show 4218e27:src/components/RoiCalculator.astro > src/components/RoiCalculator.astro
```

The other five files, at the same revision:

- `src/pages/kalkulator-roi-ai.astro`
- `src/pages/ai-readiness-score.astro`
- `src/components/AIReadinessWizard.astro`
- `src/utils/aiReadinessScoring.ts`
- `src/content/ai-readiness-recommendations.ts`

## If one comes back

- Build it on the **new** design. The old pages used `BaseLayout`; a revived tool should
  follow the standalone pattern the homepage and `BlogShell` use, with the `--kc-*`
  tokens declared locally. See `CLAUDE.md` on the two page families
- Remove its redirect from `public/_redirects`, or the page will be unreachable —
  Netlify serves the 301 before the file
- Link it from somewhere. The readiness test's whole problem was that nothing pointed at
  it. The blog CTA (`src/pages/blog/index.astro` and the `labels` block in
  `src/pages/blog/[slug].astro`) is where the calculator's links used to live; both now
  point at a mailto instead
- Polish only, unless it is translated properly. If it ever gains an English version,
  register the pair in `src/utils/locales.ts` — that is the only thing that grants a
  page hreflang tags
