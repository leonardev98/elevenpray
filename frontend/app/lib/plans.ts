/** Identificadores estables para billing y Culqi (planes recurrentes). */
export type PlanId = "free" | "plus" | "pro";

export type BillingInterval = "monthly" | "yearly";

export type PlanLimits = {
  quizzesPerMonth: number | null;
  flashcardsPerCourse: number | null;
  aiCreditsPerMonth: number | null;
};

export type PlanDefinition = {
  id: PlanId;
  amountCents: number;
  currency: "PEN";
  culqiPlanId?: string;
  highlighted?: boolean;
  featureKeys: readonly string[];
  limits: PlanLimits;
};

export const PLAN_LIMITS: Record<PlanId, PlanLimits> = {
  free: {
    quizzesPerMonth: 5,
    flashcardsPerCourse: 40,
    aiCreditsPerMonth: 10,
  },
  plus: {
    quizzesPerMonth: null,
    flashcardsPerCourse: null,
    aiCreditsPerMonth: 80,
  },
  pro: {
    quizzesPerMonth: null,
    flashcardsPerCourse: null,
    aiCreditsPerMonth: null,
  },
};

export const PLANS: readonly PlanDefinition[] = [
  {
    id: "free",
    amountCents: 0,
    currency: "PEN",
    limits: PLAN_LIMITS.free,
    featureKeys: [
      "coursesCalendar",
      "quizzesMonthly",
      "flashcardsCap",
      "communityNotes",
      "wellbeing",
    ],
  },
  {
    id: "plus",
    amountCents: 1490,
    currency: "PEN",
    highlighted: true,
    limits: PLAN_LIMITS.plus,
    featureKeys: [
      "quizzesUnlimited",
      "flashcardsUnlimited",
      "aiSummaries",
      "aiFlashcards",
      "studyAnalytics",
      "exportNotes",
    ],
  },
  {
    id: "pro",
    amountCents: 2990,
    currency: "PEN",
    limits: PLAN_LIMITS.pro,
    featureKeys: [
      "everythingPlus",
      "pdfChatUnlimited",
      "aiQuizGen",
      "aiCreditsUnlimited",
      "prioritySupport",
      "earlyAccess",
    ],
  },
] as const;

export function getPlan(id: PlanId): PlanDefinition | undefined {
  return PLANS.find((p) => p.id === id);
}

export function formatPlanPrice(
  amountCents: number,
  locale: string,
  interval: BillingInterval
): string {
  if (amountCents === 0) return locale.startsWith("es") ? "Gratis" : "Free";
  const amount = amountCents / 100;
  const formatted = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
  }).format(amount);
  const suffix =
    interval === "yearly"
      ? locale.startsWith("es")
        ? "/año"
        : "/yr"
      : locale.startsWith("es")
        ? "/mes"
        : "/mo";
  return `${formatted}${suffix}`;
}

export function yearlyAmountCents(monthlyCents: number): number {
  return monthlyCents * 10;
}

/** Uso mock para el dashboard (hasta conectar backend). */
export const MOCK_FREE_USAGE = {
  quizzesUsed: 2,
  flashcardsUsed: 28,
  aiCreditsUsed: 4,
} as const;
