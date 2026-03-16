"use client";

import * as React from "react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface SettingsToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
  className?: string;
}

export function SettingsToggle({
  label,
  description,
  checked,
  onCheckedChange,
  disabled = false,
  id: idProp,
  className,
}: SettingsToggleProps) {
  const id = React.useId();
  const finalId = idProp ?? id;

  return (
    <div
      className={cn(
        "flex flex-col gap-1 rounded-lg px-3 py-2.5 transition-colors hover:bg-neutral-100 sm:flex-row sm:items-center sm:justify-between sm:gap-4 dark:hover:bg-[var(--app-surface-soft)]",
        className
      )}
    >
      <label
        htmlFor={finalId}
        className="min-w-0 flex-1 cursor-pointer text-sm font-medium text-neutral-900 dark:text-[var(--app-fg)]"
      >
        <span className="block">{label}</span>
        {description && (
          <span className="mt-0.5 block text-xs text-neutral-500 dark:text-[var(--app-fg-muted)]">
            {description}
          </span>
        )}
      </label>
      <Switch
        id={finalId}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className="shrink-0"
      />
    </div>
  );
}
