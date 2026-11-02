export const nextAvailableDays = (days: string[], today: string, count = 3) =>
  days.filter(day => day >= today).sort().slice(0, count);

export const isPastMonth = (month: string, today: string) => month < today.slice(0, 7);


/** Four visible months and one prepared month for the next rollover. */
export const AVAILABILITY_VISIBLE_MONTHS = 4;
export const AVAILABILITY_BUFFER_MONTHS = 1;

export const getAvailabilityMonths = (today: string, count = AVAILABILITY_VISIBLE_MONTHS): string[] => {
  const [year, month] = today.split('-').map(Number);
  return Array.from({ length: count }, (_, offset) =>
    new Date(Date.UTC(year, month - 1 + offset, 1)).toISOString().slice(0, 7));
};

export const getPreparedAvailabilityMonths = (today: string): string[] =>
  getAvailabilityMonths(today, AVAILABILITY_VISIBLE_MONTHS + AVAILABILITY_BUFFER_MONTHS);

export const getMonthDays = (monthKey: string): string[] => {
  const [year, month] = monthKey.split('-').map(Number);
  return Array.from({ length: new Date(Date.UTC(year, month, 0)).getUTCDate() },
    (_, day) => `${monthKey}-${String(day + 1).padStart(2, '0')}`);
};
