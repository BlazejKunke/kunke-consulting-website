import assert from 'node:assert/strict';
import test from 'node:test';
import { getDateKeyInTimeZone, isPastDate } from '../src/utils/availabilityDates';

test('uses the Warsaw calendar date around midnight', () => {
  assert.equal(getDateKeyInTimeZone(new Date('2026-07-19T21:59:59Z')), '2026-07-19');
  assert.equal(getDateKeyInTimeZone(new Date('2026-07-19T22:00:00Z')), '2026-07-20');
});

test('classifies only dates before today as past', () => {
  assert.equal(isPastDate('2026-07-19', '2026-07-20'), true);
  assert.equal(isPastDate('2026-07-20', '2026-07-20'), false);
  assert.equal(isPastDate('2026-07-21', '2026-07-20'), false);
});
