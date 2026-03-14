"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface SettingsSelectOption {
  value: string;
  label: string;
}

interface SettingsSelectProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: SettingsSelectOption[];
  placeholder?: string;
  id?: string;
  className?: string;
}

export function SettingsSelect({
  label,
  value,
  onValueChange,
  options,
  placeholder,
  id: idProp,
  className,
}: SettingsSelectProps) {
  const id = React.useId();
  const finalId = idProp ?? id;

  return (
    <div
      className={cn(
        "flex flex-col gap-1 rounded-lg px-4 py-3 transition-colors hover:bg-[var(--app-bg)]/50 sm:flex-row sm:items-center sm:justify-between sm:gap-4",
        className
      )}
    >
      <label
        htmlFor={finalId}
        className="min-w-0 flex-1 text-sm font-medium text-[var(--app-fg)]"
      >
        {label}
      </label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger id={finalId} className="w-full min-w-[140px] sm:w-auto">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
