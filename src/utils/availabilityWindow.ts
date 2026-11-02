export const nextAvailableDays = (days: string[], today: string, count = 3) =>
  days.filter(day => day >= today).sort().slice(0, count);

export const isPastMonth = (month: string, today: string) => month < today.slice(0, 7);


/** The current Warsaw month plus the next two, with automatic year rollover. */
export const getAvailabilityMonths = (today: string): string[] => {
  const [year, month] = today.split('-').map(Number);
  return Array.from({ length: 3 }, (_, offset) =>
    new Date(Date.UTC(year, month - 1 + offset, 1)).toISOString().slice(0, 7));
};

export const getMonthDays = (monthKey: string): string[] => {
  const [year, month] = monthKey.split('-').map(Number);
  return Array.from({ length: new Date(Date.UTC(year, month, 0)).getUTCDate() },
    (_, day) => `${monthKey}-${String(day + 1).padStart(2, '0')}`);
};
