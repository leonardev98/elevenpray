"use client";

import Image from "next/image";
import { LogOut, User as UserIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/app/providers/auth-provider";
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

export function UserMenuButton() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const t = useTranslations("userMenu");

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
          "flex items-center gap-2 rounded-full border-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] p-1 pr-3 text-left transition-colors hover:bg-[var(--bg-elevated)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40",
        )}
        aria-label={t("openMenu")}
      >
        <span className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--accent-subtle)] text-xs font-semibold text-[var(--accent)]">
          {user?.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt={displayName}
              fill
              sizes="32px"
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span aria-hidden>{initials}</span>
          )}
        </span>
        <span className="hidden max-w-[140px] truncate text-sm font-medium text-[var(--text-primary)] sm:block">
          {displayName}
        </span>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="min-w-[240px] rounded-[var(--radius-lg)] border-[0.5px] border-[var(--border-strong)] bg-[var(--bg-elevated)] p-1 shadow-[var(--shadow-md)]"
      >
        <div className="flex items-center gap-3 px-2.5 py-2.5">
          <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--accent-subtle)] text-sm font-semibold text-[var(--accent)]">
            {user?.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt={displayName}
                fill
                sizes="40px"
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span aria-hidden>{initials}</span>
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
              {displayName}
            </p>
            {email && (
              <p className="truncate text-xs text-[var(--text-muted)]">
                {email}
              </p>
            )}
          </div>
        </div>

        <DropdownMenuSeparator className="bg-[var(--border)]" />

        <DropdownMenuItem className="p-0">
          <Link
            href="/app/profile"
            className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm text-[var(--text-primary)] outline-none"
          >
            <UserIcon className="h-4 w-4 text-[var(--text-muted)]" />
            <span>{t("profile")}</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-[var(--border)]" />

        <DropdownMenuItem
          variant="destructive"
          onClick={handleLogout}
          className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm"
        >
          <LogOut className="h-4 w-4" />
          <span>{t("logout")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
