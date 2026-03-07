"use client";

import { useState } from "react";
import { useTopics } from "./topics-provider";
import { TOPIC_TYPES, type TopicTypeId } from "./topic-types";

export function AsideTopics() {
  const { topics, addTopic, removeTopic } = useTopics();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<TopicTypeId>("rutina");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    addTopic(title.trim(), type);
    setTitle("");
    setType("rutina");
    setIsOpen(false);
  }

  return (
    <aside className="flex h-full w-56 flex-shrink-0 flex-col border-r border-[var(--app-border)] bg-[var(--app-surface)]">
      <div className="border-b border-[var(--app-border)] p-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--app-fg)]/70">
          Tópicos
        </h2>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--app-navy)] py-2 text-sm font-medium text-[var(--app-white)] transition hover:opacity-90"
        >
          <span>+</span>
          Nuevo tópico
        </button>
      </div>

      {isOpen && (
        <div className="border-b border-[var(--app-border)] p-3">
          <form onSubmit={handleSubmit} className="space-y-2">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nombre del tópico"
              className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2 text-sm text-[var(--app-fg)] placeholder:text-[var(--app-fg)]/50 focus:border-[var(--app-gold)] focus:outline-none focus:ring-1 focus:ring-[var(--app-gold)]"
              autoFocus
            />
            <div className="flex flex-wrap gap-1">
              {TOPIC_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setType(t.id)}
                  className={`rounded px-2 py-1 text-xs ${
                    type === t.id
                      ? "bg-[var(--app-gold)] text-[var(--app-black)]"
                      : "bg-[var(--app-bg)] text-[var(--app-fg)] hover:bg-[var(--app-accent)] hover:text-[var(--app-white)]"
                  }`}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 rounded-lg bg-[var(--app-gold)] py-1.5 text-sm font-medium text-[var(--app-black)] hover:opacity-90"
              >
                Crear
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setTitle("");
                }}
                className="rounded-lg border border-[var(--app-border)] px-3 py-1.5 text-sm text-[var(--app-fg)] hover:bg-[var(--app-bg)]"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto p-2">
        {topics.length === 0 && !isOpen && (
          <p className="px-2 py-4 text-xs text-[var(--app-fg)]/50">
            Crea un tópico para organizar contenido.
          </p>
        )}
        <ul className="space-y-0.5">
          {topics.map((t) => {
            const typeInfo = TOPIC_TYPES.find((x) => x.id === t.type);
            return (
              <li key={t.id} className="group flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-[var(--app-bg)]">
                <span className="text-sm" aria-hidden>{typeInfo?.icon ?? "•"}</span>
                <span className="min-w-0 flex-1 truncate text-sm text-[var(--app-fg)]">
                  {t.title}
                </span>
                <button
                  type="button"
                  onClick={() => removeTopic(t.id)}
                  aria-label="Eliminar tópico"
                  className="opacity-0 text-[var(--app-fg)]/50 hover:text-red-500 group-hover:opacity-100"
                >
                  ×
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
