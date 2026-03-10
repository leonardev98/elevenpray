"use client";

interface AutoBuildRoutineDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMode: (mode: "scratch" | "smart-starter" | "skin-cycling" | "product-first") => void;
}

const OPTIONS: Array<{ id: "scratch" | "smart-starter" | "skin-cycling" | "product-first"; title: string; body: string }> = [
  {
    id: "scratch",
    title: "Build from scratch",
    body: "Start with AM and PM structure, then customize each step manually.",
  },
  {
    id: "smart-starter",
    title: "Smart starter routine",
    body: "Generate a dermatologist-inspired base adapted to your profile.",
  },
  {
    id: "skin-cycling",
    title: "Skin cycling template",
    body: "Balance exfoliation, retinoid and recovery nights across the week.",
  },
  {
    id: "product-first",
    title: "Product-first builder",
    body: "Organize your current products into a coherent weekly flow.",
  },
];

export function AutoBuildRoutineDialog({ isOpen, onClose, onSelectMode }: AutoBuildRoutineDialogProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-3xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[var(--app-fg)]">Auto-build routine</h3>
          <button type="button" onClick={onClose} className="rounded-lg px-2 py-1 text-sm text-[var(--app-fg)]/55 hover:bg-[var(--app-bg)]">
            Close
          </button>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelectMode(option.id)}
              className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg)] p-4 text-left transition hover:border-[var(--app-gold)]/50 hover:bg-[var(--app-gold)]/5"
            >
              <p className="text-sm font-semibold text-[var(--app-fg)]">{option.title}</p>
              <p className="mt-1 text-xs text-[var(--app-fg)]/65">{option.body}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
