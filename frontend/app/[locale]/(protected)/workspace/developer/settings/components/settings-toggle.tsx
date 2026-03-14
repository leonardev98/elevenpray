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
        "flex flex-col gap-1 rounded-lg px-4 py-3 transition-colors sm:flex-row sm:items-center sm:justify-between sm:gap-4 hover:bg-[var(--app-bg)]/50",
        className
      )}
    >
      <label
        htmlFor={finalId}
        className="min-w-0 flex-1 cursor-pointer text-sm font-medium text-[var(--app-fg)]"
      >
        <span className="block">{label}</span>
        {description && (
          <span className="mt-0.5 block text-xs text-[var(--app-fg)]/60">
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
