"use client";

import type { RoutineConflictReport } from "@/app/lib/routine-builder";

interface ConflictWarningsProps {
  report: RoutineConflictReport;
}

export function ConflictWarnings({ report }: ConflictWarningsProps) {
  const hasWarnings = report.warnings.length > 0 || report.ingredientConflicts.length > 0;
  if (!hasWarnings) return null;

  return (
    <section className="rounded-2xl border border-amber-300/40 bg-amber-50/70 p-4 text-amber-900">
      <h3 className="text-sm font-semibold">Routine safety checks</h3>
      <ul className="mt-2 space-y-1 text-xs">
        {report.warnings.map((warning) => (
          <li key={warning.id}>- {warning.message}</li>
        ))}
        {report.ingredientConflicts.map((conflict, index) => (
          <li key={`${conflict.ingredientA}-${conflict.ingredientB}-${index}`}>
            - {conflict.message}
          </li>
        ))}
      </ul>
    </section>
  );
}
