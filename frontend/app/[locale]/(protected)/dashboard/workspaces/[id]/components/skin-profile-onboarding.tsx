"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../../../../providers/auth-provider";
import { updateWorkspacePreference } from "../../../../../../lib/workspace-preferences-api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface SkinProfileAnswers {
  skinType: string;
  mainConcerns: string[];
  sensitivityLevel: string;
  ageRange?: string;
  experienceLevel?: string;
}

const SKIN_TYPES = [
  { value: "oily", label: "Grasa" },
  { value: "dry", label: "Seca" },
  { value: "combination", label: "Mixta" },
  { value: "sensitive", label: "Sensible" },
  { value: "acne_prone", label: "Propensa al acné" },
] as const;

const CONCERNS = [
  { value: "acne", label: "Acné" },
  { value: "wrinkles", label: "Arrugas" },
  { value: "dark_circles", label: "Ojeras" },
  { value: "hyperpigmentation", label: "Hiperpigmentación" },
  { value: "hydration", label: "Hidratación" },
  { value: "redness", label: "Rojeces" },
  { value: "large_pores", label: "Poros dilatados" },
  { value: "sun_damage", label: "Daño solar" },
] as const;

const SENSITIVITY_LEVELS = [
  { value: "low", label: "Baja" },
  { value: "medium", label: "Media" },
  { value: "high", label: "Alta" },
] as const;

const AGE_RANGES = [
  { value: "", label: "Prefiero no decir" },
  { value: "under_25", label: "Menos de 25" },
  { value: "25_35", label: "25–35" },
  { value: "35_45", label: "35–45" },
  { value: "45_plus", label: "45+" },
] as const;

interface SkinProfileOnboardingProps {
  workspaceId: string;
  onComplete: () => void;
  /** Edit mode: show form with initial data and "Guardar"; no blocking overlay on first load */
  mode?: "onboarding" | "edit";
  /** Prefill form (from existing preference) */
  initialData?: SkinProfileAnswers | null;
  /** In edit mode, called when user closes without saving */
  onClose?: () => void;
  /** En onboarding: llamado al pulsar "Ya completé esto antes" (no volver a mostrar modal) */
  onAlreadyDone?: () => void;
}

export function parseSkinProfileFromPreference(
  raw: Record<string, unknown> | null | undefined
): SkinProfileAnswers | null {
  if (!raw || typeof raw !== "object") return null;
  const skinType = raw.skinType;
  if (!skinType || typeof skinType !== "string") return null;
  return {
    skinType,
    mainConcerns: Array.isArray(raw.mainConcerns) ? (raw.mainConcerns as string[]) : [],
    sensitivityLevel: typeof raw.sensitivityLevel === "string" ? raw.sensitivityLevel : "",
    experienceLevel: typeof raw.experienceLevel === "string" ? raw.experienceLevel : "beginner",
    ageRange: typeof raw.ageRange === "string" ? raw.ageRange : "",
  };
}

