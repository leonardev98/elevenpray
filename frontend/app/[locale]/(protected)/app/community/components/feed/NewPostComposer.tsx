"use client";

import { useAuth } from "@/app/providers/auth-provider";
import { UserAvatar } from "../UserAvatar";
import { authorColorClass, getAuthorInitial } from "../../community-utils";

export function NewPostComposer({ onOpen }: { onOpen: () => void }) {
  const { user } = useAuth();
  const name = user?.name ?? "Tú";

  return (
    <div className="student-card mb-6 flex gap-3 bg-[var(--app-surface-elevated)] p-4">
      <UserAvatar initial={getAuthorInitial(name)} colorClass={authorColorClass(name)} />
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
