"use client";

import { WellbeingBlockLabel } from "./WellbeingBlockLabel";

export function WellbeingSectionLabel({ children }: { children: string }) {
  return (
    <div className="col-span-1 md:col-span-2 lg:col-span-4">
      <WellbeingBlockLabel>{children}</WellbeingBlockLabel>
    </div>
  );
}
