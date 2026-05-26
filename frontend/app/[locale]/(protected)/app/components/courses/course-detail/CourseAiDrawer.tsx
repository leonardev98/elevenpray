"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ChatMsg =
  | { id: string; role: "user"; text: string }
  | { id: string; role: "assistant"; text: string };

const INITIAL_MESSAGES: ChatMsg[] = [
  { id: "m1", role: "user", text: "Explícame la regla de la cadena" },
  {
    id: "m2",
    role: "assistant",
    text: "La regla de la cadena se usa para derivar funciones compuestas. Si tienes f(g(x)), la derivada es f'(g(x)) · g'(x). Por ejemplo, si h(x) = (x²+1)³, entonces h'(x) = 3(x²+1)² · 2x = 6x(x²+1)²",
  },
];

const SUGGESTIONS = [
  "Resumen de Clase 6",
  "Quiz sobre derivadas",
  "¿Cuándo es mi próxima tarea?",
  "Flashcards de integrales",
  "Explícame límites",
];

const FOLLOW_UP = ["¿Un ejemplo más?", "Crea flashcard de esto", "Quiz sobre esto"];

const IA_EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

interface CourseAiDrawerProps {
  open: boolean;
  onClose: () => void;
  courseName: string;
}

export function CourseAiDrawer({ open, onClose, courseName }: CourseAiDrawerProps) {
  const [messages, setMessages] = useState<ChatMsg[]>(INITIAL_MESSAGES);
  const [draft, setDraft] = useState("");

  function pushUser(text: string) {
    const t = text.trim();
    if (!t) return;
    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: "user", text: t }]);
  }

  function sendDraft() {
    const t = draft.trim();
    if (!t) return;
    pushUser(t);
    setDraft("");
  }

  const lastIsAssistant = messages.length > 0 && messages[messages.length - 1]?.role === "assistant";

  return (
    <aside
      className={cn(
        "flex h-full min-h-0 w-[380px] shrink-0 flex-col border-l-[0.5px] border-[var(--border)] bg-[var(--bg-surface)]",
        "transition-transform duration-[280ms]",
        open
          ? "translate-x-0"
          : "translate-x-full pointer-events-none max-lg:translate-x-0 max-lg:pointer-events-none",
      )}
      style={{ transitionTimingFunction: IA_EASE }}
      aria-hidden={!open}
    >
      {/* Header */}
      <div className="border-b-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] px-4 pb-3 pt-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Sparkles className="h-[18px] w-[18px] shrink-0 text-[var(--accent)]" aria-hidden />
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <span className="font-semibold text-[var(--text-primary)]">Asistente IA</span>
              <span className="shrink-0 rounded-full bg-[var(--accent-subtle)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--accent)]">
                Beta
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-[var(--radius-md)] p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
            aria-label="Cerrar panel"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-[var(--text-muted)]">
          Basado en tus apuntes, clases y archivos · {courseName}
        </p>
        <div className="mt-3 h-px w-full bg-[var(--border)]" aria-hidden />
      </div>

      {/* Sugerencias */}
      <div className="border-b-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">Sugerencias</p>
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => pushUser(s)}
              className={cn(
                "rounded-[var(--radius-md)] border-[0.5px] border-[var(--border)] bg-[var(--bg-input)] px-3 py-1.5 text-xs text-[var(--text-body)] transition-colors duration-150 ease-out",
                "hover:border-[var(--accent)] hover:bg-[var(--accent-subtle)] hover:text-[var(--accent)]",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Chat */}
      <div className="min-h-0 flex-1 overflow-y-auto bg-[var(--bg-base)] px-4 py-4">
        <div className="space-y-3">
          {messages.map((m) =>
            m.role === "user" ? (
              <motion.div
                key={m.id}
                className="flex justify-end"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <div
                  className="max-w-[85%] bg-[var(--accent)] px-[14px] py-2.5 text-sm font-normal leading-snug text-[var(--accent-fg)]"
                  style={{ borderRadius: "16px 16px 4px 16px" }}
                >
                  {m.text}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={m.id}
                className="flex justify-start"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <div
                  className="max-w-[92%] border-[0.5px] border-[var(--border)] bg-[var(--bg-elevated)] px-[14px] py-3 text-sm leading-[1.6] text-[var(--text-body)]"
                  style={{ borderRadius: "16px 16px 16px 4px" }}
                >
                  <div className="mb-1.5 flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3 shrink-0 text-[var(--accent)]" aria-hidden />
                    <span className="text-[11px] font-semibold text-[var(--text-muted)]">Mitsyy IA</span>
                  </div>
                  <p className="text-sm text-[var(--text-body)]">{m.text}</p>
                </div>
              </motion.div>
            ),
          )}
          {lastIsAssistant && (
            <div className="flex flex-wrap gap-2 pl-0.5 pt-0.5">
              {FOLLOW_UP.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => pushUser(f)}
                  className={cn(
                    "rounded-[var(--radius-md)] border-[0.5px] border-[color-mix(in_srgb,var(--accent)_40%,transparent)] bg-transparent px-2.5 py-1 text-[11px] font-medium transition-colors duration-150 ease-out",
                    "text-[var(--accent)] hover:border-[var(--accent)] hover:bg-[var(--accent-subtle)]",
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="shrink-0 border-t-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] px-4 pb-3 pt-3">
        <div className="flex items-end gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                sendDraft();
              }
            }}
            rows={2}
            placeholder="Pregúntame algo del curso..."
            className={cn(
              "max-h-[4.5rem] min-h-[2.75rem] flex-1 resize-none rounded-[var(--radius-md)] border-0 bg-transparent px-1 py-2 text-sm text-[var(--text-primary)] outline-none",
              "placeholder:text-[var(--text-muted)]",
            )}
          />
          <button
            type="button"
            disabled={!draft.trim()}
            onClick={sendDraft}
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--accent-fg)] transition-transform duration-150 ease-out",
              "hover:scale-105 hover:bg-[var(--accent-hover)] disabled:pointer-events-none disabled:opacity-40",
            )}
            aria-label="Enviar"
          >
            <Send className="h-[14px] w-[14px]" />
          </button>
        </div>
        <p className="mt-2 text-center text-[10px] text-[var(--text-muted)]">Ctrl+Enter para enviar</p>
      </div>
    </aside>
  );
}
