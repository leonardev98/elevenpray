"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, MessageSquare, Send, Sparkles } from "lucide-react";
import type { UiChatMessage } from "../hooks/use-study-session";

interface StudyChatProps {
  messages: UiChatMessage[];
  chatLoading: boolean;
  disabled: boolean;
  onSend: (text: string) => void;
}

export function StudyChat({ messages, chatLoading, disabled, onSend }: StudyChatProps) {
  const t = useTranslations("studentStudy");
  const [input, setInput] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || disabled || chatLoading) return;
    onSend(input);
    setInput("");
  }

  return (
    <div className="student-card flex flex-col p-4">
      <div className="max-h-[420px] flex-1 space-y-4 overflow-y-auto pr-1">
        {messages.length === 0 && (
          <p className="text-center text-sm text-[var(--app-fg-muted)]">{t("chatEmpty")}</p>
        )}
        {messages.map((m) =>
          m.role === "assistant" ? (
            <div key={m.id} className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--app-primary-soft)]">
                <Sparkles className="h-4 w-4 text-[var(--app-primary)]" />
              </div>
              <div className="max-w-[90%] rounded-2xl rounded-tl-sm bg-[var(--app-surface-soft)] px-4 py-3 text-sm text-[var(--app-fg)] whitespace-pre-wrap">
                {m.content || (chatLoading ? "…" : "")}
              </div>
            </div>
          ) : (
            <div key={m.id} className="flex justify-end gap-3">
              <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-[var(--app-primary-soft)] px-4 py-3 text-sm text-[var(--app-fg)] whitespace-pre-wrap">
                {m.content}
              </div>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--app-surface-elevated)] text-xs font-medium text-[var(--app-fg)]">
                {t("you")}
              </div>
            </div>
          ),
        )}
        {chatLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex items-center gap-2 text-sm text-[var(--app-fg-muted)]">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("chatThinking")}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex items-center gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] px-4 py-2">
          <MessageSquare className="h-4 w-4 shrink-0 text-[var(--app-fg-muted)]" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={disabled || chatLoading}
            placeholder={disabled ? t("chatDisabled") : t("chatPlaceholder")}
            className="min-w-0 flex-1 bg-transparent text-sm text-[var(--app-fg)] outline-none placeholder:text-[var(--app-fg-muted)]"
          />
        </div>
        <button
          type="submit"
          disabled={disabled || chatLoading || !input.trim()}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--app-primary)] text-white disabled:opacity-50"
          aria-label={t("chatSend")}
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
