"use client";

import { Eye, EyeOff } from "lucide-react";

type PasswordFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  showPassword: boolean;
  onToggleVisibility: () => void;
  showPasswordLabel: string;
  hidePasswordLabel: string;
  required?: boolean;
  autoComplete?: string;
  placeholder?: string;
  minLength?: number;
};

const inputClassName =
  "w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)]/70 py-2.5 pl-3.5 pr-11 text-[var(--app-fg)] placeholder:text-[var(--app-fg)]/40 transition focus:border-[var(--app-navy)] focus:bg-[var(--app-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--app-navy)]/25 min-h-[48px]";

export function PasswordField({
  id,
  label,
  value,
  onChange,
  showPassword,
  onToggleVisibility,
  showPasswordLabel,
  hidePasswordLabel,
  required = true,
  autoComplete,
  placeholder,
  minLength,
}: PasswordFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-[var(--app-fg)]/90">
        {label}
      </label>
      <div className="relative mt-1.5">
        <input
          id={id}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          autoComplete={autoComplete}
          placeholder={placeholder}
          minLength={minLength}
          className={inputClassName}
        />
        <button
          type="button"
          onClick={onToggleVisibility}
          className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-[var(--app-fg)]/50 transition hover:bg-[var(--app-navy)]/5 hover:text-[var(--app-fg)]/80 focus:outline-none focus:ring-2 focus:ring-[var(--app-navy)]/30"
          aria-label={showPassword ? hidePasswordLabel : showPasswordLabel}
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5" strokeWidth={2} aria-hidden />
          ) : (
            <Eye className="h-5 w-5" strokeWidth={2} aria-hidden />
          )}
        </button>
      </div>
    </div>
  );
}
