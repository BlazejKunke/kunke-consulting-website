import { availability, isAvailabilityWorkingDay, type AvailabilityStatus } from '../content/availability.ts';
import { getMonthDays } from './availabilityWindow.ts';

type Locale = 'pl' | 'en';
type DisplayStatus = AvailabilityStatus | 'unconfirmed';

export const getAvailabilityStatus = (date: string): DisplayStatus => {
  if (!isAvailabilityWorkingDay(date)) return 'unavailable';
  const status = availability.days[date];
  if (!status) return 'unconfirmed';
  // Saturdays can be partially available, but never a full working day.
  return new Date(`${date}T12:00:00Z`).getUTCDay() === 6 && status === 'available'
    ? 'partially-available' : status;
};

export const getAvailableDays = (months: string[]) =>
  months.flatMap(getMonthDays).filter(day => getAvailabilityStatus(day) === 'available');

export const getMonthHeading = (month: string, locale: Locale) =>
  new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'pl-PL', {
    month: 'long', year: 'numeric', timeZone: 'UTC',
  }).format(new Date(`${month}-01T12:00:00Z`));

// Shared by the static page and browser rollover so both use identical markup.
// All interpolated values come from ISO date keys or the fixed labels below.
export const renderMonthContents = (month: string, locale: Locale, today: string) => {
  const en = locale === 'en';
  const labels = en
    ? { available: 'Available', 'partially-available': 'Partial', unavailable: 'Unavailable', unconfirmed: 'Confirm', past: 'Past' }
    : { available: 'Wolny', 'partially-available': 'Częściowo', unavailable: 'Niedostępny', unconfirmed: 'Potwierdź', past: 'Miniony' };
  const weekdays = en ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] : ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Ndz'];
  const format = new Intl.DateTimeFormat(en ? 'en-GB' : 'pl-PL', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  });
  const start = (new Date(`${month}-01T12:00:00Z`).getUTCDay() + 6) % 7;
  const days = getMonthDays(month).map(date => {
    const status = getAvailabilityStatus(date);
    const displayStatus = date < today ? 'past' : status;
    const label = `${format.format(new Date(`${date}T12:00:00Z`))}: ${labels[displayStatus]}`;
    return `<div class="kc-day ${displayStatus}" data-date="${date}" data-status="${status}" aria-label="${label}" title="${label}"${date === today ? ' aria-current="date"' : ''}><span>${Number(date.slice(8))}</span><small>${labels[displayStatus]}</small></div>`;
  });
  return `<h2 id="month-${month}">${getMonthHeading(month, locale)}</h2>
    <div class="kc-weekdays" aria-hidden="true">${weekdays.map(day => `<span>${day}</span>`).join('')}</div>
    <div class="kc-days">${'<span aria-hidden="true"></span>'.repeat(start)}${days.join('')}</div>`;
};
