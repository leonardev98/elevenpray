"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAuth } from "../../../../providers/auth-provider";
import {
  createLearningArticle,
  createLearningVideo,
  type CreateArticleBody,
  type CreateVideoBody,
} from "@/app/lib/learning-api";
import { toast } from "@/app/lib/toast";

function parseTags(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function AdminLearningPage() {
  const { token } = useAuth();
  const t = useTranslations("admin");
  const [articleForm, setArticleForm] = useState({
    title: "",
    description: "",
    url: "",
    image_url: "",
    source_name: "",
    tags: "",
  });
  const [videoForm, setVideoForm] = useState({
    title: "",
    description: "",
    video_url: "",
    thumbnail_url: "",
    source_name: "",
    tags: "",
  });
  const [articleSaving, setArticleSaving] = useState(false);
  const [videoSaving, setVideoSaving] = useState(false);
  const [articleError, setArticleError] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);

  async function handleSubmitArticle(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    const title = articleForm.title.trim();
    const url = articleForm.url.trim();
    if (!title || !url) {
      setArticleError(t("articleRequired"));
      return;
    }
    setArticleError(null);
    setArticleSaving(true);
    try {
      const body: CreateArticleBody = {
        title,
        url,
        description: articleForm.description.trim() || undefined,
        image_url: articleForm.image_url.trim() || undefined,
        source_name: articleForm.source_name.trim() || undefined,
        tags: parseTags(articleForm.tags).length ? parseTags(articleForm.tags) : undefined,
      };
      await createLearningArticle(token, body);
      toast.success("Artículo creado", "El artículo se ha añadido correctamente.");
      setArticleForm({ title: "", description: "", url: "", image_url: "", source_name: "", tags: "" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al crear el artículo.";
      setArticleError(message);
      toast.error("Error", message);
    } finally {
      setArticleSaving(false);
    }
  }

  async function handleSubmitVideo(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    const title = videoForm.title.trim();
    const video_url = videoForm.video_url.trim();
    if (!title || !video_url) {
      setVideoError(t("videoRequired"));
      return;
    }
    setVideoError(null);
    setVideoSaving(true);
    try {
      const body: CreateVideoBody = {
        title,
        video_url,
        description: videoForm.description.trim() || undefined,
        thumbnail_url: videoForm.thumbnail_url.trim() || undefined,
        source_name: videoForm.source_name.trim() || undefined,
        tags: parseTags(videoForm.tags).length ? parseTags(videoForm.tags) : undefined,
      };
      await createLearningVideo(token, body);
      toast.success("Vídeo creado", "El vídeo se ha añadido correctamente.");
      setVideoForm({ title: "", description: "", video_url: "", thumbnail_url: "", source_name: "", tags: "" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al crear el vídeo.";
      setVideoError(message);
      toast.error("Error", message);
    } finally {
      setVideoSaving(false);
    }
  }

  return (
    <>
      <div className="mb-10 flex items-center gap-4">
        <Link
          href="/admin"
          className="rounded-xl p-2.5 text-[var(--app-fg)]/70 transition hover:bg-[var(--app-surface)] hover:text-[var(--app-fg)]"
          aria-label="Volver"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-normal text-[var(--app-fg)]">
            {t("learningTitle")}
          </h1>
          <p className="mt-1 text-[var(--app-fg)]/60">
            {t("learningDescription")}
          </p>
        </div>
      </div>

      <div className="space-y-10">
        <section className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-sm">
          <h2 className="text-xl font-bold text-[var(--app-fg)]">{t("addArticle")}</h2>
          <p className="mt-0.5 text-sm text-[var(--app-fg)]/60">
            {t("addArticleDescription")}
          </p>
          <form onSubmit={handleSubmitArticle} className="mt-6 space-y-4">
            {articleError && (
              <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">
                {articleError}
              </p>
            )}
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--app-fg)]">{t("title")} *</label>
              <input
                type="text"
                value={articleForm.title}
                onChange={(e) => setArticleForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-2.5 text-sm text-[var(--app-fg)] focus:border-[var(--app-navy)] focus:outline-none focus:ring-2 focus:ring-[var(--app-navy)]/20"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--app-fg)]">{t("description")}</label>
              <textarea
                value={articleForm.description}
                onChange={(e) => setArticleForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-2.5 text-sm text-[var(--app-fg)] focus:border-[var(--app-navy)] focus:outline-none focus:ring-2 focus:ring-[var(--app-navy)]/20"
                rows={2}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--app-fg)]">{t("url")} *</label>
              <input
                type="url"
                value={articleForm.url}
                onChange={(e) => setArticleForm((f) => ({ ...f, url: e.target.value }))}
                className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-2.5 text-sm text-[var(--app-fg)] focus:border-[var(--app-navy)] focus:outline-none focus:ring-2 focus:ring-[var(--app-navy)]/20"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--app-fg)]">{t("imageUrl")}</label>
              <input
                type="url"
                value={articleForm.image_url}
                onChange={(e) => setArticleForm((f) => ({ ...f, image_url: e.target.value }))}
                className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-2.5 text-sm text-[var(--app-fg)] focus:border-[var(--app-navy)] focus:outline-none focus:ring-2 focus:ring-[var(--app-navy)]/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--app-fg)]">{t("sourceName")}</label>
              <input
                type="text"
                value={articleForm.source_name}
                onChange={(e) => setArticleForm((f) => ({ ...f, source_name: e.target.value }))}
                className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-2.5 text-sm text-[var(--app-fg)] focus:border-[var(--app-navy)] focus:outline-none focus:ring-2 focus:ring-[var(--app-navy)]/20"
                placeholder="Ej: Blog X"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--app-fg)]">{t("tags")}</label>
              <input
                type="text"
                value={articleForm.tags}
                onChange={(e) => setArticleForm((f) => ({ ...f, tags: e.target.value }))}
                className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-2.5 text-sm text-[var(--app-fg)] focus:border-[var(--app-navy)] focus:outline-none focus:ring-2 focus:ring-[var(--app-navy)]/20"
                placeholder="retinol, rutina, acné"
              />
            </div>
            <button
              type="submit"
              disabled={articleSaving}
              className="rounded-xl bg-[var(--app-navy)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {articleSaving ? t("saving") : t("addArticle")}
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-sm">
          <h2 className="text-xl font-bold text-[var(--app-fg)]">{t("addVideo")}</h2>
          <p className="mt-0.5 text-sm text-[var(--app-fg)]/60">
            {t("addVideoDescription")}
          </p>
          <form onSubmit={handleSubmitVideo} className="mt-6 space-y-4">
            {videoError && (
              <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">
                {videoError}
              </p>
            )}
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--app-fg)]">{t("title")} *</label>
              <input
                type="text"
                value={videoForm.title}
                onChange={(e) => setVideoForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-2.5 text-sm text-[var(--app-fg)] focus:border-[var(--app-navy)] focus:outline-none focus:ring-2 focus:ring-[var(--app-navy)]/20"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--app-fg)]">{t("description")}</label>
              <textarea
                value={videoForm.description}
                onChange={(e) => setVideoForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-2.5 text-sm text-[var(--app-fg)] focus:border-[var(--app-navy)] focus:outline-none focus:ring-2 focus:ring-[var(--app-navy)]/20"
                rows={2}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--app-fg)]">{t("videoUrl")} *</label>
              <input
                type="url"
                value={videoForm.video_url}
                onChange={(e) => setVideoForm((f) => ({ ...f, video_url: e.target.value }))}
                className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-2.5 text-sm text-[var(--app-fg)] focus:border-[var(--app-navy)] focus:outline-none focus:ring-2 focus:ring-[var(--app-navy)]/20"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--app-fg)]">{t("thumbnailUrl")}</label>
              <input
                type="url"
                value={videoForm.thumbnail_url}
                onChange={(e) => setVideoForm((f) => ({ ...f, thumbnail_url: e.target.value }))}
                className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-2.5 text-sm text-[var(--app-fg)] focus:border-[var(--app-navy)] focus:outline-none focus:ring-2 focus:ring-[var(--app-navy)]/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--app-fg)]">{t("sourceName")}</label>
              <input
                type="text"
                value={videoForm.source_name}
                onChange={(e) => setVideoForm((f) => ({ ...f, source_name: e.target.value }))}
                className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-2.5 text-sm text-[var(--app-fg)] focus:border-[var(--app-navy)] focus:outline-none focus:ring-2 focus:ring-[var(--app-navy)]/20"
                placeholder="Ej: YouTube, Canal X"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--app-fg)]">{t("tags")}</label>
              <input
                type="text"
                value={videoForm.tags}
                onChange={(e) => setVideoForm((f) => ({ ...f, tags: e.target.value }))}
                className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-2.5 text-sm text-[var(--app-fg)] focus:border-[var(--app-navy)] focus:outline-none focus:ring-2 focus:ring-[var(--app-navy)]/20"
                placeholder="rutina, mañana, noche"
              />
            </div>
            <button
              type="submit"
              disabled={videoSaving}
              className="rounded-xl bg-[var(--app-navy)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {videoSaving ? t("saving") : t("addVideo")}
            </button>
          </form>
        </section>
      </div>
    </>
  );
}
