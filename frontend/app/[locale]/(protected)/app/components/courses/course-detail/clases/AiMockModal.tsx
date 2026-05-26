"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Copy,
  HelpCircle,
  Layers,
  ListTodo,
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type AiAction = "summary" | "flashcards" | "quiz";

interface AiMockModalProps {
  action: AiAction;
  className: string;
  onClose: () => void;
}

const ACTION_META: Record<AiAction, { title: string; subtitle: string; icon: typeof Sparkles }> = {
  summary: {
    title: "Resumen generado",
    subtitle: "Síntesis automática de los puntos clave",
    icon: Sparkles,
  },
  flashcards: {
    title: "Flashcards generadas",
    subtitle: "Tarjetas pregunta/respuesta para repaso",
    icon: Layers,
  },
  quiz: {
    title: "Quiz generado",
    subtitle: "Preguntas de opción múltiple a partir de esta clase",
    icon: HelpCircle,
  },
};

const MOCK_SUMMARY = [
  "Se introdujeron los conceptos fundamentales del tema y se establecieron las definiciones clave que servirán de base para el resto de la unidad.",
  "Se trabajaron 3 ejemplos resueltos paso a paso, destacando las técnicas de aproximación y el uso correcto de notación formal.",
  "Se identificaron los errores más frecuentes al aplicar la propiedad principal estudiada y cómo evitarlos en problemas con condiciones especiales.",
  "Se sugirió como práctica resolver el set de problemas 3.2 del libro y revisar el video complementario antes del próximo encuentro.",
];

const MOCK_FLASHCARDS = [
  { q: "¿Cuál es la definición intuitiva del concepto visto?", a: "El valor al que una expresión se aproxima a medida que la variable independiente tiende a un punto." },
  { q: "Menciona la propiedad principal estudiada", a: "Si f(x) tiende a L cuando x → a, entonces el comportamiento se conserva bajo operaciones algebraicas (suma, producto, cociente con denominador no nulo)." },
  { q: "¿Cuándo no aplica la regla directa?", a: "Cuando el denominador tiende a cero o el numerador y denominador tienden ambos a cero (forma indeterminada 0/0)." },
  { q: "Da un ejemplo de aplicación", a: "Calcular el valor de la pendiente de la recta tangente a la curva en un punto." },
];

const MOCK_QUIZ = [
  {
    q: "¿Cuál de las siguientes describe mejor el concepto principal de la clase?",
    options: [
      "Es el valor exacto que toma la función en un punto",
      "Es el valor al que se aproxima la función cuando x tiende a un valor",
      "Es la derivada de la función en cualquier punto",
      "Es siempre igual al valor de f(a)",
    ],
    correct: 1,
  },
  {
    q: "¿Cuándo no podemos aplicar las propiedades algebraicas directamente?",
    options: [
      "Cuando el numerador es cero",
      "Cuando aparece una forma indeterminada (0/0, ∞/∞)",
      "Siempre podemos aplicarlas",
      "Cuando la función es continua",
    ],
    correct: 1,
  },
  {
    q: "Un buen primer paso para resolver una forma indeterminada 0/0 es:",
    options: [
      "Asignarle el valor 1",
      "Factorizar y simplificar la expresión",
      "Aplicar la propiedad distributiva",
      "Suponer que la respuesta es cero",
    ],
    correct: 1,
  },
];

export function AiMockModal({ action, className, onClose }: AiMockModalProps) {
  const meta = ACTION_META[action];
  const Icon = meta.icon;
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 1100);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <>
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        aria-label="Cerrar"
        className="fixed inset-0 z-[280] bg-black/60"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        role="dialog"
        aria-modal="true"
        aria-label={meta.title}
        className="fixed left-1/2 top-1/2 z-[290] flex max-h-[85vh] w-[min(640px,92vw)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[var(--radius-lg)] border-[0.5px] border-[var(--border)] bg-[var(--bg-elevated)] shadow-[var(--shadow-md)]"
      >
        <div className="flex items-start justify-between gap-3 border-b-[0.5px] border-[var(--border)] px-5 py-4">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[var(--accent-subtle)] text-[var(--accent)]">
              <Icon className="h-4 w-4" aria-hidden />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">{meta.title}</h3>
                <span className="rounded-full border-[0.5px] border-[color-mix(in_srgb,var(--accent)_40%,transparent)] bg-[var(--accent-subtle)] px-2 py-0.5 text-[10px] font-medium text-[var(--accent)]">
                  Mock
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)]">
                {meta.subtitle} · {className}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--bg-input)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-[200px] flex-1 overflow-y-auto px-5 py-5">
          {loading ? (
            <LoadingState />
          ) : action === "summary" ? (
            <SummaryView />
          ) : action === "flashcards" ? (
            <FlashcardsView />
          ) : (
            <QuizView />
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t-[0.5px] border-[var(--border)] px-5 py-3">
          <p className="text-[11px] text-[var(--text-muted)]">
            Vista previa de cómo se verá la IA. La generación real está en camino.
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              className="inline-flex items-center gap-1.5 rounded-md border-[0.5px] border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs text-[var(--text-primary)] disabled:opacity-50 hover:bg-[var(--bg-elevated)]"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="h-3 w-3 text-[var(--accent)]" aria-hidden />
                  Copiado
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" aria-hidden />
                  Copiar
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-[var(--accent-fg)] hover:bg-[var(--accent-hover)]"
            >
              Listo
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-6">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--accent)]" />
        <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--accent)] [animation-delay:120ms]" />
        <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--accent)] [animation-delay:240ms]" />
      </div>
      <p className="text-xs text-[var(--text-muted)]">Generando con IA…</p>
      <div className="grid w-full max-w-md gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-3 animate-pulse rounded bg-[var(--bg-input)]"
            style={{ width: `${90 - i * 12}%` }}
          />
        ))}
      </div>
    </div>
  );
}

