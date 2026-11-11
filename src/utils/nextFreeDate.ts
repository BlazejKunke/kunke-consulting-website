// The "next free date" readout on the two homepages.
//
// Pure and data-free on purpose: the build passes the list of free days in a
// data attribute, and the same functions run again in the browser so the
// readout rolls forward at midnight without a deploy. Nothing here imports
// the calendar itself.

export type ReadoutLanguage = 'pl' | 'en';

// A date picked from a calendar nobody has touched for three weeks is worse
// than no date at all, so the readout hides itself instead of guessing.
export const STALE_AFTER_DAYS = 21;

const toUtc = (dateKey: string) => Date.UTC(
  Number(dateKey.slice(0, 4)),
  Number(dateKey.slice(5, 7)) - 1,
  Number(dateKey.slice(8, 10)),
);

export const daysBetween = (from: string, to: string) =>
  Math.round((toUtc(to) - toUtc(from)) / 86_400_000);

/** First free day strictly after today, or null when there is none or the calendar is stale. */
export const pickNextFreeDate = (
  freeDays: readonly string[],
  today: string,
  updatedAt: string,
): string | null => {
  if (daysBetween(updatedAt, today) > STALE_AFTER_DAYS) return null;
  return [...freeDays].sort().find((day) => day > today) ?? null;
};

// Two letters, the way a digital watch prints the weekday.
const WEEKDAYS: Record<ReadoutLanguage, readonly string[]> = {
  pl: ['ND', 'PN', 'WT', 'ŚR', 'CZ', 'PT', 'SB'],
  en: ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'],
};

/** "2026-12-01" becomes "WT 01.12" or "TU 01.12". */
export const formatReadout = (dateKey: string, language: ReadoutLanguage = 'pl') => {
  const weekday = WEEKDAYS[language][new Date(toUtc(dateKey)).getUTCDay()];
  return `${weekday} ${dateKey.slice(8, 10)}.${dateKey.slice(5, 7)}`;
};

/** The spoken version for screen readers and the link title. */
export const formatSpoken = (dateKey: string, language: ReadoutLanguage = 'pl') =>
  new Intl.DateTimeFormat(language === 'en' ? 'en-GB' : 'pl-PL', {
    weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC',
  }).format(new Date(toUtc(dateKey) + 12 * 3_600_000));
