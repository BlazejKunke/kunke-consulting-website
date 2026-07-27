# Archived: the contact form and its Google Apps Script wiring

The site has been **mailto-only** since July 2026. Blaze decided email was enough, and
the pages that carried the form were retired in the same clean-up. `ContactForm.astro`
was deleted on 2026-07-27 because nothing rendered it any more.

This file exists so the Apps Script setup is not lost. Nothing here is live.

## Before reusing any of this — rotate the secrets

Both values below sat in the HTML of a public website and in a public GitHub repo, so
they were never actually secret. If the form is ever revived:

- Deploy a **new** Apps Script web app and use its new URL
- Replace the `FormSecret` value, or drop it for something real

The endpoint may well be dead already; a deleted or redeployed Apps Script stops
accepting posts.

## How it worked

A plain HTML `<form>` POSTing to a Google Apps Script web app, which appended rows to a
spreadsheet. No backend, no dependencies.

- **Endpoint:** `https://script.google.com/macros/s/AKfycbz5xjPMBICnaCIvsE52rFHLX57iYORLXleQMUMobIorOvifsaNj5_9LEGsnBdC13NNWdQ/exec`
- **Method:** `POST`, body as `URLSearchParams`, `mode: 'no-cors'`

`no-cors` matters: Apps Script does not return CORS headers, so the browser cannot read
the response. The code therefore cannot tell success from failure — it assumes success
and redirects. Any revival should improve on that.

### Fields sent

| Field name | Type | Notes |
| :--- | :--- | :--- |
| `Name` | text | required — "Imię i nazwisko" |
| `WorkEmail` | email | required — "Adres e-mail służbowy" |
| `Type` | select | required — `Doradztwo` / `Szkolenie` / `Inne` |
| `Message` | textarea | optional |
| `Referrer` | hidden | filled from `document.referrer` |
| `UTM` | hidden | filled from `window.location.search` |
| `FormSecret` | hidden | fixed value `kunke-2025` |
| `_gotcha` | hidden | honeypot, positioned off-screen; bots that fill it were meant to be dropped |

On submit the button was disabled and relabelled "Wysyłanie…", then the browser was sent
to `https://kunkeconsulting.pl/thank-you`. **`/thank-you` still exists** and is still
excluded from `robots.txt`.

## Recovering the original file

The complete component, styles and script are in Git:

```bash
git show 9e2afa8:src/components/ContactForm.astro
```

To restore it to the working tree:

```bash
git checkout 9e2afa8 -- src/components/ContactForm.astro
```

Note the styles used the old `global.css` design tokens (`--color-white`,
`--color-primary`, `--color-border`, `--color-dark-text`) and the Inter font. The current
homepages use `--kc-*` tokens and a Helvetica stack, so the form would need restyling to
sit on a modern page — see the two page families in `CLAUDE.md`.

## Other components deleted in the same commit

All were orphaned by the July 2026 page retirement and are recoverable the same way:

`AiPackages`, `CompanyCarousel`, `ExperienceSection`, `ExperienceSectionUk`, `OMnie`,
`OptimizedImage`, `StudentReport`, `TeamMember`, `TeamSection`, `WorkshopSection`,
`WorkshopSectionUk`, `testimonials`, `testimonialsUk`

The `*Uk` variants belonged to the retired UK English site. `TeamSection` and
`TeamMember` powered the old `/team` and `/zespol` pages; the homepages now carry the
team section inline.
