"use client";

import { useState } from "react";
import { Check, CheckCircle2, Flame } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { useGamification } from "../gamification-context";

interface SidebarStreakCompactProps {
  collapsed?: boolean;
}

export function SidebarStreakCompact({ collapsed = false }: SidebarStreakCompactProps) {
  const { data } = useGamification();
  const [showTooltip, setShowTooltip] = useState(false);
  const { estudio, tareas } = data.rachas;

  return (
    <div className="relative px-2 pb-2">
      <div className="mx-2 mb-3 border-t border-[var(--app-border)]" />
      <Link
        href="/app/logros"
        className={cn(
          "block rounded-xl px-2 py-2 transition hover:bg-[var(--app-surface-elevated)]",
          collapsed && "flex flex-col items-center gap-2",
        )}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <div className={cn("space-y-2", collapsed && "space-y-3")}>
          <div className={cn("flex items-center gap-2", collapsed && "flex-col gap-0.5")}>
            <Flame
              className={cn(
                "h-4 w-4 shrink-0",
                estudio.hoy ? "text-[var(--racha)]" : "text-[var(--text-muted)]",
              )}
            />
            <div className={cn("flex items-center gap-1.5", collapsed && "flex-col")}>
              <span className="text-lg font-semibold text-[var(--racha)]">{estudio.actual}</span>
              {estudio.hoy && (
                <Check className="h-3.5 w-3.5 text-[var(--success)]" aria-label="Completado hoy" />
              )}
            </div>
            {!collapsed && (
              <span className="text-[10px] text-[var(--text-muted)]">días de estudio</span>
            )}
          </div>

          <div className={cn("flex items-center gap-2", collapsed && "flex-col gap-0.5")}>
            <CheckCircle2
              className={cn(
                "h-4 w-4 shrink-0",
                tareas.hoy ? "text-[var(--accent)]" : "text-[var(--text-muted)]",
              )}
            />
            <span className="text-lg font-semibold text-[var(--accent)]">{tareas.actual}</span>
            {!collapsed && (
              <span className="text-[10px] text-[var(--text-muted)]">tareas seguidas</span>
            )}
          </div>
        </div>
      </Link>

      {showTooltip && !collapsed && (
        <div className="absolute bottom-full left-4 right-4 z-50 mb-1 rounded-[var(--radius-md)] border-[0.5px] border-[var(--border-strong)] bg-[var(--bg-elevated)] p-3 text-xs shadow-[var(--shadow-md)]">
          <p className="flex items-center gap-1.5 text-[var(--text-primary)]">
            <Flame className="h-3.5 w-3.5 text-[var(--racha)]" />
            Racha estudio: {estudio.actual} días · Mejor: {estudio.mejor}
          </p>
          <p className="mt-1.5 flex items-center gap-1.5 text-[var(--text-body)]">
            <CheckCircle2 className="h-3.5 w-3.5 text-[var(--accent)]" />
            Racha tareas: {tareas.actual} días · Mejor: {tareas.mejor}
          </p>
        </div>
      )}
    </div>
  );
}
