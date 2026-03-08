"use client";

import { useTranslations, useLocale } from "next-intl";

interface RoutineGroup {
  title: string;
  time?: string;
  items: { content: string }[];
}

interface DayData {
  dateStr: string;
  dayLabel: string;
  routines: {
    topicTitle: string;
    groups?: RoutineGroup[];
    items?: { content: string }[];
  }[];
  entries: { topicTitle: string; content: string | null }[];
}

interface DayDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  day: DayData | null;
}

function formatDateLabel(dateStr: string, locale: string): string {
  const d = new Date(dateStr + "T12:00:00");
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  };
  const localeTag = locale === "es" ? "es-ES" : locale === "en" ? "en-US" : locale;
  return d.toLocaleDateString(localeTag, options);
}

export function DayDrawer({ isOpen, onClose, day }: DayDrawerProps) {
  const t = useTranslations("dashboard");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40"
        aria-hidden="true"
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="day-drawer-title"
        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-[var(--app-border)] bg-[var(--app-surface)] shadow-xl"
        style={{ paddingRight: "env(safe-area-inset-right)", paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="flex flex-shrink-0 items-center justify-between border-b border-[var(--app-border)] px-4 py-4">
          <h2
            id="day-drawer-title"
            className="text-base font-semibold tracking-tight text-[var(--app-fg)] capitalize sm:text-lg"
          >
            {day ? formatDateLabel(day.dateStr, locale) : t("myDay")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={tCommon("close")}
            className="rounded-lg p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-[var(--app-fg)]/70 hover:bg-[var(--app-bg)] hover:text-[var(--app-fg)]"
          >
            ×
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 pb-[env(safe-area-inset-bottom)]">
          {!day ? (
            <p className="text-sm text-[var(--app-fg)]/60">{t("selectDay")}</p>
          ) : (
            <div className="space-y-6">
              {day.routines.length > 0 && (
                <section>
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--app-gold)]">
                    {t("routines")}
                  </h3>
                  <ul className="space-y-4">
                    {day.routines.map((r) => (
                      <li
                        key={r.topicTitle}
                        className="rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] p-3"
                      >
                        <p className="text-sm font-medium text-[var(--app-fg)]">
                          {r.topicTitle}
                        </p>
                        {r.groups?.length ? (
                          <div className="mt-3 space-y-3">
                            {r.groups.map((g, gi) => (
                              <div key={gi}>
                                <p className="text-xs font-medium text-[var(--app-fg)]/80">
                                  {g.title || tCommon("noTitle")}
                                  {g.time ? ` · ${g.time}` : ""}
                                </p>
                                <ul className="mt-1 space-y-1 pl-0 text-sm text-[var(--app-fg)]/90">
                                  {g.items.map((it, i) => (
                                    <li key={i} className="flex gap-2">
                                      <span className="text-[var(--app-fg)]/50">–</span>
                                      <span>{it.content || tCommon("empty")}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <ul className="mt-2 space-y-1 pl-0 text-sm text-[var(--app-fg)]/90">
                            {(r.items ?? []).map((it, i) => (
                              <li key={i} className="flex gap-2">
                                <span className="text-[var(--app-fg)]/50">–</span>
                                <span>{it.content || tCommon("empty")}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              {day.entries.length > 0 && (
                <section>
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--app-gold)]">
                    {t("entries")}
                  </h3>
                  <ul className="space-y-3">
                    {day.entries.map((e, i) => (
                      <li
                        key={i}
                        className="rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] p-3"
                      >
                        <p className="text-xs font-medium text-[var(--app-fg)]/70">
                          {e.topicTitle}
                        </p>
                        <p className="mt-1 text-sm text-[var(--app-fg)]">
                          {e.content || tCommon("noText")}
                        </p>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              {day.routines.length === 0 && day.entries.length === 0 && (
                <p className="text-sm text-[var(--app-fg)]/50">
                  {t("nothingScheduled")}
                </p>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
