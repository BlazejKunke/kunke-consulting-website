#!/usr/bin/env node
//
// Checks whether the retired contact-form Apps Script is still deployed.
//
// Removing the form from the site removed the caller, not the backend: on
// 2026-09-15 the web app was still answering, without a sign-in, to anyone
// holding the URL. See docs/contact-form-archive.md.
//
// Run this after archiving the deployment to confirm it actually stopped:
//
//   npm run check:legacy-endpoint
//
// Deliberately NOT wired into CI. The repo deploys straight from main, and a
// check that goes red on every commit until someone acts just teaches people
// to ignore red builds -- which would blunt the secret-scanning guard in
// build-check.yml that shares the same signal.
//
// GET only. Never POST here: a POST would append a junk row to whatever
// spreadsheet still sits behind the deployment.

const ID =
  'AKfycbz5xjPMBICnaCIvsE52rFHLX57iYORLXleQMUMobIorOvifsaNj5_9LEGsnBdC13NNWdQ';
const URL_ = `https://script.google.com/macros/s/${ID}/exec`;

const res = await fetch(URL_, { method: 'GET', redirect: 'follow' });
const body = await res.text();

// A live deployment renders the Apps Script host page, which carries the
// sandbox frame and the "created by another user" banner. A deleted or
// archived one returns Google's error page instead.
const live =
  res.status === 200 &&
  (body.includes('userCodeAppPanel') || body.includes('ppConfig'));

if (live) {
  console.error(
    `STILL LIVE — the retired form backend is deployed and answering (HTTP ${res.status}, no sign-in required).\n` +
      `Archive it from the Google account that owns it, then re-run this.\n` +
      `See docs/contact-form-archive.md.`
  );
  process.exit(1);
}

console.log(`Looks closed — HTTP ${res.status}, no Apps Script app page returned.`);
