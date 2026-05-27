"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ArrowRight, BookOpen, Check, Clock, Coins, Minus, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  appendPersistedStudentCourse,
  buildStudentCourseFromInput,
  buildStudentCourseUpdateFromInput,
  clampCourseCredits,
  updatePersistedStudentCourse,
  type CourseModality,
  type CourseScheduleSlot,
  type StudentCourseStored,
} from "../../lib/student-courses-storage";

const COLOR_OPTIONS = ["#3D5A2F", "#4A5A6B", "#6B5A3D", "#8A6E3D", "#6B3D3D", "#8A5A3D", "#7A8A9F"] as const;

const DAY_MSG_KEYS = ["dayL", "dayM", "dayX", "dayJ", "dayV", "dayS", "dayD"] as const;

const SCHEDULE_QUARTERS: { value: string; group: "morning" | "afternoon" | "evening" }[] = (() => {
  const r: { value: string; group: "morning" | "afternoon" | "evening" }[] = [];
  for (let h = 6; h <= 23; h++) {
    for (const m of [0, 15, 30, 45] as const) {
      const value = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      const group: "morning" | "afternoon" | "evening" = h < 12 ? "morning" : h < 18 ? "afternoon" : "evening";
      r.push({ value, group });
    }
  }
  return r;
})();

function timeToMinutes(t: string): number {
  const m = /^(\d{2}):(\d{2})$/.exec(t.trim());
  if (!m) return -1;
  return Number(m[1]) * 60 + Number(m[2]);
}

function isValidTimeOrder(start: string, end: string): boolean {
  if (!start || !end) return true;
  const a = timeToMinutes(start);
  const b = timeToMinutes(end);
  if (a < 0 || b < 0) return true;
  return b > a;
}

function schedulePeriodKey(start: string): "schedulePeriodMorning" | "schedulePeriodAfternoon" | "schedulePeriodEvening" | null {
  const mins = timeToMinutes(start);
  if (mins < 0) return null;
  const h = Math.floor(mins / 60);
  if (h < 12) return "schedulePeriodMorning";
  if (h < 18) return "schedulePeriodAfternoon";
  return "schedulePeriodEvening";
}

type QuarterSelectLabels = { morning: string; afternoon: string; evening: string };

function ScheduleQuarterSelect({
  id,
  value,
  onChange,
  labels,
  "aria-label": ariaLabel,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  labels: QuarterSelectLabels;
  "aria-label"?: string;
}) {
  const cls =
    "w-full min-w-0 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] py-2.5 pl-3 pr-8 text-sm text-[var(--app-fg)] outline-none transition-[border-color,box-shadow] duration-150 focus:border-[var(--accent-hex)] focus:shadow-[0_0_0_3px_var(--accent-ring)]";
  return (
    <select id={id} value={value} aria-label={ariaLabel} onChange={(e) => onChange(e.target.value)} className={cls}>
      <option value="">—</option>
      <optgroup label={labels.morning}>
        {SCHEDULE_QUARTERS.filter((x) => x.group === "morning").map((x) => (
          <option key={x.value} value={x.value}>
            {x.value}
          </option>
        ))}
      </optgroup>
      <optgroup label={labels.afternoon}>
        {SCHEDULE_QUARTERS.filter((x) => x.group === "afternoon").map((x) => (
          <option key={x.value} value={x.value}>
            {x.value}
          </option>
        ))}
      </optgroup>
      <optgroup label={labels.evening}>
        {SCHEDULE_QUARTERS.filter((x) => x.group === "evening").map((x) => (
          <option key={x.value} value={x.value}>
            {x.value}
          </option>
        ))}
      </optgroup>
    </select>
  );
}

type CourseModalMode = "create" | "edit";

interface AddCourseModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  /** "create" (default) o "edit". En edit es obligatorio pasar `initialCourse`. */
  mode?: CourseModalMode;
  initialCourse?: StudentCourseStored | null;
}

function isValidModality(x: unknown): x is CourseModality {
  return x === "Presencial" || x === "Remoto" || x === "Semipresencial";
}

