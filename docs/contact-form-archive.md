# Archived: the contact form and its Google Apps Script wiring

The site has been **mailto-only** since July 2026. Blaze decided email was enough, and
the pages that carried the form were retired in the same clean-up. `ContactForm.astro`
was deleted on 2026-07-27 because nothing rendered it any more.

This file exists so the Apps Script setup is not lost. The form is gone from the site,
but **the Apps Script behind it is still running** — see the next section.

## Status: the endpoint is LIVE and must be shut down

**Checked 2026-09-15. The deployment is still running.** An earlier version of this
file guessed it "may well be dead already". That guess was wrong, and it is worth
saying plainly why it mattered: removing the form from the site removed the *caller*,
not the *backend*. The web app kept serving.

What the check found:

- A `GET` to the `/exec` URL returns the deployment's own page, so the script executes
- It answers **without any sign-in**, so the web app is deployed as accessible to anyone
- Therefore it is reachable, and presumably still writable, by anyone who has the URL —
  and the URL sat in this public repo and in the site's HTML for years

The `FormSecret` (`kunke-2025`) is **not** a credential and there is nothing to revoke
in it. It was a fixed string shipped in public HTML, so it never authenticated anything
and offers no protection now. Do not mistake it for a secret that needs rotating.

### What has to happen, in the Google account that owns the script

The deployment is **not** in `blazej.kunke@gmail.com` — that Drive holds no matching
Apps Script project, so it belongs to another account, most likely
`info@kunkeconsulting.pl`. It can only be closed from there:

1. Open [script.google.com](https://script.google.com) signed in as that account
2. Find the project behind deployment `AKfycbz5xj…` (full id in Git history, see below)
3. **Deploy → Manage deployments → Archive** it, or delete the project outright
4. Confirm it actually stopped, with `npm run check:legacy-endpoint`. That script
   GETs the URL and fails while the deployment still answers. It is deliberately not
   in CI — a check that goes red on every commit until someone acts just trains people
   to ignore red builds
5. Open the spreadsheet it wrote to, and deal with what is in it — the form collected
   names, work email addresses and free-text messages, so retained rows are personal
   data under GDPR. Delete what is not needed, and check the file's sharing is not set
   to "anyone with the link"

### If the form is ever revived

- Deploy a **new** Apps Script web app and use its new URL
- Drop `FormSecret` entirely, or replace it with something that is actually secret —
  which means something the browser never sees

## How it worked

A plain HTML `<form>` POSTing to a Google Apps Script web app, which appended rows to a
spreadsheet. No backend, no dependencies.

- **Endpoint:** deployment `AKfycbz5xj…`, truncated on purpose. It is still live, so
  this file no longer carries a working copy-pasteable URL. The full string is in Git
  history (`git log -S AKfycbz5xj --all`) if you need it to identify the deployment
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
