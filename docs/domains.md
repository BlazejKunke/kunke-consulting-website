# Domains and DNS

## Who holds what

| Domain | Registrar | Nameservers | Role |
| --- | --- | --- | --- |
| `kunkeconsulting.pl` | home.pl | `dns.home.pl`, `dns2.home.pl`, `dns3.home.pl` | The live site. The only address used publicly |
| `kunkeconsulting.com` | Porkbun | `*.ns.porkbun.com` | Registered 2026-08-06. Defensive; 301s to the `.pl` |

Netlify hosts the site and publishes from GitHub `main`. Neither domain uses Netlify
DNS — both keep their registrar's nameservers and point at Netlify with records.

### `.pl` records, as they stand at home.pl

```
@     A      75.2.60.5                      # Netlify's apex load balancer
www   CNAME  kunkeconsulting.netlify.app
```

`kunkeconsulting.pl` is the **primary domain** on the Netlify site, so Netlify
already 301s `www.kunkeconsulting.pl` to it automatically. That automatic behaviour
covers a domain's own apex/www pair and nothing else — see below.

## Redirecting `.com` to `.pl`

Netlify does **not** automatically redirect one domain to another. Adding
`kunkeconsulting.com` as a domain alias makes it *serve the same site* — a full
duplicate of the whole site on a second domain, which is worse than doing nothing,
because search engines then see two copies. The redirect itself comes from the rules
at the top of `public/_redirects`:

```
http://kunkeconsulting.com/*        https://kunkeconsulting.pl/:splat  301!
https://kunkeconsulting.com/*       https://kunkeconsulting.pl/:splat  301!
http://www.kunkeconsulting.com/*    https://kunkeconsulting.pl/:splat  301!
https://www.kunkeconsulting.com/*   https://kunkeconsulting.pl/:splat  301!
```

Those are host-scoped: they match only when the request arrives on the `.com`, so
they cannot touch `.pl` traffic. They are inert until the two steps below are done.

### How it was set up — done 2026-08-06

**1. Netlify — attach the domain.** `kunkeconsulting.com` and
`www.kunkeconsulting.com` were added under Domain management as *domain aliases*.
Neither is primary, and neither should ever be made primary: `kunkeconsulting.pl`
staying primary is what keeps the redirect pointing the right way.

**2. Porkbun — point the DNS at Netlify.** A fresh Porkbun domain arrives with URL
forwarding to an `l.ink` parking page, plus parking `A` records at `207.207.210.x`
for `@` and the `*` wildcard. Deleting the forwarding entry removed those `A`
records automatically — the forwarding feature owns them — so there was nothing left
to clear by hand. Then:

```
ALIAS  (host blank / @)  apex-loadbalancer.netlify.com
CNAME  www               kunkeconsulting.netlify.app
```

Porkbun does offer `ALIAS` ("CNAME flattening record"), which is preferable to a
hard-coded `A` record at `75.2.60.5`: if Netlify ever moves the load balancer, an
ALIAS follows and an `A` record silently breaks.

Netlify picked up the DNS and issued the certificate on its own about six minutes
later, without needing the "Renew certificate" button. If a future change does stall,
that button is in Domain management under HTTPS — but a failed renewal should be left
alone rather than retried repeatedly, since Let's Encrypt rate-limits failures.

A useful trick for testing before DNS moves: `curl --resolve` forces a hostname to an
IP, so the alias and the redirect rules can be checked against Netlify directly while
the domain still points somewhere else.

```bash
curl -skI https://kunkeconsulting.com/ --resolve kunkeconsulting.com:443:75.2.60.5
```

### Verifying

```bash
dig +short kunkeconsulting.com
curl -sI https://kunkeconsulting.com | head -5
curl -sI https://www.kunkeconsulting.com/blog/ | head -5
```

Want: a `301` with `location: https://kunkeconsulting.pl/`, and the `/blog/` case
landing on `https://kunkeconsulting.pl/blog/` rather than the homepage — that proves
the path is being carried across, not swallowed.

## Things worth knowing

- **HSTS applies per hostname.** `public/_headers` sends
  `Strict-Transport-Security: max-age=31536000; includeSubDomains`, so the first
  browser that reaches `https://kunkeconsulting.com` will pin HTTPS on that host for
  a year. Harmless while Netlify auto-renews the certificate, but it does mean the
  `.com` cannot later be moved somewhere without working HTTPS.
- **The `.com` gets no SEO benefit and needs none.** A 301 passes authority toward
  the `.pl`, but the `.com` is brand new with no history and no inbound links, so
  there is nothing to pass. Its job is to stop somebody else owning it and to catch
  people who guess the wrong ending.
- **Do not start using the `.com` in marketing.** One public address keeps the
  redirect a safety net rather than a dependency. Every canonical, sitemap entry and
  piece of structured data on the site points at `.pl`, and that should stay true.
- **Porkbun's own URL forwarding is the fallback**, not the plan. It works without
  Netlify involvement, but it hands off at Porkbun's edge rather than issuing a clean
  301 from the site's own infrastructure, and it is one more place to remember.
- **Email is separate, and `@kunkeconsulting.com` currently bounces.** Porkbun left
  its own `MX` records (`fwd1`/`fwd2.porkbun.com`) and an SPF `TXT` in place, so mail
  to the `.com` enters Porkbun's forwarding service with no destination configured.
  Those records were deliberately not deleted — they are what a forwarding address
  would need. Setting one up is a Porkbun-side change and touches nothing here. The
  site's only contact address remains `info@kunkeconsulting.pl`.
- **The `_acme-challenge` TXT records at Porkbun are Porkbun's, not Netlify's.**
  They belong to the free certificate Porkbun issues for its own forwarding, and are
  unrelated to the Let's Encrypt certificate Netlify serves. Harmless; leave them.