export function AddCourseModal({
  open,
  onClose,
  onSuccess,
  mode = "create",
  initialCourse = null,
}: AddCourseModalProps) {
  const t = useTranslations("studentCourses");
  const tCommon = useTranslations("common");
  const isEdit = mode === "edit" && initialCourse != null;

  const [nombreCurso, setNombreCurso] = useState("");
  const [creditos, setCreditos] = useState("3");
  const [colorSeleccionado, setColorSeleccionado] = useState<string>(COLOR_OPTIONS[0]);
  const [diasSeleccionados, setDiasSeleccionados] = useState<string[]>([]);
  const [semanas, setSemanas] = useState(16);
  const [scheduleMode, setScheduleMode] = useState<"same" | "perDay">("same");
  const [sameStart, setSameStart] = useState("");
  const [sameEnd, setSameEnd] = useState("");
  const [perDayMap, setPerDayMap] = useState<Record<string, { start: string; end: string }>>({});

  const dayLetters = useMemo(() => DAY_MSG_KEYS.map((k) => t(k)), [t]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    queueMicrotask(() => {
      if (isEdit && initialCourse) {
        const initialClassDays = (initialCourse.classDays ?? []).filter((d) => d && d !== "—");
        const initialSlots = (initialCourse.scheduleSlots ?? []).filter(
          (s) => s.start?.trim() && s.end?.trim(),
        );
        const initialWeeks = Math.min(
          20,
          Math.max(8, Math.round(Number(initialCourse.weeksTotal) || 16)),
        );
        const initialColor =
          (initialCourse.colorHex ?? "").trim() !== ""
            ? initialCourse.colorHex!
            : COLOR_OPTIONS[0];

        setNombreCurso(initialCourse.name ?? "");
        setCreditos(
          initialCourse.credits != null && Number.isFinite(initialCourse.credits) && initialCourse.credits > 0
            ? String(initialCourse.credits)
            : "3",
        );
        setColorSeleccionado(initialColor);
        setDiasSeleccionados(initialClassDays);
        setSemanas(initialWeeks);

        if (initialSlots.length > 0) {
          const map: Record<string, { start: string; end: string }> = {};
          for (const s of initialSlots) map[s.day] = { start: s.start, end: s.end };
          setScheduleMode("perDay");
          setSameStart("");
          setSameEnd("");
          setPerDayMap(map);
        } else {
          setScheduleMode("same");
          setSameStart(initialCourse.scheduleStart ?? "");
          setSameEnd(initialCourse.scheduleEnd ?? "");
          setPerDayMap({});
        }
        return;
      }

      setNombreCurso("");
      setCreditos("3");
      setColorSeleccionado(COLOR_OPTIONS[0]);
      setDiasSeleccionados([]);
      setSemanas(16);
      setScheduleMode("same");
      setSameStart("");
      setSameEnd("");
      setPerDayMap({});
    });
  }, [open, isEdit, initialCourse]);

  useEffect(() => {
    if (!open || scheduleMode !== "perDay") return;
    queueMicrotask(() => {
      setPerDayMap((prev) => {
        let changed = false;
        const n = { ...prev };
        for (const d of diasSeleccionados) {
          if (!(d in n)) {
            n[d] = { start: "", end: "" };
            changed = true;
          }
        }
        for (const k of Object.keys(n)) {
          if (!diasSeleccionados.includes(k)) {
            delete n[k];
            changed = true;
          }
        }
        return changed ? n : prev;
      });
    });
  }, [open, scheduleMode, diasSeleccionados]);

  const quarterLabels = useMemo<QuarterSelectLabels>(
    () => ({
      morning: t("scheduleGroupMorning"),
      afternoon: t("scheduleGroupAfternoon"),
      evening: t("scheduleGroupEvening"),
    }),
    [t],
  );

  const schedulePresets = useMemo(
    () =>
      (
        [
          { start: "08:00", end: "10:00", labelKey: "schedulePreset1" as const },
          { start: "10:00", end: "12:00", labelKey: "schedulePreset2" as const },
          { start: "14:00", end: "16:00", labelKey: "schedulePreset3" as const },
          { start: "16:00", end: "18:00", labelKey: "schedulePreset4" as const },
          { start: "19:00", end: "21:00", labelKey: "schedulePreset5" as const },
        ] as const
      ).map((p) => ({ ...p, label: t(p.labelKey) })),
    [t],
  );

  const sortedSelectedDays = useMemo(
    () => [...diasSeleccionados].sort((a, b) => dayLetters.indexOf(a) - dayLetters.indexOf(b)),
    [diasSeleccionados, dayLetters],
  );

  const scheduleErrorMsg = (() => {
    if (scheduleMode === "same") {
      if (sameStart && sameEnd && !isValidTimeOrder(sameStart, sameEnd)) return t("scheduleTimeOrderError");
      return "";
    }
    for (const day of sortedSelectedDays) {
      const p = perDayMap[day];
      if (p?.start && p?.end && !isValidTimeOrder(p.start, p.end)) {
        return t("scheduleTimeOrderErrorDay", { day });
      }
    }
    return "";
  })();

  function applyPreset(start: string, end: string) {
    if (scheduleMode === "same") {
      setSameStart(start);
      setSameEnd(end);
      return;
    }
    setPerDayMap((prev) => {
      const n = { ...prev };
      for (const d of diasSeleccionados) {
        n[d] = { start, end };
      }
      return n;
    });
  }

  function switchToPerDayMode() {
    if (scheduleMode === "perDay") return;
    const seed = sameStart && sameEnd ? { start: sameStart, end: sameEnd } : { start: "", end: "" };
    setScheduleMode("perDay");
    setPerDayMap(() => {
      const next: Record<string, { start: string; end: string }> = {};
      for (const d of diasSeleccionados) {
        next[d] = { ...seed };
      }
      return next;
    });
  }

  function switchToSameMode() {
    if (scheduleMode === "same") return;
    const first = sortedSelectedDays[0];
    const src = first ? perDayMap[first] : null;
    if (src?.start && src?.end) {
      setSameStart(src.start);
      setSameEnd(src.end);
    }
    setScheduleMode("same");
  }

  function copyFirstPerDayRowToAll() {
    const first = sortedSelectedDays[0];
    const src = first ? perDayMap[first] : null;
    if (!src?.start || !src?.end) return;
    setPerDayMap((prev) => {
      const n = { ...prev };
      for (const d of diasSeleccionados) {
        n[d] = { start: src.start, end: src.end };
      }
      return n;
    });
  }

  const previewScheduleLine = (() => {
    if (scheduleMode === "same" && sameStart && sameEnd && isValidTimeOrder(sameStart, sameEnd)) {
      return `${sameStart} – ${sameEnd}`;
    }
    if (scheduleMode === "perDay") {
      const parts = sortedSelectedDays
        .map((day) => {
          const p = perDayMap[day];
          if (!p?.start || !p?.end || !isValidTimeOrder(p.start, p.end)) return null;
          return `${day} ${p.start}–${p.end}`;
        })
        .filter(Boolean) as string[];
      if (parts.length === 0) return "";
      return parts.join(" · ");
    }
    return "";
  })();

  function toggleDia(letter: string) {
    setDiasSeleccionados((prev) =>
      prev.includes(letter) ? prev.filter((d) => d !== letter) : [...prev, letter],
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombreCurso.trim()) return;
    if (creditosParsed <= 0) return;
    if (scheduleErrorMsg) return;

    let scheduleSlots: CourseScheduleSlot[] | undefined;
    let scheduleStart: string | undefined;
    let scheduleEnd: string | undefined;

    if (scheduleMode === "perDay") {
      const slots = sortedSelectedDays
        .map((day) => {
          const p = perDayMap[day];
          if (!p?.start || !p?.end) return null;
          if (!isValidTimeOrder(p.start, p.end)) return null;
          return { day, start: p.start.trim(), end: p.end.trim() };
        })
        .filter(Boolean) as CourseScheduleSlot[];
      if (slots.length > 0) scheduleSlots = slots;
    } else if (sameStart.trim() && sameEnd.trim()) {
      scheduleStart = sameStart.trim();
      scheduleEnd = sameEnd.trim();
    }

    const preservedCode =
      isEdit && initialCourse
        ? ((initialCourse.code ?? "").trim() === "—" ? "" : (initialCourse.code ?? "").trim())
        : "";
    const preservedProfessor =
      isEdit && initialCourse
        ? ((initialCourse.professor ?? "").trim() === "—" ? "" : (initialCourse.professor ?? "").trim())
        : "";
    const preservedModality: CourseModality =
      isEdit && initialCourse && isValidModality(initialCourse.modality)
        ? initialCourse.modality
        : "Presencial";

    const input = {
      name: nombreCurso.trim(),
      code: preservedCode,
      professor: preservedProfessor,
      colorHex: colorSeleccionado,
      classDays: diasSeleccionados.length > 0 ? [...diasSeleccionados].sort() : [],
      modality: preservedModality,
      weeksTotal: semanas,
      credits: creditosParsed,
      scheduleStart,
      scheduleEnd,
      scheduleSlots,
    };

    if (isEdit && initialCourse) {
      const updated = buildStudentCourseUpdateFromInput(initialCourse, input);
      updatePersistedStudentCourse(initialCourse.id, updated);
    } else {
      const course = buildStudentCourseFromInput(input);
      appendPersistedStudentCourse(course);
    }
    onSuccess?.();
    onClose();
  }

  const creditosParsed = clampCourseCredits(Number.parseFloat(creditos.replace(",", ".")));
  const canSave = nombreCurso.trim().length > 0 && creditosParsed > 0;
  const previewEmpty =
    !nombreCurso.trim() && creditosParsed <= 0 && diasSeleccionados.length === 0 && !previewScheduleLine;

  const inputIconClass =
    "pointer-events-none absolute left-3 top-1/2 size-[18px] -translate-y-1/2 text-[var(--app-primary)] opacity-90";
  const inputBase =
    "w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] py-2.5 pl-10 pr-3 text-sm text-[var(--app-fg)] placeholder:text-[var(--app-fg-muted)] outline-none transition-[border-color,box-shadow] duration-150 focus:border-[var(--accent-hex)] focus:shadow-[0_0_0_3px_var(--accent-ring)]";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-course-title"
        >
          <button type="button" aria-label={t("close")} className="absolute inset-0" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative max-h-[min(90vh,calc(100vh-2rem))] w-full max-w-[520px] overflow-y-auto rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-app-modal"
            style={
              {
                "--accent-hex": colorSeleccionado,
                "--accent-ring": `color-mix(in srgb, ${colorSeleccionado} 20%, transparent)`,
              } as React.CSSProperties
            }
          >
            <div className="p-7">
              <header className="flex items-start justify-between gap-3">
                <div>
                  <h2 id="add-course-title" className="text-lg font-semibold text-[var(--app-fg)]">
                    {isEdit ? t("editCourseTitle") : t("newCourseTitle")}
                  </h2>
                  <p className="mt-1 text-xs text-[var(--app-fg-muted)]">
                    {isEdit ? t("editCourseSubtitle") : t("modalSubtitle")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="shrink-0 rounded-lg p-2 text-[var(--app-fg-secondary)] transition hover:bg-[var(--app-surface-elevated)] hover:text-[var(--app-fg)]"
                  aria-label={t("close")}
                >
                  <X className="size-5" strokeWidth={2} />
                </button>
              </header>

              <div className="my-5 h-px bg-[var(--app-border)]" />

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="course-name" className="text-xs font-semibold text-[var(--app-fg)]">
                    {t("formCourseName")}
                  </label>
                  <div className="relative mt-1.5">
                    <BookOpen className={inputIconClass} aria-hidden />
                    <input
                      id="course-name"
                      type="text"
                      value={nombreCurso}
                      onChange={(e) => setNombreCurso(e.target.value)}
                      className={inputBase}
                      placeholder={t("formCourseNamePlaceholder")}
                      maxLength={120}
                      autoComplete="off"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="course-credits" className="text-xs font-medium text-[var(--app-fg)]">
                    {t("formCourseCredits")}
                  </label>
                  <p className="mt-0.5 text-[11px] leading-snug text-[var(--app-fg-muted)]">
                    {t("formCourseCreditsHint")}
                  </p>
                  <div className="relative mt-1.5">
                    <Coins className={inputIconClass} aria-hidden />
                    <input
                      id="course-credits"
                      type="number"
                      inputMode="decimal"
                      min={0.5}
                      max={99}
                      step={0.5}
                      value={creditos}
                      onChange={(e) => setCreditos(e.target.value)}
                      className={inputBase}
                      placeholder={t("formCourseCreditsPlaceholder")}
                      required
                    />
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-[var(--app-fg)]">{t("colorCourseLabel")}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {COLOR_OPTIONS.map((hex) => {
                      const active = colorSeleccionado === hex;
                      return (
                        <button
                          key={hex}
                          type="button"
                          onClick={() => setColorSeleccionado(hex)}
                          className={cn(
                            "relative flex size-7 shrink-0 items-center justify-center rounded-full border-2 transition-transform duration-150",
                            active ? "scale-[1.15]" : "scale-100 border-transparent",
                          )}
                          style={{
                            backgroundColor: hex,
                            boxShadow: active ? `0 0 0 2px ${hex}66, 0 2px 8px ${hex}44` : undefined,
                          }}
                          aria-label={hex}
                        >
                          {active ? <Check className="size-3.5 text-[var(--accent-fg)] drop-shadow" strokeWidth={3} /> : null}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium text-[var(--app-fg)]">{t("formClassDays")}</p>
                    <p className="text-xs text-[var(--app-fg-muted)]">{t("daysHintShort")}</p>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {dayLetters.map((letter) => {
                      const active = diasSeleccionados.includes(letter);
                      return (
                        <button
                          key={letter}
                          type="button"
                          onClick={() => toggleDia(letter)}
                          className={cn(
                            "relative flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors duration-150",
                            active
                              ? "border-2 text-transparent"
                              : "border border-transparent bg-[var(--app-bg)] text-[var(--app-fg-muted)]",
                          )}
                          style={
                            active
                              ? {
                                  backgroundColor: `color-mix(in srgb, ${colorSeleccionado} 20%, transparent)`,
                                  borderColor: colorSeleccionado,
                                }
                              : undefined
                          }
                        >
                          {active ? (
                            <Check className="absolute size-3.5 text-[var(--accent-fg)]" strokeWidth={3} aria-hidden />
                          ) : (
                            letter
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-[var(--app-fg)]">{t("cycleDurationLabel")}</p>
                  <div className="mt-2 flex items-center gap-3">
                    <button
                      type="button"
                      disabled={semanas <= 8}
                      onClick={() => setSemanas((s) => Math.max(8, s - 1))}
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--app-bg)] text-[var(--app-fg)] transition",
                        semanas <= 8 ? "pointer-events-none opacity-40" : "hover:bg-[var(--app-surface-elevated)]",
                      )}
                      aria-label="minus"
                    >
                      <Minus className="size-4" />
                    </button>
                    <motion.span
                      key={semanas}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.15 }}
                      className="min-w-[2.5rem] text-center text-lg font-semibold tabular-nums text-[var(--app-fg)]"
                    >
                      {semanas}
                    </motion.span>
                    <button
                      type="button"
                      disabled={semanas >= 20}
                      onClick={() => setSemanas((s) => Math.min(20, s + 1))}
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--app-bg)] text-[var(--app-fg)] transition",
                        semanas >= 20 ? "pointer-events-none opacity-40" : "hover:bg-[var(--app-surface-elevated)]",
                      )}
                      aria-label="plus"
                    >
                      <Plus className="size-4" />
                    </button>
                    <span className="text-xs text-[var(--app-fg-muted)]">{t("weeksUnit")}</span>
                  </div>
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Clock className="size-3.5 shrink-0 text-[var(--app-primary)] opacity-90" aria-hidden />
                    <p className="text-xs font-medium text-[var(--app-fg)]">{t("scheduleLabel")}</p>
                    <span className="ml-auto rounded-full bg-[var(--app-bg)] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--app-fg-muted)]">
                      {t("scheduleOptionalBadge")}
                    </span>
                  </div>
                  {scheduleMode === "perDay" ? (
                    <p className="mt-1.5 text-[11px] leading-snug text-[var(--app-fg-muted)]">{t("schedulePerDayExplainer")}</p>
                  ) : null}

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={switchToSameMode}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-full border-[0.5px] px-3.5 py-2 text-xs font-medium transition-colors duration-150",
                        scheduleMode === "same"
                          ? "border-[var(--accent-hex)] bg-[color-mix(in_srgb,var(--accent-hex)_15%,transparent)] text-[var(--text-primary)]"
                          : "border-[var(--border)] bg-[var(--bg-input)] text-[var(--text-muted)] hover:text-[var(--text-primary)]",
                      )}
                    >
                      {t("scheduleModeSame")}
                    </button>
                    <button
                      type="button"
                      onClick={switchToPerDayMode}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-full border-[0.5px] px-3.5 py-2 text-xs font-medium transition-colors duration-150",
                        scheduleMode === "perDay"
                          ? "border-[var(--accent-hex)] bg-[color-mix(in_srgb,var(--accent-hex)_15%,transparent)] text-[var(--text-primary)]"
                          : "border-[var(--border)] bg-[var(--bg-input)] text-[var(--text-muted)] hover:text-[var(--text-primary)]",
                      )}
                    >
                      {t("scheduleModePerDay")}
                    </button>
                  </div>

                  {scheduleMode === "perDay" && diasSeleccionados.length === 0 ? (
                    <p className="mt-2 text-[11px] text-[var(--warning)]">{t("schedulePickDaysHint")}</p>
                  ) : null}

                  <p className="mt-3 text-[10px] font-medium uppercase tracking-wide text-[var(--app-fg-muted)]">{t("schedulePresetsLabel")}</p>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {schedulePresets.map((p) => (
                      <button
                        key={`${p.start}-${p.end}`}
                        type="button"
                        onClick={() => applyPreset(p.start, p.end)}
                        className="rounded-full border border-[var(--app-border)] bg-[var(--app-bg)] px-2.5 py-1 text-[11px] font-medium text-[var(--app-fg-secondary)] transition hover:border-[var(--accent-hex)]/40 hover:text-[var(--app-fg)]"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  {scheduleMode === "same" ? (
                    <div className="mt-3">
                      <div className="flex flex-wrap items-end gap-2">
                        <div className="min-w-[120px] flex-1 space-y-1">
                          <label htmlFor="schedule-same-start" className="block text-[10px] font-medium uppercase tracking-wide text-[var(--app-fg-muted)]">
                            {t("scheduleFrom")}
                          </label>
                          <ScheduleQuarterSelect
                            id="schedule-same-start"
                            value={sameStart}
                            onChange={setSameStart}
                            labels={quarterLabels}
                            aria-label={t("scheduleFrom")}
                          />
                        </div>
                        <ArrowRight className="mb-2.5 size-4 shrink-0 text-[var(--app-fg-muted)]" aria-hidden />
                        <div className="min-w-[120px] flex-1 space-y-1">
                          <label htmlFor="schedule-same-end" className="block text-[10px] font-medium uppercase tracking-wide text-[var(--app-fg-muted)]">
                            {t("scheduleTo")}
                          </label>
                          <ScheduleQuarterSelect
                            id="schedule-same-end"
                            value={sameEnd}
                            onChange={setSameEnd}
                            labels={quarterLabels}
                            aria-label={t("scheduleTo")}
                          />
                        </div>
                      </div>
                      {sameStart && sameEnd && isValidTimeOrder(sameStart, sameEnd) && schedulePeriodKey(sameStart) ? (
                        <p className="mt-2 text-[11px] text-[var(--app-fg-muted)]">
                          {t("scheduleBlockHint")}:{" "}
                          <span className="font-medium text-[var(--app-fg-secondary)]">{t(schedulePeriodKey(sameStart)!)}</span>
                        </p>
                      ) : null}
                    </div>
                  ) : (
                    <div className="mt-3 space-y-2">
                      {sortedSelectedDays.length > 0 ? (
                        <>
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={copyFirstPerDayRowToAll}
                              className="text-xs font-medium text-[var(--accent-hex)] transition hover:underline"
                            >
                              {t("scheduleCopyToAll")}
                            </button>
                          </div>
                          {sortedSelectedDays.map((day) => {
                            const row = perDayMap[day] ?? { start: "", end: "" };
                            const pk = row.start ? schedulePeriodKey(row.start) : null;
                            return (
                              <div
                                key={day}
                                className="flex flex-wrap items-end gap-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)]/70 p-2.5"
                              >
                                <span
                                  className="mb-2 flex size-9 shrink-0 items-center justify-center rounded-full border text-xs font-bold text-[var(--app-fg)]"
                                  style={{
                                    borderColor: colorSeleccionado,
                                    backgroundColor: `color-mix(in srgb, ${colorSeleccionado} 18%, transparent)`,
                                  }}
                                >
                                  {day}
                                </span>
                                <div className="min-w-[100px] flex-1 space-y-1">
                                  <span className="block text-[10px] font-medium uppercase tracking-wide text-[var(--app-fg-muted)]">
                                    {t("scheduleFrom")}
                                  </span>
                                  <ScheduleQuarterSelect
                                    id={`per-${day}-start`}
                                    value={row.start}
                                    onChange={(v) =>
                                      setPerDayMap((prev) => ({
                                        ...prev,
                                        [day]: { start: v, end: prev[day]?.end ?? "" },
                                      }))
                                    }
                                    labels={quarterLabels}
                                    aria-label={`${day} ${t("scheduleFrom")}`}
                                  />
                                </div>
                                <ArrowRight className="mb-2.5 size-4 shrink-0 text-[var(--app-fg-muted)]" aria-hidden />
                                <div className="min-w-[100px] flex-1 space-y-1">
                                  <span className="block text-[10px] font-medium uppercase tracking-wide text-[var(--app-fg-muted)]">
                                    {t("scheduleTo")}
                                  </span>
                                  <ScheduleQuarterSelect
                                    id={`per-${day}-end`}
                                    value={row.end}
                                    onChange={(v) =>
                                      setPerDayMap((prev) => ({
                                        ...prev,
                                        [day]: { start: prev[day]?.start ?? "", end: v },
                                      }))
                                    }
                                    labels={quarterLabels}
                                    aria-label={`${day} ${t("scheduleTo")}`}
                                  />
                                </div>
                                {row.start && row.end && isValidTimeOrder(row.start, row.end) && pk ? (
                                  <p className="w-full pt-0.5 text-[10px] text-[var(--app-fg-muted)]">
                                    {t("scheduleBlockHint")}: <span className="text-[var(--app-fg-secondary)]">{t(pk)}</span>
                                  </p>
                                ) : null}
                              </div>
                            );
                          })}
                        </>
                      ) : null}
                    </div>
                  )}

                  {scheduleErrorMsg ? (
                    <p className="mt-2 text-xs text-[var(--error)]" role="alert">
                      {scheduleErrorMsg}
                    </p>
                  ) : null}
                </div>

                <div className="border-t border-[var(--app-border)] pt-5">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-xs text-[var(--app-fg-muted)]">{t("previewTitle")}</span>
                    <span className="text-[10px] text-[var(--app-fg-muted)]/70">{t("previewHint")}</span>
                  </div>
                  <div
                    className={cn(
                      "rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] p-4 transition-opacity duration-150",
                      previewEmpty ? "opacity-50" : "opacity-100",
                    )}
                    style={{
                      borderLeftWidth: 3,
                      borderLeftStyle: "solid",
                      borderLeftColor: colorSeleccionado,
                    }}
                  >
                    <p className="text-sm font-semibold text-[var(--app-fg)]">
                      {nombreCurso.trim() ? nombreCurso.trim() : t("previewNamePh")}
                    </p>
                    {creditosParsed > 0 ? (
                      <p className="mt-1 text-xs text-[var(--app-fg-muted)]">
                        {t("previewCredits", { count: creditosParsed })}
                      </p>
                    ) : null}
                    {diasSeleccionados.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {[...diasSeleccionados].sort().map((d) => (
                          <span
                            key={d}
                            className="flex size-7 items-center justify-center rounded-full border text-[10px] font-semibold text-[var(--text-primary)]"
                            style={{
                              borderColor: colorSeleccionado,
                              backgroundColor: `color-mix(in srgb, ${colorSeleccionado} 22%, transparent)`,
                            }}
                          >
                            {d}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    {previewScheduleLine ? (
                      <div className="mt-2 border-t border-[var(--app-border)]/80 pt-2">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--app-fg-muted)]">{t("previewSchedule")}</p>
                        <p className="mt-0.5 text-xs leading-snug text-[var(--app-fg-secondary)]">{previewScheduleLine}</p>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-wrap justify-end gap-3 pt-1">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3 py-2 text-sm font-medium text-[var(--app-fg-muted)] transition hover:text-[var(--app-fg)]"
                  >
                    {tCommon("cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={!canSave}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-[var(--radius-md)] px-[18px] py-[10px] text-sm font-semibold text-[var(--accent-fg)] transition-opacity duration-200",
                      canSave ? "opacity-100" : "cursor-not-allowed opacity-50",
                    )}
                    style={{ backgroundColor: colorSeleccionado }}
                  >
                    <Check className="size-4 shrink-0" strokeWidth={2.5} />
                    {isEdit ? t("saveChanges") : t("saveCourse")}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
