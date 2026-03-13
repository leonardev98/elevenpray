"use client";

import { useRouter } from "@/i18n/navigation";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface NavGroupItem {
  href: string;
  key: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavGroupDropdownProps {
  labelKey: string;
  items: NavGroupItem[];
  isActive: boolean;
  renderLabel: (key: string) => string;
  onNavigate?: () => void;
}

export function NavGroupDropdown({
  labelKey,
  items,
  isActive,
  renderLabel,
}: NavGroupDropdownProps) {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-[length:var(--dev-font-body-size)] font-medium transition-all duration-150 whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-navy)]/30",
          "data-[state=open]:bg-[var(--app-navy)]/10 data-[state=open]:text-[var(--app-navy)] data-[state=open]:shadow-sm",
          isActive
            ? "bg-[var(--app-navy)]/10 text-[var(--app-navy)] shadow-sm"
            : "text-[var(--app-fg)]/70 hover:bg-[var(--app-bg)] hover:text-[var(--app-fg)]"
        )}
        aria-label={renderLabel(labelKey)}
      >
        <span>{renderLabel(labelKey)}</span>
        <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 [[data-state=open]_&]:rotate-180" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={6}
        className="min-w-[180px] rounded-xl border border-[var(--dev-border-subtle)] bg-[var(--dev-surface-elevated)] py-1.5 shadow-lg ring-1 ring-[var(--app-border)]/50"
      >
        {items.map(({ href, key, icon: Icon }) => (
          <DropdownMenuItem
            key={key}
            onClick={() => setTimeout(() => router.push(href), 0)}
            className={cn(
              "flex cursor-pointer items-center gap-2 px-3 py-2 text-sm font-medium outline-none",
              "text-[var(--app-fg)] focus:bg-[var(--app-navy)]/10 focus:text-[var(--app-navy)]",
              "hover:bg-[var(--app-navy)]/10 hover:text-[var(--app-navy)]"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{renderLabel(key)}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
