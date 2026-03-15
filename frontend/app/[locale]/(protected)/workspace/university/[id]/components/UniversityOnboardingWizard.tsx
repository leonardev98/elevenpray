"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";

const configSchema = z.object({
  workspaceName: z.string().min(2, "Nombre requerido"),
  currentSemesterLabel: z.string().min(2, "Semestre requerido"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  gradeScale: z.enum(["0_20", "0_100", "A_F"]),
  creditGoal: z.coerce.number().min(0).optional(),
});

const preferenceSchema = z.object({
  autoGenerateSessions: z.boolean(),
  remindersEnabled: z.boolean(),
  conflictDetectionEnabled: z.boolean(),
  aiSummaryEnabled: z.boolean(),
});

type ConfigFormValues = z.infer<typeof configSchema>;
type PreferenceFormValues = z.infer<typeof preferenceSchema>;
type ConfigFormInput = z.input<typeof configSchema>;

export function UniversityOnboardingWizard({
  open,
  onClose,
  onComplete,
}: {
  open: boolean;
  onClose: () => void;
  onComplete: (config: ConfigFormValues & PreferenceFormValues) => Promise<void>;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting] = useState(false);

  const configForm = useForm<ConfigFormInput, unknown, ConfigFormValues>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      workspaceName: "University Workspace",
      currentSemesterLabel: "2026-I",
      gradeScale: "0_100",
    },
  });

  const preferenceForm = useForm<PreferenceFormValues>({
    resolver: zodResolver(preferenceSchema),
    defaultValues: {
      autoGenerateSessions: true,
      remindersEnabled: true,
      conflictDetectionEnabled: true,
      aiSummaryEnabled: true,
    },
  });

  const progress = useMemo(() => `${step}/3`, [step]);

  if (!open) return null;

  async function submit() {
    const configValid = await configForm.trigger();
    const prefValid = await preferenceForm.trigger();
    if (!configValid || !prefValid) return;
    setSubmitting(true);
    try {
      const parsedConfig = configSchema.parse(configForm.getValues());
      await onComplete({
        ...parsedConfig,
        ...preferenceForm.getValues(),
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="w-full max-w-2xl rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-xl"
          initial={{ y: 14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 14, opacity: 0 }}
        >
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--app-fg)]/50">Onboarding University</p>
              <h2 className="text-xl font-semibold text-[var(--app-fg)]">Configura tu Student OS</h2>
            </div>
            <span className="rounded-md bg-[var(--app-bg)] px-2 py-1 text-xs text-[var(--app-fg)]/60">{progress}</span>
          </div>

          {step === 1 && (
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm">
                <span className="mb-1 block text-[var(--app-fg)]/75">Nombre del workspace</span>
                <input className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2" {...configForm.register("workspaceName")} />
              </label>
              <label className="text-sm">
                <span className="mb-1 block text-[var(--app-fg)]/75">Semestre actual</span>
                <input className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2" {...configForm.register("currentSemesterLabel")} />
              </label>
              <label className="text-sm">
                <span className="mb-1 block text-[var(--app-fg)]/75">Inicio (opcional)</span>
                <input type="date" className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2" {...configForm.register("startDate")} />
              </label>
              <label className="text-sm">
                <span className="mb-1 block text-[var(--app-fg)]/75">Fin (opcional)</span>
                <input type="date" className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2" {...configForm.register("endDate")} />
              </label>
              <label className="text-sm">
                <span className="mb-1 block text-[var(--app-fg)]/75">Escala</span>
                <select className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2" {...configForm.register("gradeScale")}>
                  <option value="0_20">0-20</option>
                  <option value="0_100">0-100</option>
                  <option value="A_F">A-F</option>
                </select>
              </label>
              <label className="text-sm">
                <span className="mb-1 block text-[var(--app-fg)]/75">Meta de créditos</span>
                <input type="number" className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2" {...configForm.register("creditGoal")} />
              </label>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              {[
                ["autoGenerateSessions", "Autogenerar clases desde horarios"],
                ["remindersEnabled", "Activar recordatorios"],
                ["conflictDetectionEnabled", "Detectar conflictos de horario"],
                ["aiSummaryEnabled", "Activar resumen IA mock"],
              ].map(([key, label]) => (
                <label key={key} className="flex items-center justify-between rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2">
                  <span className="text-sm text-[var(--app-fg)]">{label}</span>
                  <input type="checkbox" {...preferenceForm.register(key as keyof PreferenceFormValues)} />
                </label>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] p-4">
              <p className="text-sm text-[var(--app-fg)]/75">Listo. El siguiente paso es crear tu primer curso con horarios para poblar clases, calendario y tareas automáticamente.</p>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between gap-3">
            <Button variant="outline" onClick={step === 1 ? onClose : () => setStep((prev) => (prev - 1) as 1 | 2 | 3)}>
              {step === 1 ? "Cerrar" : "Atrás"}
            </Button>
            {step < 3 ? (
              <Button onClick={() => setStep((prev) => (prev + 1) as 1 | 2 | 3)}>Continuar</Button>
            ) : (
              <Button onClick={submit} disabled={submitting}>
                {submitting ? "Guardando..." : "Guardar y crear primer curso"}
              </Button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
