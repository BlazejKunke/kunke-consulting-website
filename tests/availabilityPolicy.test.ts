import assert from 'node:assert/strict';
import test from 'node:test';
import { availability, availabilityProtectedRanges, isAvailabilityProtectedDate, isAvailabilityWorkingDay } from '../src/content/availability.ts';

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

test('the inclusive annual protection crosses years without closing adjacent days', () => {
  for (const date of ['2026-12-20', '2026-12-31', '2027-01-01', '2027-01-03', '2027-12-20', '2028-01-03']) {
    assert.equal(isAvailabilityProtectedDate(date), true, date);
  }
  for (const date of ['2026-12-19', '2027-01-04']) {
    assert.equal(isAvailabilityProtectedDate(date), false, date);
  }
});

test('protected dates override calendar data in both the grid and free-day summary', async () => {
  const { getAvailabilityStatus, getAvailableDays } = await import('../src/utils/availabilityMonth.ts');
  const date = '2027-01-02';
  const original = availability.days[date];
  availability.days[date] = 'available';
  availabilityProtectedRanges.push({ start: '2027-02-08', end: '2027-02-10' });
  try {
    assert.equal(getAvailabilityStatus(date), 'unavailable');
    assert.equal(getAvailabilityStatus('2027-02-08'), 'unavailable');
    assert.equal(getAvailabilityStatus('2027-02-10'), 'unavailable');
    assert.equal(isAvailabilityProtectedDate('2027-02-11'), false);
    assert.ok(!getAvailableDays(['2027-01']).includes(date));
    assert.ok(!getAvailableDays(['2027-02']).includes('2027-02-09'));
  } finally {
    availability.days[date] = original;
    availabilityProtectedRanges.pop();
  }
});
