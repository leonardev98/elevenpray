"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../../../providers/auth-provider";
import { getAllWorkspaceTypes } from "../../../lib/workspace-type-registry";
import type { WorkspaceTypeId } from "../../../lib/workspace-type-registry";
import { createWorkspace } from "../../../lib/workspaces-api";
import { toast } from "../../../lib/toast";
import { MitsyyPlaceholder } from "./components/mitsyy-placeholder";

export default function OnboardingPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedTypes, setSelectedTypes] = useState<Set<WorkspaceTypeId>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const { token } = useAuth();
  const router = useRouter();
  const t = useTranslations("onboarding");
  const tTypes = useTranslations("workspaceTypes");
  const tCommon = useTranslations("common");

  const types = getAllWorkspaceTypes();

  function toggleType(typeId: WorkspaceTypeId) {
    setSelectedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(typeId)) next.delete(typeId);
      else next.add(typeId);
      return next;
    });
  }

  async function handleFinish() {
    if (!token || selectedTypes.size === 0) return;
    setSubmitting(true);
    try {
      for (const typeId of selectedTypes) {
        await createWorkspace(token, "", typeId);
      }
      toast.success(t("successTitle"), t("successMessage"));
      router.push("/dashboard");
      router.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : t("errorCreate");
      toast.error(t("errorTitle"), msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="flex w-full max-w-md flex-col items-center text-center"
          >
            <div className="mb-6 flex justify-center">
              <MitsyyPlaceholder />
            </div>
            <h1 className="text-2xl font-semibold tracking-normal text-[var(--app-fg)]">
              {t("welcomeTitle")}
            </h1>
            <p className="mt-2 text-[var(--app-fg)]/70">
              {t("welcomeSubtitle")}
            </p>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="mt-8 w-full max-w-xs rounded-xl bg-[var(--app-navy)] py-3.5 font-medium text-[var(--app-white)] transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--app-navy)] focus:ring-offset-2 focus:ring-offset-[var(--app-bg)]"
            >
              {t("continue")}
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="flex w-full max-w-md flex-col"
          >
            <div className="mb-4 flex justify-center">
              <MitsyyPlaceholder className="h-20 w-20 opacity-90" />
            </div>
            <h2 className="text-center text-xl font-semibold tracking-normal text-[var(--app-fg)]">
              {t("chooseTitle")}
            </h2>
            <p className="mt-1 text-center text-sm text-[var(--app-fg)]/70">
              {t("chooseSubtitle")}
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {types.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => toggleType(type.id as WorkspaceTypeId)}
                  className={`rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-[var(--app-navy)] focus:ring-offset-2 focus:ring-offset-[var(--app-bg)] ${
                    selectedTypes.has(type.id as WorkspaceTypeId)
                      ? "border-[var(--app-navy)] bg-[var(--app-navy)]/15 text-[var(--app-fg)]"
                      : "border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-fg)]/80 hover:border-[var(--app-navy)]/50"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                        selectedTypes.has(type.id as WorkspaceTypeId)
                          ? "border-[var(--app-navy)] bg-[var(--app-navy)]"
                          : "border-[var(--app-fg)]/40"
                      }`}
                    >
                      {selectedTypes.has(type.id as WorkspaceTypeId) && (
                        <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2 6l3 3 5-6" />
                        </svg>
                      )}
                    </span>
                    {tTypes(type.id)}
                  </span>
                </button>
              ))}
            </div>
            {selectedTypes.size === 0 && (
              <p className="mt-2 text-center text-sm text-amber-600 dark:text-amber-400">
                {t("selectAtLeastOne")}
              </p>
            )}
            <div className="mt-8 flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-xl border border-[var(--app-border)] px-4 py-3 text-sm font-medium text-[var(--app-fg)] hover:bg-[var(--app-bg)]"
              >
                {t("back")}
              </button>
              <button
                type="button"
                onClick={handleFinish}
                disabled={selectedTypes.size === 0 || submitting}
                className="flex-1 rounded-xl bg-[var(--app-navy)] py-3 font-medium text-[var(--app-white)] transition hover:opacity-90 disabled:opacity-50"
              >
                {submitting ? tCommon("creating") : t("continue")}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
