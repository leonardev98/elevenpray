"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useFilter } from "react-aria";
import {
  Button,
  ComboBox,
  Group,
  Input,
  Label,
  ListBox,
  ListBoxItem,
  Popover,
} from "react-aria-components";
import { ChevronDown, PlusCircle } from "lucide-react";
import type { Key } from "react-aria-components";
import { cn } from "@/lib/utils";
import {
  STUDENT_ONBOARDING_OTHER_FILTER_SENTINEL,
  STUDENT_ONBOARDING_OTHER_ID,
  type StudentOnboardingOption,
} from "@/data/peru-student-onboarding";

type ComboOption = StudentOnboardingOption | { id: string; label: string; textValue: string; shortName?: string };

function resolveValueToSelection(
  value: string,
  options: StudentOnboardingOption[],
  otherItemLabel: string,
): {
  selectedKey: Key | null;
  inputValue: string;
  otherDetail: string;
} {
  const trimmed = value.trim();
  if (!trimmed) {
    return { selectedKey: null, inputValue: "", otherDetail: "" };
  }

  const match = options.find((o) => o.label.toLowerCase() === trimmed.toLowerCase());
  if (match) {
    return { selectedKey: match.id, inputValue: match.label, otherDetail: "" };
  }

  return {
    selectedKey: STUDENT_ONBOARDING_OTHER_ID,
    inputValue: otherItemLabel,
    otherDetail: trimmed,
  };
}

