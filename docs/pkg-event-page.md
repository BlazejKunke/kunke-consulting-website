# /pkg/ : the retired workshop handout page (archive)

**Retired on 2026-11-16.** This page existed for one event and was live for four
days, 2026-11-13 to 2026-11-16. This file is the archive: what it was, what the
form collected, the consent wording people agreed to, and how to bring it back
for another event.

It was built for the workshop "Od ChatGPT do agentów. Jak budować strategię AI
w firmie" at Poznański Kongres Gospodarczy (Scena D2, Poznań Congress Center,
13:00 to 14:30). Participants scanned a QR code on the closing slides and
landed on it. PKG is the congress, not a product.

## What is live now

| Address | What happens |
| :--- | :--- |
| `/pkg/Od-ChatGPT-do-agentow-Kunke-Consulting-PKG-2026.pdf` | the slides, 31 pages, Polish only. Still served, still noindex |
| `/pkg/`, `/en/pkg/`, `/PKG`, `/Pkg`, `/en/PKG` | 301 straight to the slides, in `public/_redirects` |

The redirect goes to the slides and not to the homepage on purpose. The only
way anyone reaches `/pkg/` is the QR code on the closing slide or a photo of
it, so they want the slides. The homepage would read as a dead end.

**The PDF must never move or be renamed.** The QR code is printed in the deck
itself and in every photo taken in the room.

There is no form any more. Nothing on the site collects personal data.

## What is left to do outside this repository

- The submissions sit in Netlify under Forms, `pkg-2026`. Blaze exported them
  as CSV on 2026-11-16, before the form came down. The CSV is the consent
  record, so it needs keeping somewhere safe for as long as anyone on it is
  being contacted.
- Once the CSV is safely stored, delete the submissions in Netlify so the
  personal data is not held in two places. Only Blaze can do this.
- Netlify may go on listing the `pkg-2026` form after the markup is gone. It
  cannot receive anything; it can be deleted in the dashboard.
- The privacy policy (section 2, both languages) still describes the form, in
  the past tense, and still explains how to withdraw a marketing consent.
  Leave those paragraphs while the details and consents are kept. Remove them
  only when the data has been deleted everywhere.

## Bringing it back

The page was `src/components/PkgPage.astro`, rendered by `src/pages/pkg.astro`
and `src/pages/en/pkg.astro`. All three were deleted in the retirement commit.
The last commit that has them is `5fd8df9`:

```bash
git show 5fd8df9:src/components/PkgPage.astro > src/components/PkgPage.astro
git show 5fd8df9:src/pages/pkg.astro > src/pages/pkg.astro
git show 5fd8df9:src/pages/en/pkg.astro > src/pages/en/pkg.astro
```

For another event, do not reuse `/pkg/`: give the new page its own address,
form `name`, `source` value, PDF and copy. A new form name keeps the leads from
two events apart. Then put the address back in the sitemap exclusion list in
`astro.config.mjs`, describe the form in the privacy policy, and switch form
detection on in Netlify if it has been turned off. Ask Blaze first: the site
is mailto-only by his decision.

Everything below describes the page as it was while live.

## What was there


| Address | What it is |
| :--- | :--- |
| `/pkg/` | Polish page |
| `/en/pkg/` | English page |
| `/pkg/Od-ChatGPT-do-agentow-Kunke-Consulting-PKG-2026.pdf` | the slides, 31 pages, Polish only |
| `/PKG`, `/Pkg`, `/en/PKG` | 301 to the lower-case pages |

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
