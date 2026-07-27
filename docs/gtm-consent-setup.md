# Google Tag Manager: the consent half of the fix

The site half was done on 2026-07-27 (see `ConsentMode.astro`). This is the part
that has to happen inside the GTM container, which nobody can do from the repo.

Everything below is written to be handed to someone — or something — with no prior
knowledge of this container. Copy the block into an AI assistant that can drive a
browser, or follow it yourself.

---

## The prompt

```
You are configuring consent settings in a Google Tag Manager container for a small
Polish consulting business. Work carefully and do not delete anything without asking.

## Background you need

The website kunkeconsulting.pl had a cookie banner that did nothing. The page was
pushing a made-up event name into GTM instead of Google's real consent command, so
GTM never received a consent signal and fired every tag regardless of what the
visitor clicked. Google Analytics and Google Ads were tracking people before they
answered the banner, and continued after they clicked "reject".

The website code has already been fixed. It now:
- declares all six Consent Mode v2 categories as "denied" by default, using the real
  gtag('consent', 'default', {...}) command
- does NOT load GTM at all until the visitor clicks "Akceptuję" (this is called
  "basic consent mode", as opposed to "advanced")
- sends gtag('consent', 'update', {...}) when they accept

Because GTM does not load until consent is given, the container settings you are
about to change are a SECOND line of defence, not the primary one. That matters for
how you should think about risk: you cannot break the visitor's privacy by getting
this wrong, but you can leave a gap that opens up if someone later changes the site
code back. Configure it properly anyway.

## The container

Container ID: GTM-MWRKLP2S
Account: the Google account that owns kunkeconsulting.pl analytics.

## Your tasks, in order

### 1. Inventory what is actually in there

Go to the Tags section and list every tag, with its type and its trigger. Do the same
for Triggers and Variables. Report this list before changing anything. The owner does
not know what is in this container and needs to see it.

Pay particular attention to:
- Google Analytics 4 tags (configuration and event tags)
- Google Ads tags, including "Conversion Linker" — this is what writes the _gcl_au
  cookie, and it was firing before consent
- anything from a non-Google vendor (Meta/Facebook pixel, LinkedIn Insight, Hotjar,
  Clarity, etc.)

### 2. Turn on the consent overview

Admin → Container Settings → find the checkbox labelled "Enable consent overview"
(it may sit under an "Additional Settings" heading). Tick it and save.

This adds a shield icon at the top of the Tags list. Click it. Every tag is now
sorted into "Consent Configured" and "Consent Not Configured".

### 3. Configure consent on each tag that needs it

Work through the "Consent Not Configured" list. For each tag:

Open it → Advanced Settings → Consent Settings.

- Google Analytics 4 tags: these have built-in consent checks for analytics_storage
  and usually appear as already configured. If so, leave them alone.
- Google Ads tags and Conversion Linker: built-in checks for ad_storage and
  ad_user_data. Again, usually already configured — leave them.
- Any NON-Google tag: choose "Require additional consent for tag to fire" and add the
  consent types it needs. For an advertising or remarketing pixel that means
  ad_storage AND ad_user_data AND ad_personalization. For an analytics or session
  recording tool that means analytics_storage.

If you are unsure what a tag needs, require MORE consent rather than less, and flag
it in your report.

### 4. Report, do not delete

The homepage was calling ad.doubleclick.net and www.google.com/ccm/collect, which are
Google Ads conversion endpoints. If the business is not running Google Ads campaigns,
those tags are collecting data for no benefit and should be removed.

DO NOT delete them yourself. List them, say what each one does, and ask the owner
whether any Google Ads campaigns are running. Deleting a conversion tag from a live
campaign destroys the campaign's optimisation data.

### 5. Publish

Changes in GTM do nothing until published. Click Submit (top right), give the version
a name like "Consent Mode v2 configuration", and Publish.

### 6. Verify

Use GTM's Preview mode, and separately check the real site:

Open kunkeconsulting.pl in a fresh Chrome Incognito window. Press F12, go to the
Network tab, type "collect" into the filter box, then reload.

- Before touching the banner: the list must stay EMPTY.
- After clicking "Odrzucam", including after navigating to another page: still EMPTY.
- After clicking "Akceptuję": requests appear.

If anything appears in the first or second case, something is wrong — report exactly
which URL appeared and at what point.

## Rules

- Do not delete any tag, trigger or variable without explicit confirmation.
- Do not change the GA4 measurement ID or the Google Ads conversion IDs.
- Do not enable "advanced consent mode" or any setting described as sending
  cookieless pings. The owner deliberately chose basic mode.
- If a menu label does not match what is written here, the GTM interface has changed.
  Describe what you see instead of guessing.
- Report what you changed, tag by tag, at the end.
```

---

## Why basic and not advanced

Advanced consent mode loads GTM immediately in a restricted state and still sends
anonymous "cookieless pings" to Google before consent, which Google uses to model the
visitors you did not measure. It gives better data. It also means something still
goes to Google before the visitor agrees, which EU regulators have not settled.

Blaze chose basic in July 2026: he sells advisory to companies that ask about exactly
this, and "we send nothing until you agree" is a position that needs no argument.
If that is ever revisited, the change is in `ConsentMode.astro` — load GTM
unconditionally and keep the `consent default` block as it is.

## Known remaining gap

`BaseLayout` pages load Inter from `fonts.googleapis.com`, which contacts Google — and
therefore discloses the visitor's IP — before any consent. A German court found
against exactly this in 2022. It is unrelated to GTM and not fixed by anything above.
The fix is to self-host the font files. The standalone homepages already use a system
font stack and are unaffected.
