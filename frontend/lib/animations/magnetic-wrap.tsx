"use client";

import { motion } from "framer-motion";
import { useMagneticHover } from "./hooks";

interface MagneticWrapProps {
  children: React.ReactNode;
  strength?: number;
  className?: string;
  as?: "span" | "div";
}

/** Wraps content with subtle magnetic hover (cursor-follow) effect. Use on primary CTAs. */
export function MagneticWrap({
  children,
  strength = 0.12,
  className,
  as: Component = "span",
}: MagneticWrapProps) {
  const { x, y, handleMouseMove, handleMouseLeave } = useMagneticHover({ strength });
  const props = { className, style: { x, y }, onMouseMove: handleMouseMove, onMouseLeave: handleMouseLeave };
  return Component === "div" ? (
    <motion.div {...props}>
      {children}
    </motion.div>
  ) : (
    <motion.span {...props}>
      {children}
    </motion.span>
  );
}