export function SkinProfileOnboarding({
  workspaceId,
  onComplete,
  mode = "onboarding",
  initialData,
  onClose,
  onAlreadyDone,
}: SkinProfileOnboardingProps) {
  const { token } = useAuth();
  const [skinType, setSkinType] = useState<string>(initialData?.skinType ?? "");
  const [mainConcerns, setMainConcerns] = useState<string[]>(initialData?.mainConcerns ?? []);
  const [sensitivityLevel, setSensitivityLevel] = useState<string>(initialData?.sensitivityLevel ?? "");
  const [ageRange, setAgeRange] = useState<string>(initialData?.ageRange ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setSkinType(initialData.skinType);
      setMainConcerns(initialData.mainConcerns ?? []);
      setSensitivityLevel(initialData.sensitivityLevel ?? "");
      setAgeRange(initialData.ageRange ?? "");
    }
  }, [initialData]);

  function toggleConcern(value: string) {
    setMainConcerns((prev) =>
      prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    if (!skinType || !sensitivityLevel) {
      setError("Indica tu tipo de piel y nivel de sensibilidad.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const answers: SkinProfileAnswers = {
        skinType,
        mainConcerns,
        sensitivityLevel,
      };
      if (ageRange) answers.ageRange = ageRange;
      await updateWorkspacePreference(token, workspaceId, {
        completeOnboarding: true,
        onboardingAnswers: answers as unknown as Record<string, unknown>,
        skincareProfile: answers as unknown as Record<string, unknown>,
      });
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  const isEdit = mode === "edit";

  return (
    <>
      <div role="presentation" className="fixed inset-0 z-50 bg-black/50" aria-hidden />
      <div
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 max-h-[90vh] overflow-y-auto rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-xl"
        role="dialog"
        aria-labelledby="skin-profile-title"
        aria-describedby="skin-profile-desc"
      >
        <div className="flex items-start justify-between gap-2 mb-1">
          <h2 id="skin-profile-title" className="text-xl font-semibold tracking-normal text-[var(--app-fg)]">
            Tu perfil de piel
          </h2>
          {isEdit && onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-lg p-1.5 text-[var(--app-fg)]/60 hover:bg-[var(--app-bg)] hover:text-[var(--app-fg)]"
              aria-label="Cerrar"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ) : null}
        </div>
        <p id="skin-profile-desc" className="mb-6 text-sm text-[var(--app-fg)]/70">
          Así personalizamos recomendaciones, rutinas y contenido para ti.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-[var(--app-fg)]/70">
              Tipo de piel
            </label>
            <div className="flex flex-wrap gap-2">
              {SKIN_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setSkinType(t.value)}
                  className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                    skinType === t.value
                      ? "border-[var(--app-navy)] bg-[var(--app-navy)]/15 text-[var(--app-navy)]"
                      : "border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-fg)] hover:border-[var(--app-navy)]/40"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-[var(--app-fg)]/70">
              Principales preocupaciones (opcional)
            </label>
            <div className="flex flex-wrap gap-2">
              {CONCERNS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => toggleConcern(c.value)}
                  className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                    mainConcerns.includes(c.value)
                      ? "border-[var(--app-navy)] bg-[var(--app-navy)]/15 text-[var(--app-navy)]"
                      : "border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-fg)] hover:border-[var(--app-navy)]/40"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-[var(--app-fg)]/70">
              Sensibilidad
            </label>
            <div className="flex flex-wrap gap-2">
              {SENSITIVITY_LEVELS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setSensitivityLevel(s.value)}
                  className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                    sensitivityLevel === s.value
                      ? "border-[var(--app-navy)] bg-[var(--app-navy)]/15 text-[var(--app-navy)]"
                      : "border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-fg)] hover:border-[var(--app-navy)]/40"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-[var(--app-fg)]/70">
              Rango de edad (opcional)
            </label>
            <Select
              value={ageRange === "" ? "none" : ageRange}
              onValueChange={(v) => setAgeRange(v === "none" ? "" : v)}
            >
              <SelectTrigger size="default" className="w-full">
                <SelectValue placeholder="Prefiero no decir" />
              </SelectTrigger>
              <SelectContent>
                {AGE_RANGES.map((a) => (
                  <SelectItem key={a.value || "none"} value={a.value || "none"}>
                    {a.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && (
            <p className="rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-[var(--app-navy)] py-3 text-sm font-medium text-[var(--app-white)] shadow-sm transition hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Guardando…" : isEdit ? "Guardar" : "Empezar"}
          </button>
          {!isEdit && onAlreadyDone && (
            <p className="mt-3 text-center">
              <button
                type="button"
                onClick={onAlreadyDone}
                className="text-sm text-[var(--app-fg)]/60 underline hover:text-[var(--app-navy)]"
              >
                Ya completé esto antes
              </button>
            </p>
          )}
        </form>
      </div>
    </>
  );
}
