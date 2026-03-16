"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { DayPicker } from "react-day-picker";
import { Calendar } from "lucide-react";
import { useLocale } from "next-intl";
import { es, enUS, type Locale } from "date-fns/locale";
import { cn } from "@/lib/utils";
import "react-day-picker/style.css";

const dateFnsLocaleMap: Record<string, Locale> = { es, en: enUS };

/** Formato de valor: YYYY-MM-DD */
export function DatePicker({
  value,
  onChange,
  className,
  placeholder = "Seleccionar fecha",
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}) {
  const appLocale = useLocale();
  const locale = dateFnsLocaleMap[appLocale] ?? es;

  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 280 });
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selectedDate = value ? new Date(value + "T00:00:00") : undefined;

  const { startMonth, endMonth } = useMemo(() => {
    const now = new Date();
    return {
      startMonth: new Date(now.getFullYear() - 10, 0, 1),
      endMonth: new Date(now.getFullYear() + 2, 11, 31),
    };
  }, []);

  /** Días de la semana con 3 letras (lun, mar, mié…) y mes con mayúscula inicial (Marzo) */
  const formatters = useMemo(
    () => ({
      formatWeekdayName: (weekday: Date, _options: unknown, dateLib: { format: (d: Date, fmt: string) => string }) =>
        dateLib.format(weekday, "ccc"),
      formatMonthDropdown: (month: Date, dateLib: { format: (d: Date, fmt: string) => string }) => {
        const name = dateLib.format(month, "LLLL");
        return name.charAt(0).toUpperCase() + name.slice(1);
      },
    }),
    [],
  );

  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const w = Math.max(280, Math.round(rect.width));
    setPosition({ top: rect.bottom + 4, left: rect.left, width: w });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      const inPopover = containerRef.current?.contains(target);
      const inTrigger = triggerRef.current?.contains(target);
      if (!inPopover && !inTrigger) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function formatDisplayDate(iso: string) {
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
  }

  function handleSelect(date: Date | undefined) {
    if (!date) return;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    onChange(`${y}-${m}-${d}`);
    setOpen(false);
  }

  const popoverContent = open && (
    <div
      ref={containerRef}
      className="date-picker-popover fixed z-[210] rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] shadow-app-modal"
      style={{
        top: position.top,
        left: position.left,
        width: position.width,
        minWidth: 280,
        // Para que las celdas llenen el ancho disponible
        ["--date-picker-width" as string]: `${position.width}px`,
      }}
      role="dialog"
      aria-label="Calendario"
    >
      <DayPicker
        mode="single"
        selected={selectedDate}
        onSelect={handleSelect}
        locale={locale}
        captionLayout="dropdown"
        startMonth={startMonth}
        endMonth={endMonth}
        formatters={formatters}
        fixedWeeks={false}
        classNames={{ root: "rdp-root rdp-dark" }}
      />
    </div>
  );

  return (
    <div className={cn("relative", className)}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2 text-left text-[var(--app-fg)] shadow-app-input"
      >
        <span className="flex-1">
          {value ? formatDisplayDate(value) : placeholder}
        </span>
        <Calendar className="size-5 shrink-0 text-[var(--app-fg)]" aria-hidden />
      </button>
      {typeof document !== "undefined" && popoverContent && createPortal(popoverContent, document.body)}
    </div>
  );
}
