# ^ Refinement v1

The bilingual game at `/game/` uses the continuous-feed paper design supplied by Blaze: warm cream, sage stripes, perforated margins, forest-green type, a 17 × 7 letter field and five report meters. It is a standalone website page, with no homepage navigation added.

Find ten words per sheet, horizontally or vertically. Drag, select the endpoints, or use arrow keys and Enter. Words automatically fill their category. Select a category to see its two target words. The caret in the field or footer reveals an answer briefly. Completing all ten words offers a new sheet. There is no timer, score penalty, account, analytics, browser storage or network service.

On phones the field becomes 10 × 12. Crossing the layout breakpoint rearranges the same targets while retaining the current sheet and progress. Reloading the page starts over. Motion respects the operating system's reduced-motion setting.

The first sheet includes MODEL, AGENT, DANE, DATA, SENS, IDEA, KUNKE, TEAM, PROMPT and CEL. Later sheets choose two words per category from the curated bilingual vocabulary in `src/lib/refinement/engine.ts`. Words never overlap, so removing one cannot destroy another. The client also accepts an incidental duplicate of a target without erasing other remaining answers.

Files: `src/pages/game.astro`, `src/styles/refinement.css`, `src/scripts/refinement.ts`, `src/lib/refinement/engine.ts`. The game adds no dependencies. Run the existing `npm test` and `npm run build`; generation coverage checks 500 desktop/mobile sheets, selections, accents and completion.
