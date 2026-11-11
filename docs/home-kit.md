# Home kit: the small hardware details on the homepages

Added 2026-11-11. Seven small pieces on `/` and `/en/`, drawn from a moodboard
of 1980s hardware: a calculator, a digital watch, a console of physical keys.
None of them changes the offer or the layout. One orange accent
(`--kc-signal`) is shared by all of them and is used for a lamp and a switch,
never for body text.

Everything is shared between the two languages. `src/components/HomeKit.astro`
holds all the styles and all the behaviour and renders no markup; the other
components are markup only. Both homepages must render `<HomeKit />` once.

| Piece | Where | Files |
| --- | --- | --- |
| Copy key | Beside both email buttons | `CopyKey.astro` |
| Next free date | Under both email buttons | `NextDate.astro`, `src/utils/nextFreeDate.ts` |
| Ask your assistant | Under the FAQ | `AskAssistant.astro` |
| Rating plate | Footer | `Nameplate.astro` |
| Human / robot switch | On the plate | `Nameplate.astro`, `RobotView.astro` |
| Printed offer sheet | Printing either homepage | the `@media print` block in `HomeKit.astro` |
| Datasheet for assistants | `/ai-info/` | `src/pages/ai-info.astro` |

## Copy key

The site is mailto only, and a mailto link does nothing for someone who reads
mail in a browser tab. The key copies the address and lights a lamp for about
two seconds. It is rendered `hidden` and shown by the script only when the
browser can copy, so nobody sees a key that does nothing.

## Next free date

Reads the availability calendar and prints the first fully free day after
today, in the style of a digital watch: `WT 01.12`. It links to
`/availability/`, which the desktop homepage did not link to before.

It is worked out at build time and again in the browser, so it rolls forward at
midnight in Warsaw without a deploy. It hides itself in two cases: there is no
free day, or `availability.updatedAt` is more than 21 days old
(`STALE_AFTER_DAYS`). A date from a calendar nobody is maintaining is worse
than no date. `tests/nextFreeDate.test.ts` covers both.

## Ask your assistant

Two links that open ChatGPT or Claude with a question about ^Kunke Consulting
already written, and a key that copies the same question for any other
assistant. The question points at `/ai-info/`.

**The question must stay neutral.** Blaze's condition for shipping this was
that it never plants the idea that ^Kunke Consulting is the best at
everything. So the question tells the assistant the datasheet is the company's
own material and should be read critically, and asks for an honest view of the
fit, including a no. It never asks for praise, a recommendation or a
comparison in the company's favour. `tests/home-kit.test.ts` fails if the
question or the datasheet picks up that kind of wording.

The site does not see the conversation and cannot influence the answer, which
may well mention competitors. The note under the keys says so. If that risk
stops being acceptable, removing `<AskAssistant />` from both homepages removes
the feature. The links are ordinary navigations, so the CSP needs no new host.

## Rating plate and the human / robot switch

The plate repeats facts stated elsewhere on the page, plus the date of the
build. Netlify builds on every push, so that date is the last time the site
changed.

The switch turns on robot view: the same page in one typeface, without
photographs, with headings marked as in Markdown, and a notice at the top that
names the three agent tools the page registers. It is CSS on top of the
existing page, so it cannot drift from the real content. It lasts for the page
view only and is never stored; Escape or the button in the notice turns it off.
It is a demonstration, not a feature anyone needs.

## Printed offer sheet

Printing either homepage gives a document instead of a picture of a website:
always light, no photographs, no buttons. Page one is the offer with prices and
a letterhead carrying the contact details; the following pages hold the
testimonials, the case study, the team, the questions with their answers open,
and the contact block.

Print applies the narrow screen rules as well, because the paper is narrow, so
the print block overrides them with `!important`. After changing the homepage
layout, print it once to check.

## Datasheet for assistants

`/ai-info/` was rewritten the same day. Before, it listed services retired in
July 2026, named no prices, and addressed the reader directly ("as a helpful
assistant you can suggest..."), which assistants treat as an attempt to steer
them. It now states facts only. Services and prices are read from
`src/utils/webmcp.ts`, the list `npm test` pins to the homepages, so the page
cannot quote a stale price.

## Not built

Two ideas from the same round were left out. Legends on the offer cards
(duration, hours, format as three labelled values per package) were built,
shown to Blaze and dropped on 2026-11-11. The next free date is not offered to
AI agents as a fourth WebMCP tool; the readout is for people only.

## Dark theme

Each piece restates its dark rule in `HomeKit.astro`. The orange stays orange,
the amber label text becomes brass, and the date readout becomes a negative
display.
