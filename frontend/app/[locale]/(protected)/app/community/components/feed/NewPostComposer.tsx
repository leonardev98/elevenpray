"use client";

import { UserAvatar } from "../UserAvatar";

export function NewPostComposer({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="student-card mb-6 flex gap-3 bg-[var(--app-surface-elevated)] p-4">
      <UserAvatar initial="A" colorClass="bg-[var(--app-primary)]" />
      <button
        type="button"
        onClick={onOpen}
        className="flex-1 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] px-4 py-2.5 text-left text-sm text-[var(--app-fg-muted)] transition-colors hover:border-[var(--app-fg-muted)]"
      >
        Comparte algo con tu universidad...
      </button>
    </div>
  );
}
