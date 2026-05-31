export const CYCLE_YEARS = [2024, 2025, 2026, 2027, 2028] as const;
export const CYCLE_PERIOD_VALUES = ["I", "II", "Verano"] as const;
export type CyclePeriod = (typeof CYCLE_PERIOD_VALUES)[number];

export function parseCycle(
  cycle: string,
): { year: string; period: CyclePeriod } | null {
  const match = /^(\d{4})-(I|II|Verano)$/.exec(cycle.trim());
  if (!match) return null;
  return { year: match[1], period: match[2] as CyclePeriod };
}

export function formatCycle(year: string, period: CyclePeriod): string {
  return `${year}-${period}`;
}

export function defaultCycleYear(): string {
  return String(new Date().getFullYear());
}
