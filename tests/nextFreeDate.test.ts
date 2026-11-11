import assert from 'node:assert/strict';
import test from 'node:test';
import {
  STALE_AFTER_DAYS,
  daysBetween,
  formatReadout,
  pickNextFreeDate,
} from '../src/utils/nextFreeDate.ts';

const free = ['2026-12-03', '2026-12-01', '2026-11-11', '2027-01-07'];

test('the readout shows the first free day after today, never today itself', () => {
  assert.equal(pickNextFreeDate(free, '2026-11-11', '2026-11-03'), '2026-12-01');
  assert.equal(pickNextFreeDate(free, '2026-12-01', '2026-11-30'), '2026-12-03');
  assert.equal(pickNextFreeDate(free, '2026-12-31', '2026-12-30'), '2027-01-07');
});

test('no free day, or a calendar left untouched too long, shows nothing', () => {
  assert.equal(pickNextFreeDate(free, '2027-01-07', '2027-01-06'), null);
  assert.equal(pickNextFreeDate([], '2026-11-11', '2026-11-03'), null);
  assert.equal(daysBetween('2026-11-03', '2026-11-24'), STALE_AFTER_DAYS);
  assert.equal(pickNextFreeDate(free, '2026-11-24', '2026-11-03'), '2026-12-01');
  assert.equal(pickNextFreeDate(free, '2026-11-25', '2026-11-03'), null);
});

test('the readout prints a two letter weekday and day.month in both languages', () => {
  assert.equal(formatReadout('2026-12-01', 'pl'), 'WT 01.12');
  assert.equal(formatReadout('2026-12-01', 'en'), 'TU 01.12');
  assert.equal(formatReadout('2027-01-03', 'pl'), 'ND 03.01');
});
