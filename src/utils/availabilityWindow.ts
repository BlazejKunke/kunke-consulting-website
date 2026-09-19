export const nextAvailableDays = (days: string[], today: string, count = 3) =>
  days.filter(day => day >= today).sort().slice(0, count);

export const isPastMonth = (month: string, today: string) => month < today.slice(0, 7);
