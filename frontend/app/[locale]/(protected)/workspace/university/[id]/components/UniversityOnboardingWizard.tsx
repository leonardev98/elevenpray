"use client";

import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";

const preferenceSchema = z.object({
  autoGenerateSessions: z.boolean(),
  remindersEnabled: z.boolean(),
  conflictDetectionEnabled: z.boolean(),
  aiSummaryEnabled: z.boolean(),
});

type PreferenceFormValues = z.infer<typeof preferenceSchema>;

function buildConfigSchema(t: (key: string) => string) {
  return z.object({
    workspaceName: z.string().min(2, t("errorNameRequired")),
    currentSemesterLabel: z.string().min(2, t("errorSemesterRequired")),
    startDate: z.string().min(1, t("errorStartDateRequired")),
    endDate: z.string().min(1, t("errorEndDateRequired")),
    gradeScale: z.enum(["0_20", "0_100", "A_F"]),
    creditGoal: z.coerce.number().min(0).optional(),
  });
}

type ConfigFormValues = z.infer<ReturnType<typeof buildConfigSchema>>;
type ConfigFormInput = z.input<ReturnType<typeof buildConfigSchema>>;

export function UniversityOnboardingWizard({
  open,
  onClose,
  onComplete,
}: {
  open: boolean;
  onClose: () => void;
  onComplete: (config: ConfigFormValues & PreferenceFormValues) => Promise<void>;
}) {
  const t = useTranslations("university.onboarding");
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting] = useState(false);
  const gradeScaleSelectRef = useRef<HTMLSelectElement>(null);

  const configSchema = useMemo(() => buildConfigSchema(t), [t]);

  const configForm = useForm<ConfigFormInput, unknown, ConfigFormValues>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      workspaceName: "University Workspace",
      currentSemesterLabel: "2026-I",
      startDate: "2026-01-01",
      endDate: "2026-06-30",
      gradeScale: "0_100",
      creditGoal: 0,
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

  const { ref: gradeScaleRef, ...gradeScaleRegisterRest } = configForm.register("gradeScale");

  const progress = useMemo(() => `${step}/3`, [step]);

  if (!open) return null;

  async function submit() {
    const configValid = await configForm.trigger();
    const prefValid = await preferenceForm.trigger();
    if (!configValid || !prefValid) return;
    setSubmitting(true);
    try {
      const parsedConfig = configSchema.parse(configForm.getValues()) as ConfigFormValues;
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
        className="fixed inset-0 z-[200] overflow-y-auto bg-black/50 p-4 py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center">
          <motion.div
            className="w-full max-w-2xl shrink-0 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-app-modal max-h-[calc(100vh-4rem)] overflow-y-auto"
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 14, opacity: 0 }}
          >
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--app-fg)]/50">{t("title")}</p>
              <h2 className="text-xl font-semibold text-[var(--app-fg)]">{t("subtitle")}</h2>
            </div>
            <span className="rounded-md bg-[var(--app-bg)] px-2 py-1 text-xs text-[var(--app-fg)]/60">{progress}</span>
          </div>

          {step === 1 && (
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm">
                <span className="mb-1 block text-[var(--app-fg)]/75">{t("workspaceNameLabel")}</span>
                <input className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2 shadow-app-input" {...configForm.register("workspaceName")} />
              </label>
              <label className="text-sm">
                <span className="mb-1 block text-[var(--app-fg)]/75">{t("currentSemesterLabel")}</span>
                <input className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2 shadow-app-input" {...configForm.register("currentSemesterLabel")} />
              </label>
              <label className="text-sm">
                <span className="mb-1 block text-[var(--app-fg)]/75">{t("semesterStartLabel")}</span>
                <Controller
                  control={configForm.control}
                  name="startDate"
                  render={({ field }) => (
                    <DatePicker value={field.value} onChange={field.onChange} placeholder={t("selectDatePlaceholder")} />
                  )}
                />
                {configForm.formState.errors.startDate && (
                  <p className="mt-1 text-xs text-red-500">{configForm.formState.errors.startDate.message}</p>
                )}
              </label>
              <label className="text-sm">
                <span className="mb-1 block text-[var(--app-fg)]/75">{t("semesterEndLabel")}</span>
                <Controller
                  control={configForm.control}
                  name="endDate"
                  render={({ field }) => (
                    <DatePicker value={field.value} onChange={field.onChange} placeholder={t("selectDatePlaceholder")} />
                  )}
                />
                {configForm.formState.errors.endDate && (
                  <p className="mt-1 text-xs text-red-500">{configForm.formState.errors.endDate.message}</p>
                )}
              </label>
              <label className="text-sm">
                <span className="mb-1 block text-[var(--app-fg)]/75">{t("scaleLabel")}</span>
                <div className="flex h-10 w-full items-stretch overflow-hidden rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] shadow-app-input">
                  <select
                    className="min-w-0 flex-1 appearance-none border-0 bg-transparent pl-3 pr-2 py-2 outline-none [&::-ms-expand]:hidden"
                    ref={(el) => {
                      gradeScaleRef(el);
                      gradeScaleSelectRef.current = el;
                    }}
                    {...gradeScaleRegisterRest}
                  >
                    <option value="0_20">{t("optionScale020")}</option>
                    <option value="0_100">{t("optionScale0100")}</option>
                    <option value="A_F">{t("optionScaleAF")}</option>
                  </select>
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => gradeScaleSelectRef.current?.focus()}
                    onPointerDown={(e) => {
                      e.preventDefault();
                      gradeScaleSelectRef.current?.click();
                    }}
                    className="flex shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent pl-2 pr-2 text-[var(--app-fg)] shadow-none outline-none transition-colors hover:bg-[var(--app-highlight)]/50"
                    aria-label={t("scaleLabel")}
                  >
                    <ChevronDown className="size-4 shrink-0" strokeWidth={2} />
                  </button>
                </div>
              </label>
              <label className="text-sm">
                <span className="mb-1 block text-[var(--app-fg)]/75">{t("creditGoalLabel")}</span>
                <div className="number-input-custom-spinner flex h-10 w-full items-stretch overflow-hidden rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] shadow-app-input">
                  <input
                    type="number"
                    min={0}
                    className="min-w-0 flex-1 border-0 bg-transparent px-4 py-2 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    {...configForm.register("creditGoal")}
                  />
                  <div className="flex min-h-0 shrink-0 flex-col pl-2 pr-2">
                    <button
                      type="button"
                      tabIndex={-1}
                      className="flex min-h-0 flex-1 items-center justify-center py-0.5 text-[var(--app-fg)] transition-colors hover:bg-[var(--app-highlight)]"
                      aria-label={t("ariaIncrease")}
                      onClick={() => {
                        const v = configForm.getValues("creditGoal");
                        const n = typeof v === "number" && !Number.isNaN(v) ? v : 0;
                        configForm.setValue("creditGoal", n + 1);
                      }}
                    >
                      <ChevronUp className="size-4 shrink-0" strokeWidth={2} />
                    </button>
                    <button
                      type="button"
                      tabIndex={-1}
                      className="flex min-h-0 flex-1 items-center justify-center py-0.5 text-[var(--app-fg)] transition-colors hover:bg-[var(--app-highlight)]"
                      aria-label={t("ariaDecrease")}
                      onClick={() => {
                        const v = configForm.getValues("creditGoal");
                        const n = typeof v === "number" && !Number.isNaN(v) ? v : 0;
                        configForm.setValue("creditGoal", Math.max(0, n - 1));
                      }}
                    >
                      <ChevronDown className="size-4 shrink-0" strokeWidth={2} />
                    </button>
                  </div>
                </div>
              </label>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              {[
                ["autoGenerateSessions", "prefAutoGenerateSessions"],
                ["remindersEnabled", "prefReminders"],
                ["conflictDetectionEnabled", "prefConflictDetection"],
                ["aiSummaryEnabled", "prefAiSummary"],
              ].map(([key, labelKey]) => (
                <label key={key} className="flex items-center justify-between rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2">
                  <span className="text-sm text-[var(--app-fg)]">{t(labelKey)}</span>
                  <input type="checkbox" {...preferenceForm.register(key as keyof PreferenceFormValues)} />
                </label>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] p-4">
              <p className="text-sm text-[var(--app-fg)]/75">{t("step3Ready")}</p>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between gap-3">
            <Button variant="outline" onClick={step === 1 ? onClose : () => setStep((prev) => (prev - 1) as 1 | 2 | 3)}>
              {step === 1 ? t("close") : t("back")}
            </Button>
            {step < 3 ? (
              <Button className="shadow-app-button" onClick={() => setStep((prev) => (prev + 1) as 1 | 2 | 3)}>{t("continue")}</Button>
            ) : (
              <Button className="shadow-app-button" onClick={submit} disabled={submitting}>
                {submitting ? t("saving") : t("saveAndCreateCourse")}
              </Button>
            )}
          </div>
        </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
