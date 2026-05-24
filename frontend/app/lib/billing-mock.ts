import type { BillingInterval, PlanId } from "./plans";

export type MockCheckoutResult = {
  ok: boolean;
  planId: PlanId;
  interval: BillingInterval;
  /** Simula el ID de cargo de Culqi (`chr_...`) */
  mockChargeId: string;
  message: string;
};

const STORAGE_KEY = "mitsyy_mock_plan";

export type StoredMockPlan = {
  planId: PlanId;
  interval: BillingInterval;
  activatedAt: string;
  mockChargeId?: string;
};

export function getMockUserPlan(): StoredMockPlan | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredMockPlan;
  } catch {
    return null;
  }
}

export function setMockUserPlan(data: StoredMockPlan): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/** Simula checkout hasta integrar Culqi Checkout Custom + API en backend. */
export async function mockStartCheckout(
  planId: PlanId,
  interval: BillingInterval
): Promise<MockCheckoutResult> {
  await new Promise((r) => setTimeout(r, 900));
  const mockChargeId = `chr_mock_${Date.now().toString(36)}`;
  setMockUserPlan({
    planId,
    interval,
    activatedAt: new Date().toISOString(),
    mockChargeId,
  });
  return {
    ok: true,
    planId,
    interval,
    mockChargeId,
    message: "mock_success",
  };
}

export function clearMockUserPlan(): void {
  localStorage.removeItem(STORAGE_KEY);
}
