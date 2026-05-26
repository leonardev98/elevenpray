"use client";

import Image from "next/image";
import { CreditCard, LogOut, Moon, Sun, User as UserIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/app/providers/auth-provider";
import { useTheme } from "@/app/providers/theme-provider";
import { Link, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function getInitials(name: string | undefined | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface AvatarCircleProps {
  src?: string | null;
  fallback: string;
  size: number;
  className?: string;
}

function AvatarCircle({ src, fallback, size, className }: AvatarCircleProps) {
  return (
    <span
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--accent-subtle)] font-semibold text-[var(--accent)]",
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
    >
      {src ? (
        <Image
          src={src}
          alt=""
          fill
          sizes={`${size}px`}
          className="object-cover"
          referrerPolicy="no-referrer"
          unoptimized
        />
      ) : (
        <span aria-hidden>{fallback}</span>
      )}
    </span>
  );
}

export function UserMenuButton() {
  const { user, logout } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  const router = useRouter();
  const t = useTranslations("userMenu");
  const isDark = resolvedTheme === "dark";

  const displayName = user?.name?.trim() || user?.email || t("guest");
  const email = user?.email ?? "";
  const initials = getInitials(user?.name || user?.email);

  function handleLogout() {
    logout();
    router.replace("/");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "group relative flex h-10 w-10 items-center justify-center rounded-full p-0.5",
          "ring-1 ring-[var(--border)] transition-all",
          "hover:ring-2 hover:ring-[var(--accent)]/40",
          "data-popup-open:ring-2 data-popup-open:ring-[var(--accent)]/60",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/50",
        )}
        aria-label={t("openMenu")}
      >
        <AvatarCircle
          src={user?.avatarUrl}
          fallback={initials}
          size={36}
          className="ring-1 ring-[var(--bg-surface)] shadow-sm"
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className={cn(
          "w-[280px] rounded-2xl border-[0.5px] border-[var(--border-strong)] bg-[var(--bg-elevated)] p-0",
          "shadow-[0_8px_30px_rgba(0,0,0,0.12),0_2px_6px_rgba(0,0,0,0.06)]",
        )}
      >
        {/* Cabecera con avatar + identidad */}
        <div className="flex items-center gap-3 px-4 pb-3 pt-4">
          <AvatarCircle src={user?.avatarUrl} fallback={initials} size={44} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-semibold leading-tight text-[var(--text-primary)]">
              {displayName}
            </p>
            {email && (
              <p className="mt-0.5 truncate text-[12px] leading-tight text-[var(--text-muted)]">
                {email}
              </p>
            )}
          </div>
        </div>

        <DropdownMenuSeparator className="my-0 bg-[var(--border)]" />

        {/* Sección: navegación */}
        <div className="p-1.5">
          <DropdownMenuItem className="p-0">
            <Link
              href="/app/profile"
              className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-[var(--text-primary)] outline-none transition-colors hover:bg-[var(--bg-surface)]"
            >
              <UserIcon className="h-4 w-4 text-[var(--text-muted)]" strokeWidth={1.75} />
              <span>{t("profile")}</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem className="p-0">
            <Link
              href="/app/plan"
              className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-[var(--text-primary)] outline-none transition-colors hover:bg-[var(--bg-surface)]"
            >
              <CreditCard className="h-4 w-4 text-[var(--text-muted)]" strokeWidth={1.75} />
              <span>{t("plan")}</span>
            </Link>
          </DropdownMenuItem>

          {/* Toggle tema */}
          <DropdownMenuItem
            onClick={(e) => {
              e.preventDefault();
              toggleTheme();
            }}
            className="flex cursor-pointer items-center justify-between gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-[var(--text-primary)]"
          >
            <span className="flex items-center gap-2.5">
              {isDark ? (
                <Sun className="h-4 w-4 text-[var(--text-muted)]" strokeWidth={1.75} />
              ) : (
                <Moon className="h-4 w-4 text-[var(--text-muted)]" strokeWidth={1.75} />
              )}
              <span>{isDark ? t("themeLight") : t("themeDark")}</span>
            </span>
            <span className="rounded-md bg-[var(--bg-surface)] px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
              {isDark ? t("dark") : t("light")}
            </span>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator className="my-0 bg-[var(--border)]" />

        {/* Logout */}
        <div className="p-1.5">
          <DropdownMenuItem
            variant="destructive"
            onClick={handleLogout}
            className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px]"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.75} />
            <span>{t("logout")}</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
