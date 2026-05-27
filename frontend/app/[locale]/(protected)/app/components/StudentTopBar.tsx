"use client";

import { format } from "date-fns";
import { enUS, es } from "date-fns/locale";
import { Menu } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/app/providers/auth-provider";
import { cn } from "@/lib/utils";
import { useStudentShell } from "./student-shell-context";
import { UserMenuButton } from "./UserMenuButton";
import { PomodoroNavControl } from "../pomodoro/components/PomodoroNavControl";

interface StudentTopBarProps {
  onOpenMenu?: () => void;
  title?: string;
}

/** Píxeles bajo los cuales el header siempre se muestra (zona "casi arriba"). */
const TOP_THRESHOLD = 12;
/** Mínimo delta vertical (px) para considerar un cambio de dirección y evitar jitter. */
const DELTA_THRESHOLD = 6;
/** No ocultamos el header hasta haber pasado este umbral hacia abajo. */
const HIDE_AFTER = 80;

/**
 * Encuentra el ancestro scrollable más cercano (puede ser el div con
 * `overflow-y-auto` que envuelve al children en el StudentAppLayout) o cae al
 * `window` si no encuentra ninguno.
 */
function findScrollableAncestor(node: HTMLElement | null): HTMLElement | Window {
  let current: HTMLElement | null = node?.parentElement ?? null;
  while (current) {
    const overflowY = getComputedStyle(current).overflowY;
    const isScrollable = overflowY === "auto" || overflowY === "scroll";
    if (isScrollable && current.scrollHeight > current.clientHeight) {
      return current;
    }
    current = current.parentElement;
  }
  return window;
}

/**
 * Auto-hide-on-scroll-down, show-on-scroll-up (patrón estilo Twitter móvil,
 * Medium, YouTube). Mantiene el header siempre visible cerca del top.
 */
function useAutoHideHeader<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const container = findScrollableAncestor(el);

    function readY(): number {
      return container === window
        ? window.scrollY
        : (container as HTMLElement).scrollTop;
    }

    let lastY = readY();
    let ticking = false;

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = readY();
        const delta = y - lastY;

        if (y < TOP_THRESHOLD) {
          setVisible(true);
        } else if (delta > DELTA_THRESHOLD && y > HIDE_AFTER) {
          setVisible(false);
        } else if (delta < -DELTA_THRESHOLD) {
          setVisible(true);
        }

        lastY = y;
        ticking = false;
      });
    }

    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, []);

  return { ref, visible };
}

export function StudentTopBar({ onOpenMenu, title }: StudentTopBarProps) {
  const shell = useStudentShell();
  const openMenu = onOpenMenu ?? shell.openMobileMenu;
  const { user } = useAuth();
  const t = useTranslations("studentHome");
  const locale = useLocale() as "es" | "en";
  const dateFnsLocale = locale === "en" ? enUS : es;
  const { ref, visible } = useAutoHideHeader<HTMLElement>();

  // Fuente de verdad: backend (`user.name`). El antiguo
  // `getStudentProfile().name` de localStorage queda obsoleto porque puede
  // contener datos del onboarding del usuario anterior (cross-account leak).
  const displayName = user?.name?.split(" ")[0] || t("guest");
  const today = format(new Date(), "EEEE, d MMMM", { locale: dateFnsLocale });

  return (
    <header
      ref={ref}
      className={cn(
        "sticky top-0 z-30 flex items-center justify-between gap-4",
        "border-b-[0.5px] border-[var(--border)] bg-[var(--bg-surface)]/85 backdrop-blur-md",
        "px-4 py-4 lg:px-8",
        "transition-transform duration-300 ease-out will-change-transform",
        visible ? "translate-y-0" : "-translate-y-full",
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        {openMenu && (
          <button
            type="button"
            onClick={openMenu}
            className="rounded-[var(--radius-md)] p-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] lg:hidden"
            aria-label={t("openMenu")}
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <div className="min-w-0">
          {title ? (
            <h1 className="truncate text-lg font-semibold tracking-[-0.01em] text-[var(--text-primary)]">{title}</h1>
          ) : (
            <>
              <p className="text-sm capitalize text-[var(--text-muted)]">{today}</p>
              <h1 className="truncate text-xl font-semibold tracking-[-0.01em] text-[var(--text-primary)]">
                {t("greeting", { name: displayName })}
              </h1>
            </>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <PomodoroNavControl compact />
        <UserMenuButton />
      </div>
    </header>
  );
}
