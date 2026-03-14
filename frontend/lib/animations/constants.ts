/**
 * Shared animation timing and easing for premium UI (Stripe / Linear / Vercel style).
 * Use only transform and opacity for 60fps.
 */

export const DURATION_FAST = 0.2;
export const DURATION_NORMAL = 0.4;
export const DURATION_PAGE = 0.35;

/** cubic-bezier(0.22, 1, 0.36, 1) — smooth ease-out */
export const EASE_SMOOTH = [0.22, 1, 0.36, 1] as const;

/** Stagger delay per item in lists/grids (seconds) */
export const STAGGER_DELAY = 0.05;
