import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { articleTranslation } from '../src/utils/locales.ts';
import { nextAvailableDays, isPastMonth } from '../src/utils/availabilityWindow.ts';

const consentScript = readFileSync(new URL('../src/components/ConsentMode.astro', import.meta.url), 'utf8').match(/<script is:inline>([\s\S]*?)<\/script>/)![1];
function consentBrowser(choice?: string, tracking = true) {
  const cookies = new Map<string,string>([['_ga', 'old-analytics'], ['_gcl_au', 'old-ads'], ['_gac_test','old-campaign'], ['unrelated', 'keep']]);
  if(choice) cookies.set('cookie_consent', choice);
  const writes: string[] = [];
  const scripts: string[] = [];
  const events = new Map<string, (...args: any[]) => void>();
  let reloads = 0;
  const context: any = {
    document: {
      querySelector: () => ({ content: tracking ? 'enabled' : 'disabled' }),
      createElement: () => ({}), head: { appendChild: (script: any) => scripts.push(script.src) },
      get cookie() { return [...cookies].map(([k,v]) => `${k}=${v}`).join('; '); },
      set cookie(value: string) { writes.push(value); const [pair] = value.split(';'); const [name,content] = pair.split('='); if(value.includes('Max-Age=0')) cookies.delete(name); else cookies.set(name,content); }
    },
    location: { hostname:'kunkeconsulting.pl', pathname:'/en/availability/', protocol:'https:', reload: () => reloads++ },
    localStorage: { setItem: () => {} },
    addEventListener: (name: string, listener: any) => events.set(name, listener),
    dispatchEvent: () => {}, Event: class { type: string; constructor(type: string) { this.type = type; } },
  };
  context.window = context;
  vm.runInNewContext(consentScript, context);
  return { context, cookies, scripts, writes, events, reloads: () => reloads };
}
test('no consent, rejection and legacy broad acceptance never load optional tags', () => {
  for(const choice of [undefined, 'denied', 'granted', 'unexpected']) {
    const b = consentBrowser(choice);
    assert.equal(b.scripts.length,0);
    assert.equal(b.cookies.has('_ga'),false);
    assert.equal(b.cookies.get('unrelated'),'keep');
  }
});
test('specific analytics consent loads once, with advertising denied', () => {
  const b = consentBrowser(); b.context.kcSetConsent(true); b.context.kcSetConsent(true);
  assert.equal(b.scripts.length,1);
  assert.equal(b.context.kcGetConsent(),'analytics-v2');
  const updates = b.context.dataLayer.filter((x: any) => x[0] === 'consent');
  for(const update of updates) for(const name of ['ad_storage','ad_user_data','ad_personalization']) assert.equal(update[2][name],'denied');
  assert.equal(updates.at(-1)[2].analytics_storage,'granted');
  assert.ok(b.writes.some(w => w.includes('cookie_consent=analytics-v2') && w.includes('Secure') && w.includes('SameSite=Lax') && w.includes('Path=/')));
});
test('withdrawal persists denial, clears optional cookies, then reloads active tags', () => {
  const b = consentBrowser('analytics-v2');
  b.context.kcSetConsent(false);
  assert.equal(b.cookies.get('cookie_consent'),'denied');
  assert.equal(b.reloads(),1);
  for(const name of ['_ga','_gcl_au','_gac_test']) assert.equal(b.cookies.has(name),false);
  assert.equal(consentBrowser('denied').scripts.length,0);
});
test('blog exposes settings without adding tracking, and blocked local storage does not break saving', () => {
  const b = consentBrowser('analytics-v2',false);
  b.context.localStorage.setItem = () => { throw new Error('Storage blocked'); };
  b.context.kcSetConsent(false);
  assert.equal(b.scripts.length,0); assert.equal(b.cookies.get('cookie_consent'),'denied');
});
test('open tabs apply a withdrawn choice and stop their loaded tags', () => {
  const b = consentBrowser('analytics-v2'); b.cookies.set('cookie_consent','denied');
  b.events.get('storage')!({key:'kc-consent-change'});
  assert.equal(b.reloads(),1);
});
test('article translations are reciprocal; unpaired content has no invented alternate', () => {
  const pl = {id:'polski',data:{language:'pl',translationKey:'pair'}};
  const en = {id:'english',data:{language:'en',translationKey:'pair'}};
  assert.deepEqual(articleTranslation(pl,[pl,en]).links,articleTranslation(en,[pl,en]).links);
  assert.equal(articleTranslation(pl,[pl,en]).alternate,'/blog/english/');
  assert.equal(articleTranslation(en,[pl,en]).alternate,'/blog/polski/');
  assert.deepEqual(articleTranslation({id:'single',data:{}},[pl,en]).links,[]);
  assert.throws(() => articleTranslation(pl,[pl]),/exactly one/);
  assert.throws(() => articleTranslation(pl,[pl,{...en,data:{language:'pl',translationKey:'pair'}}]),/exactly one/);
});
test('calendar rolls over months and years without displaying expired availability', () => {
  assert.equal(isPastMonth('2026-09','2026-09-30'),false);
  assert.equal(isPastMonth('2026-09','2026-10-01'),true);
  assert.equal(isPastMonth('2026-12','2027-01-01'),true);
  const dates = ['2026-10-22','2026-10-21','2026-11-11'];
  assert.deepEqual(nextAvailableDays(dates,'2026-10-22'),['2026-10-22','2026-11-11']);
  assert.deepEqual(nextAvailableDays(dates,'2027-01-01'),[]);
});
