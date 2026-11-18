# How we work (`/jak-pracujemy/`, `/en/how-we-work/`)

Added 2026-11-18. The public summary of the ^Kunke Consulting **Ethical Conduct
Guide**, version 2.6, with the full guide as an English PDF.

| | |
| --- | --- |
| Polish page | `/jak-pracujemy/`, menu item "Jak pracujemy" |
| English page | `/en/how-we-work/`, menu item "How we work" |
| PDF | `/Kunke-Consulting-Ethical-Conduct-Guide.pdf`, English only |
| Source | `src/components/HowWeWorkPage.astro` (both languages), two one-line pages in `src/pages/` |

Both pages render through `BlogShell`, so they get the shared header, footer,
cookie banner and dark theme. They are linked from the menu (`SiteNav.astro`),
from the footer of both homepages and every `BlogShell` page, and from
`/ai-info/`.

## Where the words come from

This matters more than the layout, because Blaze checks every sentence.

- **Polish** is Blaze's own text, supplied on 2026-11-18. It is a selection from
  the guide, not all of it. Do not machine-translate new English sentences into
  it: he asked not to have a Polish version of the guide created, because that
  needs his own interpretation and checking.
- **English** is the guide's own wording, word for word, cut down to the same
  sections and sentences the Polish page carries. Where the Polish leaves out a
  sentence (for example "Our recommendations are based only on what we believe
  is right for the client"), the English page leaves it out too. Headings follow
  the Polish ones. The opening paragraph and the closing disclaimer have no exact
  source sentence in the guide and were written to match the Polish.
- **The PDF** is the whole guide. There is deliberately no Polish PDF.

Left out of both pages, but in the PDF: purpose and audience of the guide,
transparency and communication, professional conduct expectations,
responsibility in AI and data work, non-compete agreements, environmental and
social considerations, acknowledgement, right to terminate, review cycle, and
raising concerns during an ongoing engagement.

## Typo fixes

The PDF and the English page differ from the source `.docx` in two places, both
typos, fixed on 2026-11-18 and reported to Blaze:

- "internationally when time is right" became "when the time is right"
- the last item under "Responsibility in AI and Data Work", "Following all
  relevant regulation;", became "following all relevant regulation." to match the
  list

Fix them in the master document too, or the next version will bring them back.

## Publishing a new version

1. Get the new `.docx` from Blaze. Read all of it, and check it for comments and
   tracked changes before anything is published.
2. Update `GUIDE_VERSION` and `GUIDE_UPDATED` in `HowWeWorkPage.astro`, and the
   two typed-out dates in its `copy` blocks.
3. If sections changed, update the English page from the new wording, and **ask
   Blaze for the Polish**. Do not translate it yourself.
4. Rebuild the PDF. The file name stays the same, so links keep working:

   ```bash
   pandoc guide.docx -t html --wrap=none -o body.html
   python3 -I scripts/ethics-guide/make-print-html.py body.html guide-print.html
   node scripts/ethics-guide/print-pdf.cjs "$PWD/guide-print.html" public/Kunke-Consulting-Ethical-Conduct-Guide.pdf
   ```

   Update the version and dates typed into both scripts first. The first script
   asserts on the title block and on each typo fix, so it fails loudly if the
   document changed shape. Drop a fix from `FIXES` once the master document has
   it. `print-pdf.cjs` needs Playwright, which is preinstalled in cloud sessions
   but is not a project dependency.

5. Compare the PDF text with the `.docx` word for word (`pdftotext` against
   `pandoc -t plain`), then build and run `npm test`.

## Small things worth knowing

- Polish text runs through `tidy()`, which binds one-letter words (i, w, z, o,
  a, u) to the next word with a non-breaking space, so none of them ends a
  line. English text is left alone.
- The two addresses differ beyond the `/en` prefix, so `locales.ts` finds the
  language pair by matching the page's own URL against the registry. That is
  what `findRouteMap` is for; `npm run check:hreflang` confirms the pair.
- The PDF has its own canonical `Link` header in `public/_headers`, like the
  other linked PDFs.
