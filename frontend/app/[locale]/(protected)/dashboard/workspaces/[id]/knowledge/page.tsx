"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";
import {
  getLearningArticles,
  type LearningArticleApi,
} from "@/app/lib/learning-api";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { fadeInUp, hoverCard } from "@/lib/animations";

function ArticleCard({
  article,
  readArticleLabel,
}: {
  article: LearningArticleApi;
  readArticleLabel: string;
}) {
  return (
    <motion.div
      initial={fadeInUp.initial}
      animate={fadeInUp.animate}
      transition={fadeInUp.transition}
      whileHover={{
        ...hoverCard,
        boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
      }}
    >
      <Card className="h-full overflow-hidden transition-shadow">
        <div className="aspect-[16/10] w-full shrink-0 overflow-hidden bg-[var(--app-bg)]">
          {article.imageUrl ? (
            <img
              src={article.imageUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[var(--app-fg)]/20 text-4xl font-light">
              {article.title.charAt(0)}
            </div>
          )}
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="line-clamp-2 text-base">{article.title}</CardTitle>
          {article.description && (
            <p className="line-clamp-2 text-sm text-[var(--app-fg)]/70">
              {article.description}
            </p>
          )}
          {article.sourceName && (
            <p className="text-xs text-[var(--app-fg)]/50">{article.sourceName}</p>
          )}
          {article.tags?.length ? (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {article.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-[var(--app-navy)]/10 px-2 py-0.5 text-xs font-medium text-[var(--app-navy)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </CardHeader>
        <CardFooter className="pt-0">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--app-navy)] hover:underline"
          >
            {readArticleLabel}
            <span aria-hidden>→</span>
          </a>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

export default function WorkspaceKnowledgePage() {
  const locale = useLocale() as string;
  const t = useTranslations("workspaceNav");
  const tCommon = useTranslations("common");
  const [articles, setArticles] = useState<LearningArticleApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getLearningArticles({ language: locale === "en" ? "en" : "es" })
      .then(setArticles)
      .catch((e) => setError(e instanceof Error ? e.message : "Error"))
      .finally(() => setLoading(false));
  }, [locale]);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold tracking-normal text-[var(--app-fg)]">
          {t("articles")}
        </h1>
        <p className="text-[var(--app-fg)]/70">
          {t("hubLearnDesc")}
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
          {t("articles")}
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
          {t("articles")}
        </h1>
        <p className="mt-1 text-[var(--app-fg)]/70">
          {t("hubLearnDesc")}
        </p>
      </div>

      {articles.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--app-border)] bg-[var(--app-surface)] p-12 text-center">
          <p className="text-sm text-[var(--app-fg)]/60">
            {t("learnEmptyArticles")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              readArticleLabel={t("readArticle")}
            />
          ))}
        </div>
      )}
    </div>
  );
}
