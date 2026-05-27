"use client";

import { AlertCircle } from "lucide-react";
import { FOCUS_TROUBLE_ACTIONS } from "../wellbeing-mock-data";

export function FocusTroubleSection() {
  return (
    <section className="rounded-2xl border-2 border-orange-500/30 bg-gradient-to-br from-orange-500/5 to-[var(--app-surface-elevated)] p-4 shadow-lg transition-all duration-300 hover:shadow-xl hover:border-orange-500/50">
      <button
        type="button"
        className="flex w-full items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/20">
            <AlertCircle className="h-5 w-5 text-orange-500" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-bold text-[var(--app-fg)]">No puedo concentrarme</h3>
            <p className="text-[10px] text-[var(--app-fg-muted)]">
              Botón de emergencia
            </p>
          </div>
        </div>
        <div className="rounded-full bg-orange-500 px-3 py-1">
          <span className="text-xs font-bold text-white">AYUDA</span>
        </div>
      </button>

      <div className="mt-4 grid grid-cols-2 gap-2 border-t border-[var(--app-border)] pt-4">
        {FOCUS_TROUBLE_ACTIONS.map((action) => (
          <button
            key={action.id}
            type="button"
            className="flex flex-col items-center gap-1 rounded-xl bg-[var(--app-surface)] p-3 text-center transition-all duration-200 hover:bg-orange-500/10 hover:scale-105"
          >
            <span className="text-lg">{action.icon}</span>
            <span className="text-[10px] font-medium text-[var(--app-fg)]">
              {action.title}
            </span>
            <span className="text-[9px] text-[var(--app-fg-muted)]">
              {action.duration}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
