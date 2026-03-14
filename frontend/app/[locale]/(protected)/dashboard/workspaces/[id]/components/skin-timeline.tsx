"use client";

import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { getSkinScoreFromCheckin } from "./skin-health-score";
import type { WorkspaceCheckinApi } from "../../../../../../lib/workspace-checkins-api";
import type { WorkspacePhotoApi } from "../../../../../../lib/workspace-photos-api";

function useSymptomLabels() {
  const t = useTranslations("skinCheckin");
  return (key: string) => {
    try {
      return t(`symptom_${key}`);
    } catch {
      return key;
    }
  };
}

function formatTimelineDate(dateStr: string): string {
  return new Date(dateStr + "Z").toLocaleDateString("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

interface SkinTimelineProps {
  checkins: WorkspaceCheckinApi[];
  photos?: WorkspacePhotoApi[];
}

export function SkinTimeline({ checkins, photos = [] }: SkinTimelineProps) {
  const tTimeline = useTranslations("skinTimeline");
  const symptomLabel = useSymptomLabels();

  const sorted = [...checkins].sort(
    (a, b) =>
      new Date(b.checkinDate).getTime() - new Date(a.checkinDate).getTime()
  );

  const photoByDate = (date: string) =>
    photos.find((p) => p.photoDate === date);

  return (
    <section className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5">
      <h2 className="mb-4 text-lg font-semibold text-[var(--app-fg)]">
        {tTimeline("title")}
      </h2>
      {sorted.length === 0 ? (
        <p className="py-8 text-center text-sm text-[var(--app-fg)]/60">
          {tTimeline("empty")}
        </p>
      ) : (
        <ul className="relative space-y-0">
          {/* Línea vertical */}
          <div
            className="absolute left-[11px] top-2 bottom-2 w-px bg-[var(--app-border)]"
            aria-hidden
          />
          <AnimatePresence initial={false}>
            {sorted.map((checkin, index) => {
              const photo = photoByDate(checkin.checkinDate);
              const score = getSkinScoreFromCheckin(checkin.data);
              const symptoms = (checkin.data?.symptoms as string[] | undefined) ?? [];
              return (
                <motion.li
                  key={checkin.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="relative flex gap-4 pb-6 last:pb-0"
                >
                  {/* Punto */}
                  <div
                    className="relative z-10 mt-1.5 h-5 w-5 flex-shrink-0 rounded-full border-2 border-[var(--app-navy)] bg-[var(--app-surface)]"
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)]/50 p-4">
                    <p className="text-sm font-medium text-[var(--app-fg)]">
                      {formatTimelineDate(checkin.checkinDate)}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {score != null && (
                        <span className="rounded-full bg-[var(--app-navy)]/15 px-2 py-0.5 text-xs font-medium text-[var(--app-navy)]">
                          Score {score}%
                        </span>
                      )}
                      {symptoms.length > 0 && (
                        <span className="text-xs text-[var(--app-fg)]/70">
                          {symptoms.map(symptomLabel).join(", ")}
                        </span>
                      )}
                    </div>
                    {checkin.data?.freeNotes && (
                      <p className="mt-2 text-sm text-[var(--app-fg)]/80 line-clamp-2">
                        {checkin.data.freeNotes}
                      </p>
                    )}
                    {photo && (
                      <div className="mt-2">
                        <img
                          src={photo.imageUrl}
                          alt=""
                          className="h-20 w-20 rounded-lg object-cover"
                        />
                      </div>
                    )}
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}
    </section>
  );
}