export function StudentSearchableField({
  id,
  label,
  options,
  otherItemLabel,
  otherInputPlaceholder,
  inputPlaceholder,
  defaultValue = "",
  onValueChange,
  isInvalid,
  errorMessage,
  hint,
  disabled = false,
  disabledPlaceholder,
  icon,
}: {
  id: string;
  label: string;
  options: StudentOnboardingOption[];
  otherItemLabel: string;
  otherInputPlaceholder: string;
  inputPlaceholder: string;
  /** Valor guardado en perfil (nombre de universidad/carrera). */
  defaultValue?: string;
  onValueChange: (value: string) => void;
  isInvalid?: boolean;
  errorMessage?: string;
  /** Texto auxiliar bajo el campo (p. ej. dependencia universidad → carrera). */
  hint?: string;
  disabled?: boolean;
  /** Placeholder cuando el campo está deshabilitado. */
  disabledPlaceholder?: string;
  icon?: ReactNode;
}) {
  const { contains } = useFilter({ sensitivity: "base" });
  const initial = useMemo(
    () => resolveValueToSelection(defaultValue, options, otherItemLabel),
    [],
  );

  const [inputValue, setInputValue] = useState(initial.inputValue);
  const [selectedKey, setSelectedKey] = useState<Key | null>(initial.selectedKey);
  const [otherDetail, setOtherDetail] = useState(initial.otherDetail);
  const otherInputRef = useRef<HTMLInputElement>(null);
  const isOtherModeRef = useRef(false);
  const onValueChangeRef = useRef(onValueChange);
  const hydratedDefaultRef = useRef(defaultValue.trim());

  useEffect(() => {
    onValueChangeRef.current = onValueChange;
  }, [onValueChange]);

  useEffect(() => {
    isOtherModeRef.current = selectedKey === STUDENT_ONBOARDING_OTHER_ID;
  }, [selectedKey]);

  // Sincroniza cuando el padre carga el perfil (p. ej. tras /auth/me).
  useEffect(() => {
    const trimmed = defaultValue.trim();
    if (!trimmed || trimmed === hydratedDefaultRef.current) return;
    hydratedDefaultRef.current = trimmed;
    const next = resolveValueToSelection(trimmed, options, otherItemLabel);
    setSelectedKey(next.selectedKey);
    setInputValue(next.inputValue);
    setOtherDetail(next.otherDetail);
  }, [defaultValue, options, otherItemLabel]);

  const items: ComboOption[] = useMemo(
    () => [
      ...options,
      {
        id: STUDENT_ONBOARDING_OTHER_ID,
        label: otherItemLabel,
        textValue: `${otherItemLabel} ${STUDENT_ONBOARDING_OTHER_FILTER_SENTINEL}`,
      },
    ],
    [options, otherItemLabel],
  );

  const resolved = useMemo(() => {
    if (selectedKey === STUDENT_ONBOARDING_OTHER_ID) {
      return otherDetail.trim();
    }
    if (selectedKey != null) {
      const o = options.find((x) => x.id === selectedKey);
      if (o) return o.label.trim();
    }
    return inputValue.trim();
  }, [selectedKey, otherDetail, inputValue, options]);

  useEffect(() => {
    if (disabled) {
      onValueChangeRef.current("");
      return;
    }
    onValueChangeRef.current(resolved);
  }, [resolved, disabled]);

  const showOtherField = selectedKey === STUDENT_ONBOARDING_OTHER_ID && !disabled;
  const showError = Boolean(isInvalid && errorMessage);

  const listBoxItemClass = ({ isFocused, isSelected }: { isFocused?: boolean; isSelected?: boolean }) =>
    cn(
      "flex cursor-pointer items-center justify-between gap-3 px-3 py-2.5 text-sm outline-none transition-colors",
      isFocused && "bg-[var(--app-primary-soft)] text-[var(--app-fg)]",
      isSelected && !isFocused && "bg-[var(--app-primary)]/10 font-medium text-[var(--app-fg)]",
    );

  return (
    <div className="relative">
      <ComboBox
        allowsCustomValue
        menuTrigger="focus"
        isDisabled={disabled}
        inputValue={disabled ? "" : inputValue}
        onInputChange={disabled ? undefined : setInputValue}
        selectedKey={disabled ? null : selectedKey}
        defaultFilter={(textValue, iv) => {
          if (textValue.includes(STUDENT_ONBOARDING_OTHER_FILTER_SENTINEL)) return true;
          return contains(textValue, iv);
        }}
        onSelectionChange={(key) => {
          // Al enfocar el input "otra universidad/carrera", el ComboBox hace blur y
          // emite key=null; no debemos salir del modo "otra" en ese caso.
          if (key == null) {
            if (isOtherModeRef.current) return;
            setSelectedKey(null);
            setOtherDetail("");
            return;
          }

          setSelectedKey(key);
          if (key !== STUDENT_ONBOARDING_OTHER_ID) {
            setOtherDetail("");
          }
          if (key !== STUDENT_ONBOARDING_OTHER_ID) {
            const o = options.find((x) => x.id === key);
            if (o) setInputValue(o.label);
          } else {
            isOtherModeRef.current = true;
            setInputValue(otherItemLabel);
            requestAnimationFrame(() => otherInputRef.current?.focus());
          }
        }}
        className="flex flex-col gap-1.5"
      >
        <Label htmlFor={id} className="block text-sm font-medium text-[var(--app-fg)]">
          {label}
        </Label>
        {hint && (
          <p className="text-xs text-[var(--app-fg-secondary)]" id={`${id}-hint`}>
            {hint}
          </p>
        )}
        <Group
          className={cn(
            "flex w-full min-w-0 items-stretch gap-0 overflow-hidden rounded-xl border bg-[var(--app-surface)] shadow-sm transition-colors",
            disabled && "cursor-not-allowed opacity-60",
            isInvalid
              ? "border-red-500/60 has-[[data-focused]]:ring-2 has-[[data-focused]]:ring-red-500/20"
              : "border-[var(--app-border)] has-[[data-focused]]:border-[var(--app-primary)]/50 has-[[data-focused]]:ring-2 has-[[data-focused]]:ring-[var(--app-primary)]/20",
          )}
        >
          {icon && (
            <div className="flex shrink-0 items-center justify-center pl-3 text-[var(--app-fg-muted)]">
              {icon}
            </div>
          )}
          <Input
            id={id}
            placeholder={disabled ? (disabledPlaceholder ?? inputPlaceholder) : inputPlaceholder}
            aria-describedby={hint ? `${id}-hint` : undefined}
            readOnly={showOtherField}
            className={cn(
              "w-full min-w-0 flex-1 border-0 bg-transparent px-3 py-3 text-[var(--app-fg)] placeholder:text-[var(--app-fg-muted)] outline-none ring-0 focus:ring-0",
              icon && "pl-2",
            )}
          />
          <Button className="flex shrink-0 items-center justify-center border-l border-[var(--app-border)] bg-[var(--app-surface-soft)] px-3 text-[var(--app-fg-muted)] outline-none transition-colors pressed:bg-[var(--app-primary-soft)] hover:text-[var(--app-fg)]">
            <ChevronDown className="size-4" aria-hidden />
          </Button>
        </Group>
        <Popover
          placement="bottom start"
          offset={6}
          shouldFlip={false}
          className="entering:animate-in entering:fade-in-0 entering:zoom-in-95 exiting:animate-out exiting:fade-out-0 exiting:zoom-out-95 z-50 min-w-[var(--trigger-width)] max-w-[var(--trigger-width)]"
        >
          <ListBox
            items={items}
            className="max-h-60 overflow-y-auto overscroll-contain rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] py-1 shadow-lg outline-none sm:max-h-72"
          >
            {(item) => {
              const isOther = item.id === STUDENT_ONBOARDING_OTHER_ID;
              return (
                <ListBoxItem
                  id={item.id}
                  textValue={item.textValue}
                  className={({ isFocused, isSelected }) => listBoxItemClass({ isFocused, isSelected })}
                >
                  {isOther ? (
                    <span className="flex items-center gap-2 text-[var(--app-primary)]">
                      <PlusCircle className="size-4" aria-hidden />
                      <span>{item.label}</span>
                    </span>
                  ) : (
                    <>
                      <span className="truncate">{item.label}</span>
                      {"shortName" in item && item.shortName && (
                        <span className="ml-2 shrink-0 rounded-md border border-[var(--app-border)] bg-[var(--app-surface-soft)] px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-[var(--app-fg-secondary)]">
                          {item.shortName}
                        </span>
                      )}
                    </>
                  )}
                </ListBoxItem>
              );
            }}
          </ListBox>
        </Popover>
      </ComboBox>

      <div
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-200 ease-out",
          showOtherField ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <label htmlFor={`${id}-other`} className="sr-only">
            {otherInputPlaceholder}
          </label>
          <input
            ref={otherInputRef}
            id={`${id}-other`}
            type="text"
            value={otherDetail}
            onChange={(e) => setOtherDetail(e.target.value)}
            onMouseDown={(e) => {
              // Evita que el blur del ComboBox dispare selectionChange(null) antes del focus.
              e.preventDefault();
            }}
            maxLength={120}
            placeholder={otherInputPlaceholder}
            className={cn(
              "mt-2 w-full rounded-xl border bg-[var(--app-surface)] px-4 py-3 text-[var(--app-fg)] placeholder:text-[var(--app-fg-muted)] outline-none transition-colors",
              isInvalid
                ? "border-red-500/60 focus:border-red-500/70 focus:ring-2 focus:ring-red-500/20"
                : "border-[var(--app-border)] focus:border-[var(--app-primary)]/50 focus:ring-2 focus:ring-[var(--app-primary)]/20",
              !showOtherField && "pointer-events-none",
            )}
            tabIndex={showOtherField ? 0 : -1}
            aria-hidden={!showOtherField}
          />
        </div>
      </div>

      {showError && (
        <p className="mt-1.5 text-xs font-medium text-red-500" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
