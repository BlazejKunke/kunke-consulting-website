import assert from 'node:assert/strict';
import test from 'node:test';
import { getAvailabilityMonths, getMonthDays } from '../src/utils/availabilityWindow.ts';
import { getAvailableDays, getAvailabilityStatus, renderMonthContents } from '../src/utils/availabilityMonth.ts';

test('always shows the current month and the following two, including next year', () => {
  assert.deepEqual(getAvailabilityMonths('2026-11-02'), ['2026-11', '2026-12', '2027-01']);
  assert.deepEqual(getAvailabilityMonths('2026-12-31'), ['2026-12', '2027-01', '2027-02']);
  assert.deepEqual(getAvailabilityMonths('2027-01-01'), ['2027-01', '2027-02', '2027-03']);
  assert.deepEqual(getAvailabilityMonths('2028-01-31'), ['2028-01', '2028-02', '2028-03']);
});

test('month grids have the correct dates across year boundaries and leap years', () => {
  assert.equal(getMonthDays('2027-01').length, 31);
  assert.equal(getMonthDays('2027-01').at(-1), '2027-01-31');
  assert.equal(getMonthDays('2027-02').length, 28);
  assert.equal(getMonthDays('2028-02').at(-1), '2028-02-29');
});

test('unknown future dates do not invent availability and Sundays remain closed', () => {
  assert.equal(getAvailabilityStatus('2099-01-01'), 'unconfirmed');
  assert.equal(getAvailabilityStatus('2027-01-03'), 'unavailable');
  assert.deepEqual(getAvailableDays(['2099-01']), []);
});

test('both languages render January with correct dates and Sunday policy', () => {
  for (const [locale, heading] of [['pl', 'styczeń 2027'], ['en', 'January 2027']] as const) {
    const html = renderMonthContents('2027-01', locale, '2027-01-02');
    assert.ok(html.includes(heading));
    assert.equal((html.match(/data-date=/g) ?? []).length, 31);
    assert.match(html, /class="kc-day past" data-date="2027-01-01"/);
    assert.match(html, /data-date="2027-01-03" data-status="unavailable"/);
    assert.equal((html.match(/aria-current="date"/g) ?? []).length, 1);
  }
});
