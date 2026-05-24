"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import { ChevronDown } from "lucide-react";
import type { Key } from "react-aria-components";
import { cn } from "@/lib/utils";
import {
  STUDENT_ONBOARDING_OTHER_FILTER_SENTINEL,
  STUDENT_ONBOARDING_OTHER_ID,
  type StudentOnboardingOption,
} from "@/data/peru-student-onboarding";

type ComboOption = StudentOnboardingOption | { id: string; label: string; textValue: string };

export function StudentSearchableField({
  id,
  label,
  options,
  otherItemLabel,
  otherInputPlaceholder,
  inputPlaceholder,
  onValueChange,
  isInvalid,
}: {
  id: string;
  label: string;
  options: StudentOnboardingOption[];
  otherItemLabel: string;
  otherInputPlaceholder: string;
  inputPlaceholder: string;
  onValueChange: (value: string) => void;
  isInvalid?: boolean;
}) {
  const { contains } = useFilter({ sensitivity: "base" });
  const [inputValue, setInputValue] = useState("");
  const [selectedKey, setSelectedKey] = useState<Key | null>(null);
  const [otherDetail, setOtherDetail] = useState("");
  const onValueChangeRef = useRef(onValueChange);
  useEffect(() => {
    onValueChangeRef.current = onValueChange;
  }, [onValueChange]);

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
    onValueChangeRef.current(resolved);
  }, [resolved]);

  const showOtherField = selectedKey === STUDENT_ONBOARDING_OTHER_ID;
  const inputClass = cn(
    "w-full min-w-0 flex-1 rounded-xl border bg-[var(--app-surface)] px-4 py-3 text-[var(--app-fg)] placeholder:text-[var(--app-fg-muted)] outline-none transition-colors",
    isInvalid
      ? "border-red-500/60 focus:border-red-500/70 focus:ring-2 focus:ring-red-500/20"
      : "border-[var(--app-border)] focus:border-[var(--app-primary)]/50 focus:ring-2 focus:ring-[var(--app-primary)]/20",
  );

  const listBoxItemClass = ({ isFocused, isSelected }: { isFocused?: boolean; isSelected?: boolean }) =>
    cn(
      "cursor-pointer px-3 py-2.5 text-sm outline-none transition-colors",
      isFocused && "bg-[var(--app-primary-soft)] text-[var(--app-fg)]",
      isSelected && !isFocused && "bg-[var(--app-primary)]/10 font-medium text-[var(--app-fg)]",
    );

  return (
    <div>
      <ComboBox
        allowsCustomValue
        menuTrigger="focus"
        inputValue={inputValue}
        onInputChange={setInputValue}
        selectedKey={selectedKey}
        defaultFilter={(textValue, iv) => {
          if (textValue.includes(STUDENT_ONBOARDING_OTHER_FILTER_SENTINEL)) return true;
          return contains(textValue, iv);
        }}
        onSelectionChange={(key) => {
          setSelectedKey(key);
          if (key !== STUDENT_ONBOARDING_OTHER_ID) {
            setOtherDetail("");
          }
          if (key != null && key !== STUDENT_ONBOARDING_OTHER_ID) {
            const o = options.find((x) => x.id === key);
            if (o) setInputValue(o.label);
          } else if (key === STUDENT_ONBOARDING_OTHER_ID) {
            setInputValue(otherItemLabel);
          }
        }}
        className="flex flex-col gap-1.5"
      >
        <Label htmlFor={id} className="block text-sm font-medium text-[var(--app-fg)]">
          {label}
        </Label>
        <Group
          className={cn(
            "flex w-full min-w-0 items-stretch gap-0 overflow-hidden rounded-xl border shadow-sm transition-colors",
            isInvalid
              ? "border-red-500/60 ring-red-500/10 has-[[data-focused]]:ring-2 has-[[data-focused]]:ring-red-500/20"
              : "border-[var(--app-border)] has-[[data-focused]]:border-[var(--app-primary)]/50 has-[[data-focused]]:ring-2 has-[[data-focused]]:ring-[var(--app-primary)]/20",
          )}
        >
          <Input
            id={id}
            placeholder={inputPlaceholder}
            className={cn(inputClass, "rounded-r-none border-0 bg-transparent py-3 ring-0 focus:ring-0")}
          />
          <Button className="flex shrink-0 items-center justify-center border-l border-[var(--app-border)] bg-[var(--app-surface)] px-3 text-[var(--app-fg-muted)] pressed:bg-[var(--app-primary-soft)] outline-none transition-colors">
            <ChevronDown className="size-4" aria-hidden />
          </Button>
        </Group>
        <Popover className="entering:animate-in entering:fade-in-0 entering:zoom-in-95 exiting:animate-out exiting:fade-out-0 exiting:zoom-out-95 min-w-[var(--trigger-width)] max-w-[var(--trigger-width)]">
          <ListBox
            items={items}
            className="max-h-60 overflow-y-auto rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] py-1 shadow-lg outline-none"
          >
            {(item) => (
              <ListBoxItem
                id={item.id}
                textValue={item.textValue}
                className={({ isFocused, isSelected }) => listBoxItemClass({ isFocused, isSelected })}
              >
                {item.label}
              </ListBoxItem>
            )}
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
            id={`${id}-other`}
            type="text"
            value={otherDetail}
            onChange={(e) => setOtherDetail(e.target.value)}
            maxLength={120}
            placeholder={otherInputPlaceholder}
            className={cn(inputClass, "mt-2", !showOtherField && "pointer-events-none")}
            tabIndex={showOtherField ? 0 : -1}
            aria-hidden={!showOtherField}
          />
        </div>
      </div>
    </div>
  );
}
