export function getWeekDateRange(year: number, weekNumber: number): { from: string; to: string } {
  const jan1 = new Date(year, 0, 1);
  const firstMonday = new Date(jan1);
  const day = jan1.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  firstMonday.setDate(jan1.getDate() + offset);
  const start = new Date(firstMonday);
  start.setDate(firstMonday.getDate() + (weekNumber - 1) * 7);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return {
    from: start.toISOString().slice(0, 10),
    to: end.toISOString().slice(0, 10),
  };
}

export const DAY_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
