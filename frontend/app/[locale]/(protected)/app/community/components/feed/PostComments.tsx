"use client";

import { Send } from "lucide-react";
import type { MockComment } from "../../community-types";
import { UserAvatar } from "../UserAvatar";

export function PostComments({ comments }: { comments: MockComment[] }) {
  return (
    <div className="border-t border-[var(--app-border)] pt-4">
      <ul className="mb-4 space-y-3">
        {comments.map((comment) => (
          <li key={comment.id} className="flex gap-3">
            <UserAvatar initial={comment.authorInitial} colorClass={comment.authorColor} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-[var(--app-fg)]">{comment.author}</p>
              <p className="text-sm text-[var(--app-fg-secondary)]">{comment.text}</p>
              <p className="mt-0.5 text-xs text-[var(--app-fg-muted)]">{comment.timeAgo}</p>
            </div>
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-3">
        <UserAvatar initial="A" colorClass="bg-[var(--app-primary)]" size="sm" />
        <div
          role="textbox"
          aria-readonly
          className="flex-1 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] px-3 py-2 text-sm text-[var(--app-fg-muted)]"
        >
          Escribe un comentario...
        </div>
        <button
          type="button"
          aria-label="Enviar comentario"
          className="rounded-lg p-2 text-[var(--app-fg-muted)] transition-colors hover:bg-[var(--app-surface-soft)] hover:text-[var(--app-primary)]"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
