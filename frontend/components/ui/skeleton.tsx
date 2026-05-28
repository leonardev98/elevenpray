import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** Desactiva el brillo animado (p. ej. prefers-reduced-motion vía CSS global). */
  static?: boolean;
}

export function Skeleton({ className, static: isStatic, ...props }: SkeletonProps) {
  return (
    <div
      role="presentation"
      aria-hidden
      className={cn(
        "rounded-lg bg-[var(--app-surface-soft)]",
        !isStatic && "skeleton-shine",
        className,
      )}
      {...props}
    />
  );
}
