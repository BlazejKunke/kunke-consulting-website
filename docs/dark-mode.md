# Dark mode

Shipped 2026-09-15 on the two standalone homepages, `/` and `/en/`. Imported from
the Claude Design project "Dark Mode.dc.html" and its implementation note.

The look is "the study after dark": a near-black ground, warm parchment text,
muted brass accents, Newsreader serif headings, a paper grain over the page and a
brass lamp-pull toggle in the header.

## Scope

**Dark mode only.** The light theme is untouched — the change is additive, every
rule is scoped to `:root[data-theme='dark']`, and the diff that shipped it added
lines without removing any. The one thing light mode gains is the toggle itself,
which has to exist in both themes to switch back.

**Homepages only.** The blog, `BaseLayout` pages (`privacy-policy`, `thank-you`,
`availability`), `/talent/`, `/ai-info/` and `/verify.html` are all still
light-only. A visitor who turns the light off on the homepage and then opens the
blog gets a light page. Extending it means repeating the token block in
`BlogShell.astro` and in `global.css` — see "If this is ever extended" below.

## How the theme is chosen

1. First visit follows `prefers-color-scheme`.
2. The toggle writes `light` or `dark` to `localStorage` under `kc-theme`.
3. From then on the stored choice wins, on both languages, in both directions.

The attribute is set on `<html>` by an **inline `<script is:inline>` in `<head>`**,
before the first paint. It has to stay inline and it has to stay in the head: a
bundled Astro `<script>` is deferred, and the page would flash light before going
dark. With JavaScript off, no attribute is set and the page stays light.

`<meta name="theme-color">` is updated alongside the attribute, so the browser
chrome on a phone matches the page.

## Tokens

The dark block sits at the end of the global style block on each homepage. The
same block is in both files — **change one, change the other**, as with everything
else on these two pages.

| Token | Dark value | Notes |
| --- | --- | --- |
| `--kc-bg` | `#0b0f0d` | near-black ground |
| `--kc-card` | `#111714` | panels, offer cards, testimonials |
| `--kc-band` | `#0e1411` | header, facts band, footer |
| `--kc-ink` | `#f7f0e5` | warm parchment |
| `--kc-body` | `#dcd3c1` | body copy |
| `--kc-muted` | `#afa593` | eyebrows, captions |
| `--kc-green` | `#08301f` | **the case-study panel only** |
| `--kc-brass` | `#c5a670` | accents, prices, stat numerals, buttons |
| `--kc-btn-bg` / `--kc-btn-fg` | `#c5a670` / `#0b0f0d` | buttons |
| `--kc-glow` | `0 0 34px -8px rgba(197,166,112,.45)` | lamplight on hover |
| `--kc-serif` | Newsreader | headings only |

Measured on the live page: ink 17:1, body 13:1, muted 7.9:1, brass 8.3:1 on the
page ground; parchment 12.8:1 on the case panel. All clear AA.

### The trap in `--kc-green`

In light mode `--kc-green` is the brand green **and** the accent colour: links,
the focus ring, the skip link, `::selection`, the price, the typed caret, the
brand wordmark and the testimonial arrows all used it. In dark mode it is only
the case-study panel's ground, `#08301f` — which is nearly the page colour.

So every one of those had to be re-pointed to brass by hand. Left alone they
render near-black on near-black: **the focus ring and the skip link would have
disappeared entirely**, which is an accessibility failure, not a cosmetic one. If
a new component uses `var(--kc-green)` to mean "the accent", give it a dark rule.

The same trap caught the cookie banner, which redeclares the tokens on itself and
hard-codes `#fff` on its accept button — unreadable on brass. Both are overridden.

### Rules

The light `--kc-rule-*` scale is green-alpha and reads as mud on a dark ground, so
every step is restated in parchment-alpha. The design works to three steps
(`.10`, `.16`, `.24`); the heavier light steps collapse onto `.24`, because a
`.42` parchment rule glares.

## The pieces

- **Serif headings** — Newsreader 400 on `h1`, `h2`, `h3`, FAQ questions,
  pull-quotes and the stat numerals. Body, eyebrows and prices stay on Helvetica
  and the mono stack. Loaded from Google Fonts, already allowed by the CSP in
  `public/_headers`; the font binaries are only fetched when a rule actually
  renders text in the family, so a light-mode visitor does not download them.
- **Paper grain** — one fixed, tiled SVG noise layer at `opacity: .16`. It must
  stay `position: fixed`: sized to the document it repaints the whole page on
  every scroll. `z-index: 50` puts it over the sticky header (20) and under the
  skip link (100) and cookie banner (1000), so both of those stay crisp.
- **Lamp pull** — a 1px cord and an 11px knob in a 44×44 button. The knob drops
  9px and springs back on click. Its accessible name states the action, not the
  state, and it is carried by two visually-hidden spans that CSS shows or hides
  by theme — so the name is right from the first paint without waiting for
  script. Polish on `/`, English on `/en/`.
- **Pointer lamplight** — a 460px brass radial gradient at `mix-blend-mode:
  screen` that follows the mouse. Position is written straight onto the element's
  `transform` inside one `requestAnimationFrame`; it never goes into a variable
  anything else reads, so moving the mouse costs a composited paint and no
  layout. Mouse pointers only — a tap would leave the glow stranded.
- **Hover** — cards, buttons and arrows take `--kc-glow`, lamplight rather than a
  lift. Photographs sit at `brightness(.84) saturate(.94)` and come up to full.

Under `prefers-reduced-motion: reduce` the transitions stop and the pointer
gradient is dropped entirely. The colours stay: reduced motion is about motion.

## If this is ever extended

The blog would need the same token block and overrides in
`src/components/BlogShell.astro`, which owns the blog's `--kc-*` set; the
`BaseLayout` pages would need it in `public/styles/global.css`, which is a
different, older token set (`--color-dark-text` and friends) and a bigger job.
The theme script and `localStorage` key would be reused as-is, so a choice made
on the homepage would carry over.

Client logos on testimonials (`.kc-voice-logo`) have **no** dark treatment. No
testimonial currently sets one, so nothing renders today — but a logo added later
will be a dark mark on a dark card, or a white JPEG box. Give it a dark rule when
the first one is added; inverting is wrong for logos that ship with a white
background.
