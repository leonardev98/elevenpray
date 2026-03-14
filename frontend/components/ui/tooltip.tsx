"use client";

import * as React from "react";
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";
import { cn } from "@/lib/utils";

const TooltipProvider = TooltipPrimitive.Provider;

const TooltipRoot = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipPortal = TooltipPrimitive.Portal;

const TooltipPositioner = React.forwardRef<
  React.ComponentRef<typeof TooltipPrimitive.Positioner>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Positioner>
>(({ side = "top", sideOffset = 6, ...props }, ref) => (
  <TooltipPrimitive.Positioner
    ref={ref}
    side={side}
    sideOffset={sideOffset}
    {...props}
  />
));
TooltipPositioner.displayName = "TooltipPositioner";

const TooltipPopup = React.forwardRef<
  React.ComponentRef<typeof TooltipPrimitive.Popup>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Popup>
>(({ className, ...props }, ref) => (
  <TooltipPrimitive.Popup
    ref={ref}
    className={cn(
      "z-50 max-w-[min(var(--available-width),20rem)] rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-xs text-[var(--app-fg)] outline-none",
      "data-[closed]:pointer-events-none data-[closed]:opacity-0 data-[entering]:animate-in data-[entering]:fade-in-0 data-[entering]:zoom-in-95 data-[exiting]:animate-out data-[exiting]:fade-out-0 data-[exiting]:zoom-out-95",
      className
    )}
    {...props}
  />
));
TooltipPopup.displayName = "TooltipPopup";

export function Tooltip({
  delay = 400,
  children,
}: {
  delay?: number;
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider delay={delay}>
      {children}
    </TooltipProvider>
  );
}

Tooltip.Trigger = TooltipTrigger;
Tooltip.Portal = TooltipPortal;
Tooltip.Positioner = TooltipPositioner;
Tooltip.Popup = TooltipPopup;
Tooltip.Root = TooltipRoot;
