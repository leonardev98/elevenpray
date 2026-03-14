"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";
import {
  getLearningVideos,
  type LearningVideoApi,
} from "@/app/lib/learning-api";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { fadeInUp, hoverCard } from "@/lib/animations";

function PlayIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-14 w-14 text-white drop-shadow-lg"
      aria-hidden
    >
      <path d="M8 5v14l11-7L8 5z" />
    </svg>
  );
}

function VideoCard({
  video,
  watchVideoLabel,
}: {
  video: LearningVideoApi;
  watchVideoLabel: string;
}) {
  return (
    <motion.div
      className="group"
      initial={fadeInUp.initial}
      animate={fadeInUp.animate}
      transition={fadeInUp.transition}
      whileHover={{
        ...hoverCard,
        boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
      }}
    >
      <Card className="h-full overflow-hidden transition-shadow">
        <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-[var(--app-bg)]">
          {video.thumbnailUrl ? (
            <img
              src={video.thumbnailUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[var(--app-navy)]/10 text-[var(--app-navy)]/30">
              <PlayIcon />
            </div>
          )}
          <div
            className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity group-hover:bg-black/40"
            aria-hidden
          >
            <span className="opacity-90 drop-shadow-md group-hover:opacity-100">
              <PlayIcon />
            </span>
          </div>
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="line-clamp-2 text-base">{video.title}</CardTitle>
          {video.description && (
            <p className="line-clamp-2 text-sm text-[var(--app-fg)]/70">
              {video.description}
            </p>
          )}
          {video.sourceName && (
            <p className="text-xs text-[var(--app-fg)]/50">{video.sourceName}</p>
          )}
        </CardHeader>
        <CardFooter className="pt-0">
          <a
            href={video.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--app-navy)] hover:underline"
          >
            {watchVideoLabel}
            <span aria-hidden>→</span>
          </a>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

export default function WorkspaceVideosPage() {
  const locale = useLocale() as string;
  const t = useTranslations("workspaceNav");
  const tCommon = useTranslations("common");
  const [videos, setVideos] = useState<LearningVideoApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getLearningVideos({ language: locale === "en" ? "en" : "es" })
      .then(setVideos)
      .catch((e) => setError(e instanceof Error ? e.message : "Error"))
      .finally(() => setLoading(false));
  }, [locale]);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold tracking-normal text-[var(--app-fg)]">
          {t("videos")}
        </h1>
        <p className="text-[var(--app-fg)]/70">
          Guías en vídeo: rutina mañana y noche, retinol, acné y más.
        </p>
        <p className="py-8 text-center text-sm text-[var(--app-fg)]/60">
          {tCommon("loading")}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold tracking-normal text-[var(--app-fg)]">
          {t("videos")}
        </h1>
        <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal text-[var(--app-fg)]">
          {t("videos")}
        </h1>
        <p className="mt-1 text-[var(--app-fg)]/70">
          Guías en vídeo: rutina mañana y noche, retinol, acné y más.
        </p>
      </div>

      {videos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--app-border)] bg-[var(--app-surface)] p-12 text-center">
          <p className="text-sm text-[var(--app-fg)]/60">
            {t("learnEmptyVideos")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              watchVideoLabel={t("watchVideo")}
            />
          ))}
        </div>
      )}
    </div>
  );
}
