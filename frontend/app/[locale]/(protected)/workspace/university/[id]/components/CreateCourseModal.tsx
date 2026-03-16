"use client";

import { useEffect, useMemo, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  BookOpen,
  Building2,
  CalendarDays,
  GraduationCap,
  Plus,
  Trash2,
  User2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TimePicker } from "@/components/ui/time-picker";
import { COURSE_COLOR_TOKENS } from "@/app/lib/study-university/color-tokens";
import type { ScheduleConflict, Weekday } from "@/app/lib/study-university/types";

const scheduleSchema = z
  .object({
    weekday: z.enum(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]),
    startTime: z.string().min(1),
    endTime: z.string().min(1),
    classroom: z.string().optional(),
  })
  .refine((value) => value.startTime < value.endTime, {
    message: "La hora de inicio debe ser menor que la de fin",
    path: ["endTime"],
  });

const createCourseSchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  professor: z.string().optional(),
  credits: z.coerce.number().min(0).max(9999.99).optional(),
  classroom: z.string().optional(),
  courseType: z.enum(["lecture", "lab", "seminar", "workshop", "other"]).default("lecture"),
  colorToken: z.enum(["blue", "violet", "emerald", "amber", "rose", "cyan", "indigo", "teal"]),
  icon: z.string().optional(),
  schedules: z.array(scheduleSchema).min(1, "Agrega al menos un horario"),
});

export type CreateCourseFormValues = z.infer<typeof createCourseSchema>;
type CreateCourseFormInput = z.input<typeof createCourseSchema>;

const DEFAULT_SCHEDULE: CreateCourseFormValues["schedules"][number] = {
  weekday: "monday",
  startTime: "09:00",
  endTime: "10:30",
};

const WEEKDAY_OPTIONS: Array<{ value: Weekday; short: string; long: string }> = [
  { value: "monday", short: "Lun", long: "Lunes" },
  { value: "tuesday", short: "Mar", long: "Martes" },
  { value: "wednesday", short: "Mié", long: "Miércoles" },
  { value: "thursday", short: "Jue", long: "Jueves" },
  { value: "friday", short: "Vie", long: "Viernes" },
  { value: "saturday", short: "Sáb", long: "Sábado" },
  { value: "sunday", short: "Dom", long: "Domingo" },
];

function normalizeTime(value: string | undefined | null): string {
  if (value == null || typeof value !== "string") return "09:00";
  const [h = "09", m = "00"] = value.split(":");
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function addMinutes(value: string, minutes: number) {
  const [rawHour, rawMinute] = normalizeTime(value).split(":").map(Number);
  const current = rawHour * 60 + rawMinute;
  const total = current + minutes;
  const wrapped = ((total % (24 * 60)) + 24 * 60) % (24 * 60);
  const nextHour = Math.floor(wrapped / 60);
  const nextMinute = wrapped % 60;
  return `${String(nextHour).padStart(2, "0")}:${String(nextMinute).padStart(2, "0")}`;
}

function weekdayFromDate(dateIso: string): Weekday {
  const weekday = new Date(`${dateIso}T00:00:00`).getDay();
  return ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][
    weekday
  ] as Weekday;
}

