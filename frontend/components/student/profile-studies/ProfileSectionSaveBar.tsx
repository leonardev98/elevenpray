"use client";

import { Check, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  onDiscard: () => void;
  saveLabel: string;
  savingLabel: string;
  discardLabel: string;
  unsavedHint: string;
  idleHint: string;
};

export function ProfileSectionSaveBar({
  dirty,
  saving,
  onSave,
  onDiscard,
  saveLabel,
  savingLabel,
  discardLabel,
  unsavedHint,
  idleHint,
}: Props) {
  return (
    <div
      className={cn(
        "border-t-[0.5px] px-5 py-4 transition-colors",
        dirty
          ? "border-[var(--accent)]/35 bg-[var(--accent-subtle)]/30"
          : "border-[var(--border)] bg-[var(--bg-surface)]/40",
      )}
    >
      <p
        className={cn(
          "mb-3 text-xs leading-relaxed",
          dirty ? "font-medium text-[var(--accent)]" : "text-[var(--text-muted)]",
        )}
      >
        {dirty ? unsavedHint : idleHint}
      </p>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={onSave}
          disabled={!dirty || saving}
          className={cn(
            "inline-flex h-10 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition",
            dirty
              ? "bg-[var(--accent)] text-[var(--accent-fg)] hover:bg-[var(--accent-hover)]"
              : "cursor-not-allowed border-[0.5px] border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-muted)] opacity-70",
            saving && "cursor-wait opacity-80",
          )}
        >
          <Check className="h-4 w-4" strokeWidth={2} aria-hidden />
          {saving ? savingLabel : saveLabel}
        </button>
        <button
          type="button"
          onClick={onDiscard}
          disabled={!dirty || saving}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border-[0.5px] border-[var(--border)] px-4 text-sm font-medium text-[var(--text-muted)] transition enabled:hover:border-[var(--border-strong)] enabled:hover:bg-[var(--bg-elevated)] enabled:hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
          {discardLabel}
        </button>
      </div>
    </div>
  );
}
