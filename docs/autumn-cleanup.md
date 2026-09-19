# Autumn website cleanup — September 19, 2026

This release implements the approved audit items 1–9. Item 8 is limited to
obvious spelling mistakes. Offer wording, company claims and the enforced CSP
are outside this release.

## Shared presentation

- `SiteNav.astro` preserves language access at narrow widths and puts the section
  links in a native, keyboard-operable mobile menu. The dark wordmark is warm
  off-white (#f7f0e5), per Blaze's preference.
- `ThemeInit.astro` and `ThemeToggle.astro` share the existing theme preference
  and lamp behavior between homepages, blog and refreshed utility pages.
- `BlogShell.astro` also frames privacy, availability and missing-page screens.
  Blog pages keep their existing analytics-free behavior.
- The 404 pages retain missing-page status through Netlify. `/en/*` uses a
  non-forced 404 rule, so existing English pages and earlier redirects win.

## Privacy and consent

The PL/EN policy describes email contact, hosting, external font/thumbnail
requests, optional analytics, browser preferences and data rights. It retains
existing business identification details and replaces the old contact-form
claims. It is a description of the website, not a legal certification or an
audit of private provider account settings.

The public GTM container was inspected on September 19: Google tag
`G-J1G4R6VQKW` and a conversion linker. No new analytics destinations were added.
Advertising storage, user-data and personalization consent remain denied;
Google signals, ad-personalization signals and URL passthrough are disabled.
GTM remains behind explicit analytics consent in basic mode on pages that
already used it.

`cookie_consent=analytics-v2` records the specific new choice. The old broad
`granted` value requires a fresh choice; existing `denied` choices remain valid.
The footer can reopen settings. Withdrawal removes accessible first-party
analytics/advertising cookies and reloads a page that already loaded GTM, so
its event listeners are removed. A storage event synchronizes other open tabs.
No optional tag is loaded if cookies cannot retain the required choice.

Provider references:
- https://developers.google.com/tag-platform/security/guides/consent
- https://policies.google.com/technologies/cookies
- https://www.netlify.com/privacy/
- https://www.edpb.europa.eu/sme/be-compliant/process-personal-data-lawfully_en

## Content and images

Four existing article pairs carry explicit `translationKey` fields. The helper
in `src/utils/locales.ts` rejects incomplete or same-language pairs and produces
reciprocal alternates. Untranslated posts link to the other language's article
index with a clear label. Existing article URLs are preserved.

Milestone cards render their numbers as text. Text-bearing hero images use
`heroImageFit: contain`; photographs retain cover cropping. `ResponsiveImage`
uses Astro/Sharp to produce WebP variants with intrinsic dimensions and sizes.
Original files remain available for old links and social sharing. The inline
portrait in the AI-image article now reserves its actual 844 × 956 dimensions.

The availability summary and month grids use the same date source. Warsaw time
controls past dates and month rollover, both at build time and in the browser.
Past months are collapsed. When the published range has expired, the summary
asks visitors to get in touch rather than inventing new availability.

## Validation

- Production build, TypeScript/Astro check, reciprocal hreflang check.
- 29 tests, including consent default/accept/withdraw/legacy choices, blocked
  local storage, cross-tab withdrawal, translation pairs and date rollover.
- Browser checks of PL/EN navigation, consent settings and theme persistence.
- Responsive previews at 320, 390 and 768 pixels; mobile menu and language
  control visible without horizontal page overflow.
- Built-output links, fragment targets and responsive image paths checked.

The GitHub build workflow now runs the tests before building. Production URLs
and actual PL/EN missing-page status must also be checked after deployment.
