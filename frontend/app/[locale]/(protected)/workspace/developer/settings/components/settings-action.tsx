"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SettingsActionProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: "outline" | "ghost" | "link";
  className?: string;
}

export function SettingsAction({
  label,
  onClick,
  disabled = false,
  variant = "outline",
  className,
}: SettingsActionProps) {
  return (
    <Button
      type="button"
      variant={variant}
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className={cn("shrink-0", className)}
    >
      {label}
    </Button>
  );
}
