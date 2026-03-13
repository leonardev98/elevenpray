"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAuth } from "../../../../../../providers/auth-provider";
import { getWorkspaceProducts } from "../../../../../../lib/workspace-products-api";
import { getRoutineTemplatesByWorkspace } from "../../../../../../lib/workspaces-api";
import type { WorkspaceProductApi } from "../../../../../../lib/workspace-products-api";
import type { Routine } from "../../../../../../lib/routines-api";
import {
  getTodayDayContent,
  getProductIdsFromDayContent,
} from "../../../../../../lib/skincare-routine-progress";

export function WorkspaceProductsAside() {
  const params = useParams();
  const workspaceId = params?.id as string;
  const { token } = useAuth();
  const t = useTranslations("workspaceNav");
  const tCommon = useTranslations("common");
  const [allProducts, setAllProducts] = useState<WorkspaceProductApi[]>([]);
  const [todayProductIds, setTodayProductIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !workspaceId) return;
    Promise.all([
      getWorkspaceProducts(token, workspaceId),
      getRoutineTemplatesByWorkspace(token, workspaceId),
    ])
      .then(([products, templates]) => {
        setAllProducts(products);
        const list = templates as Routine[];
        const defaultTemplate = list.find((r) => r.year === 0 && r.weekNumber === 0) ?? null;
        const day = getTodayDayContent(defaultTemplate);
        const ids = getProductIdsFromDayContent(day);
        setTodayProductIds(ids);
      })
      .catch(() => {
        setAllProducts([]);
        setTodayProductIds([]);
      })
      .finally(() => setLoading(false));
  }, [token, workspaceId]);

  const productsInToday = todayProductIds.length
    ? allProducts.filter((p) => todayProductIds.includes(p.id))
    : [];
  const hasRoutineToday = todayProductIds.length > 0;

  return (
    <aside
      className="w-full flex-shrink-0 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-sm dark:border-zinc-700"
      aria-label={t("productsInTodayRoutine")}
    >
      <div className="sticky top-0 flex h-full flex-col overflow-hidden rounded-2xl">
        <div className="border-b border-[var(--app-border)] bg-[var(--app-bg)]/50 px-4 py-4 rounded-t-2xl dark:border-zinc-700 dark:bg-zinc-900/50">
          <h2 className="text-base font-medium text-[var(--app-fg)] dark:text-zinc-200">
            {t("productsInTodayRoutine")}
          </h2>
          <p className="mt-0.5 text-xs font-medium text-[var(--app-fg)]/70 dark:text-slate-400">
            {hasRoutineToday
              ? t("fromThisSpaceAddToRoutine")
              : t("noProductsScheduledToday")}
          </p>
          <Link
            href={`/dashboard/workspaces/${workspaceId}/products`}
            className="mt-3 inline-block text-xs font-medium text-[var(--app-navy)] hover:underline dark:text-sky-400"
          >
            {t("manageProducts")}
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {loading && (
            <p className="py-4 text-center text-xs font-medium text-[var(--app-fg)]/70 dark:text-slate-400">
              {tCommon("loading")}
            </p>
          )}
          {!loading && !hasRoutineToday && (
            <div className="rounded-xl border border-dashed border-[var(--app-border)] bg-[var(--app-bg)]/30 py-8 text-center dark:border-zinc-600 dark:bg-zinc-800/30">
              <p className="text-sm font-normal text-[var(--app-fg)]/80 dark:text-slate-300">
                {t("noProductsScheduledToday")}
              </p>
              <Link
                href={`/dashboard/workspaces/${workspaceId}/products`}
                className="mt-4 inline-block rounded-xl bg-[var(--app-navy)]/15 px-4 py-2.5 text-sm font-medium text-[var(--app-navy)] transition hover:bg-[var(--app-navy)]/25 dark:bg-sky-500/20 dark:text-sky-400 dark:hover:bg-sky-500/30"
              >
                {t("manageProducts")}
              </Link>
            </div>
          )}
          {!loading && hasRoutineToday && productsInToday.length === 0 && (
            <div className="rounded-xl border border-dashed border-[var(--app-border)] bg-[var(--app-bg)]/30 py-6 text-center dark:border-zinc-600 dark:bg-zinc-800/30">
              <p className="text-sm font-normal text-[var(--app-fg)]/80 dark:text-slate-300">
                {t("noProductsScheduledToday")}
              </p>
              <Link
                href={`/dashboard/workspaces/${workspaceId}/products`}
                className="mt-3 inline-block text-sm font-medium text-[var(--app-navy)] hover:underline dark:text-sky-400"
              >
                {t("manageProducts")}
              </Link>
            </div>
          )}
          {!loading && productsInToday.length > 0 && (
            <ul className="space-y-2">
              {productsInToday.map((p) => (
                <li key={p.id}>
                  <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)]/50 p-3 shadow-sm transition hover:border-[var(--app-navy)]/30 hover:shadow dark:border-zinc-700 dark:bg-zinc-800/50">
                    <div className="flex gap-3">
                      {p.imageUrl ? (
                        <img
                          src={p.imageUrl}
                          alt=""
                          className="h-12 w-12 rounded-lg object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--app-navy)]/10 text-[var(--app-navy)] text-lg font-semibold dark:bg-sky-500/20 dark:text-sky-400">
                          {p.name.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-[var(--app-fg)] dark:text-zinc-200">
                          {p.name}
                        </p>
                        {p.brand && (
                          <p className="truncate text-xs font-normal text-[var(--app-fg)]/70 dark:text-slate-400">
                            {p.brand}
                          </p>
                        )}
                        <Link
                          href={`/dashboard/workspaces/${workspaceId}/routine`}
                          className="mt-2 inline-block rounded-lg bg-[var(--app-navy)]/15 px-2.5 py-1.5 text-xs font-medium text-[var(--app-navy)] hover:bg-[var(--app-navy)]/25 transition dark:bg-sky-500/20 dark:text-sky-400 dark:hover:bg-sky-500/30"
                        >
                          {t("addToRoutine")}
                        </Link>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </aside>
  );
}
