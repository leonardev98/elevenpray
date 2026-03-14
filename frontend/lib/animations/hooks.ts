"use client";

import { useCallback } from "react";
import { useMotionValue, useSpring } from "motion/react";
import { STAGGER_DELAY } from "./constants";

/** Returns transition with stagger delay for list item at index. */
export function useStaggerDelay(index: number) {
  return {
    delay: index * STAGGER_DELAY,
  };
}

/** Optional: subtle magnetic hover — button follows cursor slightly. Use ref on the element. */
export function useMagneticHover(options?: { strength?: number }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const spring = { type: "spring" as const, stiffness: 150, damping: 15 };
  const xSpring = useSpring(x, spring);
  const ySpring = useSpring(y, spring);
  const strength = options?.strength ?? 0.15;

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const el = e.currentTarget;
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = (e.clientX - centerX) / rect.width;
      const dy = (e.clientY - centerY) / rect.height;
      x.set(dx * strength * 12);
      y.set(dy * strength * 12);
    },
    [strength, x, y]
  );

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return { x: xSpring, y: ySpring, handleMouseMove, handleMouseLeave };
}
