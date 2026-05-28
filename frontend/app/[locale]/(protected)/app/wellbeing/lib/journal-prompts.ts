const JOURNAL_PROMPT_KEYS = [
  "hardTopic",
  "smallWin",
  "energyDrain",
  "examPrep",
  "focusBlocker",
  "classClarity",
  "studyMomentum",
  "nextStep",
  "timeUse",
  "reviewPriority",
  "helpNeeded",
  "deepWork",
  "consistency",
  "checkpoint",
  "tomorrowPlan",
] as const;

export type JournalPromptKey = (typeof JOURNAL_PROMPT_KEYS)[number];

function hashDate(ymd: string): number {
  let hash = 0;
  for (let i = 0; i < ymd.length; i++) {
    hash = (hash * 31 + ymd.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function toYmd(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getJournalPromptKeyForDate(date = new Date()): JournalPromptKey {
  const idx = hashDate(toYmd(date)) % JOURNAL_PROMPT_KEYS.length;
  return JOURNAL_PROMPT_KEYS[idx];
}

export function getAllJournalPromptKeys(): readonly JournalPromptKey[] {
  return JOURNAL_PROMPT_KEYS;
}
