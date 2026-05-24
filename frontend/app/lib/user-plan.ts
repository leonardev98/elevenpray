import { getMockUserPlan } from "./billing-mock";
import type { BillingInterval, PlanId } from "./plans";

/** Toda cuenta nueva empieza en Gratis hasta que billing real (o mock) actualice el plan. */
export function getEffectiveUserPlan(): {
  planId: PlanId;
  interval: BillingInterval | null;
  source: "default" | "mock";
} {
  const mock = getMockUserPlan();
  if (mock) {
    return { planId: mock.planId, interval: mock.interval, source: "mock" };
  }
  return { planId: "free", interval: null, source: "default" };
}
