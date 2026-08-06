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

### The two remaining steps (dashboard work, not code)

**1. Netlify — attach the domain.** Site → Domain management → Add a domain →
`kunkeconsulting.com`, then again for `www.kunkeconsulting.com`. Both go in as
*domain aliases*. Do **not** set either as the primary domain; `kunkeconsulting.pl`
must stay primary or the redirect runs backwards.

**2. Porkbun — point the DNS at Netlify.** Delete Porkbun's default parking records
first (the apex `A` records at `207.207.210.x`, plus any URL-forwarding entry — a
fresh Porkbun domain forwards to an `l.ink` parking page). Then:

```
ALIAS  (host blank / @)  apex-loadbalancer.netlify.com
CNAME  www               kunkeconsulting.netlify.app
```

Porkbun supports `ALIAS` at the apex, which is preferable to a hard-coded `A`
record: if Netlify ever changes the load balancer IP, an ALIAS follows and an `A`
record silently breaks.

DNS propagates in minutes to a couple of hours. Netlify issues the Let's Encrypt
certificate covering the `.com` only *after* the DNS resolves to it, so HTTPS on the
`.com` will fail until that lands. If the certificate has not appeared after an hour,
Netlify's Domain management panel has a "Renew certificate" button that forces it.

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
- **Email is separate.** Nothing here creates or forwards `@kunkeconsulting.com`
  mail. Porkbun offers free email forwarding if an address on the `.com` is ever
  wanted; the site's only contact address remains `info@kunkeconsulting.pl`.
