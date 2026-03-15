"use client";

import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COURSE_COLOR_TOKENS } from "@/app/lib/study-university/color-tokens";

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

export function CreateCourseModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: CreateCourseFormValues) => Promise<void>;
}) {
  const form = useForm<CreateCourseFormInput, unknown, CreateCourseFormValues>({
    resolver: zodResolver(createCourseSchema),
    defaultValues: {
      courseType: "lecture",
      colorToken: "indigo",
      schedules: [{ weekday: "monday", startTime: "09:00", endTime: "10:30" }],
    },
  });
  const schedules = useFieldArray({ control: form.control, name: "schedules" });
  const canSubmit = useMemo(() => !form.formState.isSubmitting, [form.formState.isSubmitting]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <motion.form
          className="w-full max-w-3xl rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-xl"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 10, opacity: 0 }}
          onSubmit={form.handleSubmit(async (values) => {
            await onSubmit(values);
            form.reset();
            onClose();
          })}
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--app-fg)]/50">Course Builder</p>
              <h3 className="text-xl font-semibold text-[var(--app-fg)]">Crear curso</h3>
            </div>
            <Button type="button" variant="outline" onClick={onClose}>Cerrar</Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <input className="rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2" placeholder="Nombre del curso" {...form.register("name")} />
            <input className="rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2" placeholder="Profesor (opcional)" {...form.register("professor")} />
            <input type="number" min={0} max={9999.99} step={0.5} className="rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2" placeholder="Créditos (0–9999.99)" {...form.register("credits")} />
            <input className="rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2" placeholder="Aula base" {...form.register("classroom")} />
            <select className="rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2" {...form.register("courseType")}>
              <option value="lecture">Lecture</option>
              <option value="lab">Lab</option>
              <option value="seminar">Seminar</option>
              <option value="workshop">Workshop</option>
              <option value="other">Other</option>
            </select>
            <select className="rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2" {...form.register("colorToken")}>
              {COURSE_COLOR_TOKENS.map((token) => (
                <option key={token} value={token}>{token}</option>
              ))}
            </select>
          </div>

          <div className="mt-5 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-[var(--app-fg)]">Horarios</p>
              <Button
                type="button"
                variant="outline"
                onClick={() => schedules.append({ weekday: "monday", startTime: "08:00", endTime: "09:00" })}
              >
                <Plus className="mr-1 h-4 w-4" /> Añadir bloque
              </Button>
            </div>
            {schedules.fields.map((field, index) => (
              <div key={field.id} className="grid gap-2 rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] p-3 sm:grid-cols-[1fr_1fr_1fr_1fr_auto]">
                <select className="rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] px-2 py-2" {...form.register(`schedules.${index}.weekday`)}>
                  <option value="monday">Lunes</option>
                  <option value="tuesday">Martes</option>
                  <option value="wednesday">Miércoles</option>
                  <option value="thursday">Jueves</option>
                  <option value="friday">Viernes</option>
                  <option value="saturday">Sábado</option>
                  <option value="sunday">Domingo</option>
                </select>
                <input type="time" className="rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] px-2 py-2" {...form.register(`schedules.${index}.startTime`)} />
                <input type="time" className="rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] px-2 py-2" {...form.register(`schedules.${index}.endTime`)} />
                <input className="rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] px-2 py-2" placeholder="Aula" {...form.register(`schedules.${index}.classroom`)} />
                <Button type="button" variant="ghost" onClick={() => schedules.remove(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <Button type="submit" disabled={!canSubmit}>
              {form.formState.isSubmitting ? "Guardando..." : "Crear curso"}
            </Button>
          </div>
        </motion.form>
      </motion.div>
    </AnimatePresence>
  );
}
