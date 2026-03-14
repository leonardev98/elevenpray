/**
 * Framer Motion / Motion variants for consistent UI animations.
 * Use with motion components: initial, animate, exit, variants.
 */

import { DURATION_FAST, DURATION_NORMAL, EASE_SMOOTH, STAGGER_DELAY } from "./constants";

/** Fade + slide up entry: opacity 0→1, y 20→0. Duration 0.4s. */
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
  transition: { duration: DURATION_NORMAL, ease: EASE_SMOOTH },
} as const;

/** Same as fadeInUp but with configurable transition. */
export function fadeInUpTransition(overrides?: { duration?: number; ease?: number[] }) {
  return {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 10 },
    transition: {
      duration: overrides?.duration ?? DURATION_NORMAL,
      ease: overrides?.ease ?? EASE_SMOOTH,
    },
  };
}

/** Container for staggered children. Use with staggerChildren. */
export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: STAGGER_DELAY,
      delayChildren: 0,
    },
  },
} as const;

/** Item variant for use inside staggerContainer. */
export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: DURATION_NORMAL, ease: EASE_SMOOTH },
} as const;

/** Modal backdrop: fade only. */
export const modalBackdrop = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: DURATION_FAST },
} as const;

/** Modal panel: scale 0.95→1 + fade. */
export const modalPanel = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: DURATION_NORMAL, ease: EASE_SMOOTH },
} as const;

/** Drawer overlay: fade. */
export const drawerOverlay = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: DURATION_FAST },
} as const;

/** Drawer panel: slide from right (x 100% → 0). */
export const drawerPanel = {
  initial: { x: "100%" },
  animate: { x: 0 },
  exit: { x: "100%" },
  transition: { duration: 0.3, ease: EASE_SMOOTH },
} as const;

/** Drawer panel from left. */
export const drawerPanelLeft = {
  initial: { x: "-100%" },
  animate: { x: 0 },
  exit: { x: "-100%" },
  transition: { duration: 0.3, ease: EASE_SMOOTH },
} as const;

/** Page transition: fade + slight slide. */
export const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
  transition: { duration: 0.35, ease: EASE_SMOOTH },
} as const;

/** Hover card: scale 1.03, translateY -3px. Use with whileHover. */
export const hoverCard = {
  scale: 1.03,
  y: -3,
  transition: { duration: 0.2, ease: EASE_SMOOTH },
} as const;

/** Button hover/tap. Use with whileHover and whileTap. */
export const buttonMotion = {
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
  transition: { duration: 0.15 },
} as const;
