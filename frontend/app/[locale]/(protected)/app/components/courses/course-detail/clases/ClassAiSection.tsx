"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { ArrowRight, HelpCircle, Layers, Sparkles, Wand2 } from "lucide-react";
import { AiMockModal, type AiAction } from "./AiMockModal";

interface ClassAiSectionProps {
  className: string;
}

export function ClassAiSection({ className }: ClassAiSectionProps) {
  const [activeAction, setActiveAction] = useState<AiAction | null>(null);

  return (
    <section className="relative overflow-hidden rounded-[var(--radius-lg)] border-[0.5px] border-[color-mix(in_srgb,var(--accent)_45%,transparent)] bg-[color-mix(in_srgb,var(--accent-subtle)_75%,transparent)] p-5">
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full opacity-50"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--accent) 24%, transparent) 0%, transparent 70%)",
        }}
        aria-hidden
      />

      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border-[0.5px] border-[color-mix(in_srgb,var(--accent)_40%,transparent)] bg-[var(--bg-elevated)] text-[var(--accent)]">
              <Wand2 className="h-4 w-4" aria-hidden />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                  Generar con IA
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full border-[0.5px] border-[color-mix(in_srgb,var(--accent)_50%,transparent)] bg-[var(--bg-elevated)] px-2 py-0.5 text-[10px] font-medium text-[var(--accent)]">
                  <Sparkles className="h-2.5 w-2.5" aria-hidden />
                  Próximamente
                </span>
              </div>
              <p className="mt-1 max-w-[52ch] text-xs leading-relaxed text-[var(--text-body)]">
                ¿Tienes mucho material de esta clase? La IA podrá generar un resumen, crear
                flashcards o armar un quiz automáticamente a partir de tus apuntes y archivos.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <AiButton
            icon={Sparkles}
            title="Resumir clase"
            subtitle="Síntesis de puntos clave"
            onClick={() => setActiveAction("summary")}
          />
          <AiButton
            icon={Layers}
            title="Generar flashcards"
            subtitle="Tarjetas pregunta/respuesta"
            onClick={() => setActiveAction("flashcards")}
          />
          <AiButton
            icon={HelpCircle}
            title="Crear quiz"
            subtitle="Preguntas de repaso"
            onClick={() => setActiveAction("quiz")}
          />
        </div>
      </div>

      <AnimatePresence>
        {activeAction ? (
          <AiMockModal
            action={activeAction}
            className={className}
            onClose={() => setActiveAction(null)}
          />
        ) : null}
      </AnimatePresence>
    </section>
  );
}

function AiButton({
  icon: Icon,
  title,
  subtitle,
  onClick,
}: {
  icon: typeof Sparkles;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-center gap-3 rounded-[var(--radius-md)] border-[0.5px] border-[color-mix(in_srgb,var(--accent)_30%,transparent)] bg-[var(--bg-elevated)] px-3 py-2.5 text-left transition-all hover:border-[var(--accent)] hover:-translate-y-px"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[var(--accent-subtle)] text-[var(--accent)]">
        <Icon className="h-3.5 w-3.5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-[var(--text-primary)]">{title}</p>
        <p className="truncate text-[10px] text-[var(--text-muted)]">{subtitle}</p>
      </div>
      <ArrowRight
        className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--accent)]"
        aria-hidden
      />
    </button>
  );
}
