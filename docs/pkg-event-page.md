# /pkg/ : the workshop handout page, and the only form on the site

Built on 2026-11-13 for the workshop "Od ChatGPT do agentów. Jak budować
strategię AI w firmie" at Poznański Kongres Gospodarczy (Scena D2, Poznań
Congress Center, 13:00 to 14:30). Participants scan a QR code on the closing
slides and land here. PKG is the congress, not a product.

## What is there

| Address | What it is |
| :--- | :--- |
| `/pkg/` | Polish page |
| `/en/pkg/` | English page |
| `/pkg/Od-ChatGPT-do-agentow-Kunke-Consulting-PKG-2026.pdf` | the slides, 31 pages, Polish only |
| `/PKG`, `/Pkg`, `/en/PKG` | 301 to the lower-case pages, in `public/_redirects` |

Both pages render through `src/components/PkgPage.astro`. It belongs to the
standalone family (own `--kc-*` tokens, no `BaseLayout`, no `global.css`) and
has no dark theme.

The page does three things, in this order: download the slides, read what the
company does, leave contact details. Services and prices are not typed in: they
come from `src/utils/webmcp.ts`, the list `npm test` pins to the homepages.
The "60+ workshops, 500+ people" figures come from slide 4 of the deck.

## Deliberately not done

- **Not indexed.** `noindex` meta tag on both pages, `X-Robots-Tag: noindex`
  for `/pkg/*` in `public/_headers` (a PDF cannot carry a meta tag), and `/pkg`
  is in the sitemap exclusion list in `astro.config.mjs`. It is a handout for
  people who were in the room.
- **No hreflang.** The pair is not registered in `src/utils/locales.ts`. The
  language link in the header is a plain link.
- **No analytics and no cookie banner.** On a phone the banner would cover the
  download button. The number that matters is form submissions. To add
  analytics, include `ConsentMode` and `CookieConsent` the way `/talent` does.
- **The download is not gated.** Nobody has to fill in the form or tick a
  consent to get the slides. A consent demanded in exchange for the file would
  not be freely given, so it would not be worth much.

## The form

This is the only form on the site. The rest of the site is still mailto-only.

It uses **Netlify Forms**, built into the hosting. Netlify reads the
`<form data-netlify="true" name="pkg-2026">` markup at deploy time and accepts
POSTs for it. There is no script to host, no endpoint URL and no secret in the
HTML, which is what went wrong with the old Apps Script form
(`docs/contact-form-archive.md`).

**Two things live in the Netlify dashboard, not in this repository:**

1. Form detection has to be switched on: Netlify, the site, Forms, "Enable
   form detection". It only takes effect on the next deploy. Blaze switched it
   on on 2026-11-13, a few minutes after the page first went live; until the
   deploy that followed, every submission went down the email fallback.
2. Email notifications for new submissions: Netlify, the site, Forms, the
   `pkg-2026` form, "Form notifications". Without one, submissions only sit in
   the dashboard.

Submissions are listed under Forms, `pkg-2026`, and can be exported as CSV.

### Fields

| Field | Notes |
| :--- | :--- |
| `name` | required |
| `email` | required |
| `company` | optional |
| `phone` | optional, but required by the script when the phone consent is ticked |
| `message` | optional |
| `consent_email` | `TAK` / `NIE` (`YES` / `NO` on the English page) |
| `consent_phone` | same |
| `consent_wording` | the exact text of every consent that was ticked |
| `language` | `pl` or `en` |
| `source` | fixed: the event name and date |
| `bot-field` | honeypot, Netlify drops submissions that fill it |

Netlify only keeps fields that exist as real inputs in the deployed HTML, the
hidden ones included. Add a field to the script and not to the markup and it
is silently discarded.

### If Netlify does not accept a submission

The script treats any answer other than a success as a failure and swaps the
form for a "send by email" button, prefilled with everything the visitor
typed and both consent answers. So form detection being off, a quota or a bad
connection in the hall costs a tap, not a lead.

### Consent wording, version 1 (2026-11-13)

Neither box is pre-ticked and neither is required.

Polish:

- Chcę otrzymywać od ^Kunke Consulting informacje handlowe i marketingowe (np.
  o warsztatach, szkoleniach i materiałach o AI) na podany adres e-mail.
- Zgadzam się na kontakt telefoniczny ze strony ^Kunke Consulting w celach
  marketingowych, na podany numer telefonu.

English:

- I would like to receive commercial and marketing information from ^Kunke
  Consulting (for example about workshops, training and materials on AI) at the
  email address I provided.
- I agree to be contacted by phone by ^Kunke Consulting for marketing
  purposes, at the phone number I provided.

The privacy policy (section 2, both languages) describes the form, names
Netlify as the processor and gives the legal basis: GDPR Article 6(1)(a) and
Article 398 of the Polish Electronic Communications Law. **This wording was
drafted without a lawyer.** If it changes, keep the old version in this file
with its dates: a consent is only as good as the record of what was agreed to.

## Switching it off

- Stop collecting: remove the `<form>` and its script from `PkgPage.astro`, and
  change the privacy policy back. The submissions already collected stay in
  Netlify until deleted there.
- Retire the page: replace both pages with a 301 in `public/_redirects`. Keep
  the PDF address alive, people will have saved the link.
- Reuse for another event: copy the component, change the form `name`, the
  `source` value, the PDF and the copy. A new form name keeps the leads from
  two events apart.
