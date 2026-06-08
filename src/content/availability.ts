export type AvailabilityStatus = 'available' | 'partially-available' | 'unavailable';

export const availability = {
  year: 2026,
  months: [4, 7, 8, 9, 10, 11, 12],
  defaultStatus: 'available' as AvailabilityStatus,
  updatedAt: '2026-06-08',
  days: {
    // Dodawaj wyjątki w formacie: 'RRRR-MM-DD': 'status'.
    // Przykład: '2026-07-10': 'unavailable',
  } as Record<string, AvailabilityStatus>,
};