function SummaryView() {
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
        Puntos clave
      </h4>
      <ul className="space-y-3">
        {MOCK_SUMMARY.map((line, i) => (
          <li
            key={i}
            className="flex items-start gap-2.5 rounded-[var(--radius-md)] border-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] p-3"
          >
            <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent-subtle)] text-[10px] font-semibold text-[var(--accent)]">
              {i + 1}
            </span>
            <p className="text-sm leading-relaxed text-[var(--text-body)]">{line}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FlashcardsView() {
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {MOCK_FLASHCARDS.map((card, i) => {
        const isFlipped = flipped[i] ?? false;
        return (
          <button
            type="button"
            key={i}
            onClick={() => setFlipped((s) => ({ ...s, [i]: !isFlipped }))}
            className={cn(
              "group min-h-[140px] rounded-[var(--radius-md)] border-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] p-4 text-left transition-colors",
              "hover:border-[var(--border-strong)] hover:bg-[var(--bg-elevated)]",
            )}
          >
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-input)] px-2 py-0.5 text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
              {isFlipped ? "Respuesta" : "Pregunta"}
            </span>
            <p className="mt-3 text-sm text-[var(--text-primary)]">
              {isFlipped ? card.a : card.q}
            </p>
            <p className="mt-3 text-[10px] text-[var(--text-muted)]">Toca para ver el reverso</p>
          </button>
        );
      })}
    </div>
  );
}

function QuizView() {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  return (
    <div className="space-y-4">
      {MOCK_QUIZ.map((q, idx) => {
        const picked = answers[idx];
        const isAnswered = picked !== undefined;
        return (
          <div
            key={idx}
            className="rounded-[var(--radius-md)] border-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] p-4"
          >
            <p className="text-sm font-medium text-[var(--text-primary)]">
              <span className="mr-2 text-[var(--text-muted)] tabular-nums">{idx + 1}.</span>
              {q.q}
            </p>
            <ul className="mt-3 grid gap-1.5">
              {q.options.map((opt, oi) => {
                const isPicked = picked === oi;
                const isCorrect = isAnswered && oi === q.correct;
                const isWrong = isAnswered && isPicked && oi !== q.correct;
                return (
                  <li key={oi}>
                    <button
                      type="button"
                      onClick={() => setAnswers((a) => ({ ...a, [idx]: oi }))}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md border-[0.5px] px-3 py-1.5 text-left text-xs",
                        "border-[var(--border)] bg-[var(--bg-elevated)] hover:bg-[var(--bg-input)]",
                        isCorrect && "border-[color-mix(in_srgb,var(--success)_40%,transparent)] bg-[color-mix(in_srgb,var(--success)_10%,transparent)] text-[var(--success)]",
                        isWrong && "border-[color-mix(in_srgb,var(--error)_40%,transparent)] bg-[color-mix(in_srgb,var(--error)_10%,transparent)] text-[var(--error)]",
                      )}
                    >
                      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border-[0.5px] border-[var(--border-strong)] text-[10px] text-[var(--text-muted)]">
                        {String.fromCharCode(65 + oi)}
                      </span>
                      <span className="flex-1">{opt}</span>
                      {isCorrect ? <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
      <p className="inline-flex items-center gap-1 text-[11px] text-[var(--text-muted)]">
        <ListTodo className="h-3 w-3" aria-hidden />
        Responde para ver retroalimentación instantánea.
      </p>
    </div>
  );
}
