export const AVAILABILITY_TIME_ZONE = 'Europe/Warsaw';

export const getDateKeyInTimeZone = (
  date: Date,
  timeZone = AVAILABILITY_TIME_ZONE,
): string => {
  const parts = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone,
  }).formatToParts(date);

  const getPart = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value;
  const year = getPart('year');
  const month = getPart('month');
  const day = getPart('day');

  if (!year || !month || !day) {
    throw new Error(`Could not determine the current date in ${timeZone}`);
  }

  return `${year}-${month}-${day}`;
};

export const isPastDate = (dateKey: string, todayKey: string): boolean => dateKey < todayKey;
