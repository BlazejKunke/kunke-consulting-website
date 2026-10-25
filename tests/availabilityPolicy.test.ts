import assert from 'node:assert/strict';
import test from 'node:test';
import { availability, isAvailabilityWorkingDay } from '../src/content/availability.ts';

test('Sundays stay closed across clock changes and future years', () => {
  for (const date of ['2026-10-25', '2026-11-08', '2026-12-13', '2027-01-03', '2027-03-28']) {
    assert.equal(isAvailabilityWorkingDay(date), false, date);
  }
  assert.equal(isAvailabilityWorkingDay('2026-10-24'), true, 'Saturday keeps its own status');
  assert.equal(isAvailabilityWorkingDay('2026-10-26'), true, 'Monday keeps its own status');
});

test('published Sunday entries are unavailable', () => {
  for (const [date, status] of Object.entries(availability.days)) {
    if (!isAvailabilityWorkingDay(date)) assert.equal(status, 'unavailable', date);
  }
});