export function CreateCourseModal({
  open,
  onClose,
  onSubmit,
  conflicts = [],
  initialSlot,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: CreateCourseFormValues) => Promise<void>;
  conflicts?: ScheduleConflict[];
  initialSlot?: { date: string; startTime: string; endTime: string } | null;
}) {
  const scheduleSectionRef = useRef<HTMLDivElement | null>(null);
  const form = useForm<CreateCourseFormInput, unknown, CreateCourseFormValues>({
    resolver: zodResolver(createCourseSchema),
    defaultValues: {
      courseType: "lecture",
      colorToken: "indigo",
      schedules: [DEFAULT_SCHEDULE],
    },
    mode: "onChange",
  });
  const schedules = useFieldArray({ control: form.control, name: "schedules" });
  const watchedSchedules = useWatch({ control: form.control, name: "schedules" });
  const canSubmit = useMemo(() => !form.formState.isSubmitting, [form.formState.isSubmitting]);
  const scheduleRootError = form.formState.errors.schedules?.message;

  const initialSlotKey = initialSlot
    ? `${initialSlot.date}-${initialSlot.startTime}-${initialSlot.endTime}`
    : null;
  const appliedSlotRef = useRef<string | null>(null);

  useEffect(() => {
    if (!open) {
      appliedSlotRef.current = null;
      return;
    }
    if (!initialSlot || !initialSlotKey) return;
    if (appliedSlotRef.current === initialSlotKey) return;
    appliedSlotRef.current = initialSlotKey;

    const mappedWeekday = weekdayFromDate(initialSlot.date);
    const start = normalizeTime(initialSlot.startTime);
    const end = normalizeTime(initialSlot.endTime);
    const currentSchedules = form.getValues("schedules");
    if (!currentSchedules?.length) {
      schedules.append({ weekday: mappedWeekday, startTime: start, endTime: end });
      return;
    }
    form.setValue("schedules.0.weekday", mappedWeekday, { shouldDirty: true });
    form.setValue("schedules.0.startTime", start, { shouldDirty: true });
    form.setValue("schedules.0.endTime", end, { shouldDirty: true });
    // Only depend on open and slot identity; form/schedules would cause update loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialSlotKey]);

  const closeAndReset = () => {
    form.reset({
      courseType: "lecture",
      colorToken: "indigo",
      schedules: [DEFAULT_SCHEDULE],
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="create-course-drawer"
          className="fixed inset-0 z-50 flex justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label="Cerrar"
            className="absolute inset-0 bg-black/40"
            onClick={closeAndReset}
          />
          <motion.form
            className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-[var(--app-border)] bg-[var(--app-surface)] shadow-xl sm:max-w-[460px]"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 280, damping: 32, mass: 0.75 }}
            onSubmit={form.handleSubmit(async (values) => {
              await onSubmit(values);
              closeAndReset();
            })}
          >
            <div className="flex min-h-0 flex-1 flex-col">
              <header className="shrink-0 border-b border-[var(--app-border)]/80 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--app-fg)]/55">Editor de horarios</p>
                    <h3 className="mt-1 text-lg font-semibold text-[var(--app-fg)]">Crear curso</h3>
                    <p className="mt-1 text-xs text-[var(--app-fg)]/65">
                      Define información académica y bloques semanales.
                    </p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={closeAndReset}>
                    Cerrar
                  </Button>
                </div>
              </header>

              <div className="min-h-0 flex-1 overflow-y-auto p-4">
              {conflicts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-5 rounded-xl border border-amber-500/35 bg-amber-500/10 p-3"
                >
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-600" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                        Conflicto de horario detectado
                      </p>
                      <p className="mt-0.5 text-xs text-amber-700/90 dark:text-amber-300/90">
                        Hay {conflicts.length} conflicto(s) activo(s) en el calendario.
                      </p>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="mt-2 border-amber-500/40 bg-transparent text-amber-700 hover:bg-amber-500/15 dark:text-amber-300"
                        onClick={() => {
                          const first = conflicts[0];
                          form.setValue("schedules.0.weekday", first.day, { shouldDirty: true });
                          form.setValue("schedules.0.startTime", normalizeTime(first.conflictingEndTime), { shouldDirty: true });
                          form.setValue("schedules.0.endTime", addMinutes(first.conflictingEndTime, 90), { shouldDirty: true });
                          scheduleSectionRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
                        }}
                      >
                        Ajustar hora
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              <section className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg)]/50 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-[var(--app-primary)]" />
                  <h4 className="text-sm font-semibold text-[var(--app-fg)]">Información del curso</h4>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="relative">
                    <input
                      id="course-name"
                      placeholder=" "
                      className="peer h-11 w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 pt-5 pb-2 text-sm text-[var(--app-fg)] transition focus:border-[var(--app-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--app-primary)]/15"
                      {...form.register("name")}
                    />
                    <label
                      htmlFor="course-name"
                      className="pointer-events-none absolute left-3 top-2 text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--app-fg)]/55 transition peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-xs peer-placeholder-shown:tracking-[0.04em]"
                    >
                      <span className="inline-flex items-center gap-1">
                        <GraduationCap className="h-3 w-3" />
                        Nombre del curso
                      </span>
                    </label>
                    {form.formState.errors.name?.message && (
                      <p className="mt-1 text-[11px] text-destructive">{form.formState.errors.name.message}</p>
                    )}
                  </div>

                  <div className="relative">
                    <input
                      id="course-professor"
                      placeholder=" "
                      className="peer h-11 w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 pt-5 pb-2 text-sm text-[var(--app-fg)] transition focus:border-[var(--app-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--app-primary)]/15"
                      {...form.register("professor")}
                    />
                    <label
                      htmlFor="course-professor"
                      className="pointer-events-none absolute left-3 top-2 text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--app-fg)]/55 transition peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-xs peer-placeholder-shown:tracking-[0.04em]"
                    >
                      <span className="inline-flex items-center gap-1">
                        <User2 className="h-3 w-3" />
                        Profesor
                      </span>
                    </label>
                  </div>

                  <div className="relative">
                    <input
                      id="course-credits"
                      type="number"
                      min={0}
                      max={9999.99}
                      step={0.5}
                      placeholder=" "
                      className="peer h-11 w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 pt-5 pb-2 text-sm text-[var(--app-fg)] transition focus:border-[var(--app-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--app-primary)]/15"
                      {...form.register("credits")}
                    />
                    <label
                      htmlFor="course-credits"
                      className="pointer-events-none absolute left-3 top-2 text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--app-fg)]/55 transition peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-xs peer-placeholder-shown:tracking-[0.04em]"
                    >
                      Créditos
                    </label>
                    {form.formState.errors.credits?.message && (
                      <p className="mt-1 text-[11px] text-destructive">{form.formState.errors.credits.message}</p>
                    )}
                  </div>

                  <div className="relative">
                    <input
                      id="course-classroom"
                      placeholder=" "
                      className="peer h-11 w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 pt-5 pb-2 text-sm text-[var(--app-fg)] transition focus:border-[var(--app-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--app-primary)]/15"
                      {...form.register("classroom")}
                    />
                    <label
                      htmlFor="course-classroom"
                      className="pointer-events-none absolute left-3 top-2 text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--app-fg)]/55 transition peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-xs peer-placeholder-shown:tracking-[0.04em]"
                    >
                      <span className="inline-flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        Aula base
                      </span>
                    </label>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--app-fg)]/60">
                      Tipo
                    </label>
                    <select
                      className="h-11 w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 text-sm text-[var(--app-fg)] transition focus:border-[var(--app-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--app-primary)]/15"
                      {...form.register("courseType")}
                    >
                      <option value="lecture">Clase magistral</option>
                      <option value="lab">Laboratorio</option>
                      <option value="seminar">Seminario</option>
                      <option value="workshop">Taller</option>
                      <option value="other">Otro</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--app-fg)]/60">
                      Color
                    </label>
                    <select
                      className="h-11 w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 text-sm capitalize text-[var(--app-fg)] transition focus:border-[var(--app-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--app-primary)]/15"
                      {...form.register("colorToken")}
                    >
                      {COURSE_COLOR_TOKENS.map((token) => (
                        <option key={token} value={token}>
                          {token}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>

              <section ref={scheduleSectionRef} className="mt-4 rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg)]/50 p-4">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-[var(--app-primary)]" />
                    <h4 className="text-sm font-semibold text-[var(--app-fg)]">Bloques de horario</h4>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => schedules.append({ weekday: "monday", startTime: "08:00", endTime: "09:00" })}
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    Añadir bloque
                  </Button>
                </div>
                {scheduleRootError && (
                  <p className="mb-2 text-[11px] text-destructive">{scheduleRootError}</p>
                )}
                <div className="space-y-3">
                  <AnimatePresence initial={false}>
                    {schedules.fields.map((field, index) => {
                      const currentSchedule = watchedSchedules?.[index];
                      const weekday = currentSchedule?.weekday ?? "monday";
                      const startTime = currentSchedule?.startTime ?? "09:00";
                      const endTime = currentSchedule?.endTime ?? "10:30";
                      return (
                        <motion.div
                          key={field.id}
                          layout
                          initial={{ opacity: 0, y: 6, scale: 0.995 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -5, scale: 0.99 }}
                          transition={{ duration: 0.18, ease: "easeOut" }}
                          className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-3"
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--app-fg)]/60">
                              Bloque {index + 1}
                            </p>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => schedules.remove(index)}
                              aria-label="Eliminar bloque"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>

                          <div className="mb-3 grid grid-cols-7 gap-1">
                            {WEEKDAY_OPTIONS.map((day) => (
                              <button
                                key={day.value}
                                type="button"
                                onClick={() =>
                                  form.setValue(`schedules.${index}.weekday`, day.value, { shouldDirty: true })
                                }
                                className={`h-8 rounded-full border text-[10px] font-semibold tracking-[0.06em] transition ${
                                  weekday === day.value
                                    ? "border-[var(--app-primary)] bg-[var(--app-primary)]/12 text-[var(--app-primary)]"
                                    : "border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-fg)]/70 hover:bg-[var(--app-primary)]/8"
                                }`}
                              >
                                {day.short}
                              </button>
                            ))}
                          </div>

                          <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-[1fr_auto_1fr]">
                            <div className="min-w-0">
                              <TimePicker
                                value={normalizeTime(startTime)}
                                onChange={(next) =>
                                  form.setValue(`schedules.${index}.startTime`, next, { shouldDirty: true })
                                }
                                aria-label={`Hora de inicio bloque ${index + 1}`}
                                className="w-full min-w-0"
                              />
                            </div>
                            <div className="hidden items-center justify-center text-xs text-[var(--app-fg-muted)] sm:flex">
                              —
                            </div>
                            <div className="min-w-0">
                              <TimePicker
                                value={normalizeTime(endTime)}
                                onChange={(next) =>
                                  form.setValue(`schedules.${index}.endTime`, next, { shouldDirty: true })
                                }
                                aria-label={`Hora de fin bloque ${index + 1}`}
                                className="w-full min-w-0"
                              />
                            </div>
                          </div>
                          {form.formState.errors.schedules?.[index]?.endTime?.message && (
                            <p className="mt-1.5 text-[11px] text-destructive">
                              {form.formState.errors.schedules[index]?.endTime?.message}
                            </p>
                          )}

                          <div className="mt-2.5">
                            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--app-fg)]/60">
                              Aula
                            </label>
                            <input
                              className="h-10 w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-3 text-sm text-[var(--app-fg)] transition focus:border-[var(--app-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--app-primary)]/15"
                              placeholder="Ej. B201"
                              {...form.register(`schedules.${index}.classroom`)}
                            />
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </section>
              </div>

              <footer className="shrink-0 border-t border-[var(--app-border)] bg-[var(--app-surface)] p-4">
                <Button type="submit" disabled={!canSubmit} className="w-full">
                  {form.formState.isSubmitting ? "Guardando..." : "Crear curso"}
                </Button>
              </footer>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
