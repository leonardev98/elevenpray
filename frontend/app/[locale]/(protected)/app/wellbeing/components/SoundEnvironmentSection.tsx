"use client";

import { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { SOUND_ENVIRONMENTS } from "../wellbeing-mock-data";

export function SoundEnvironmentSection() {
  const [selectedSound, setSelectedSound] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const toggleSound = (id: string) => {
    if (selectedSound === id) {
      setIsPlaying(!isPlaying);
    } else {
      setSelectedSound(id);
      setIsPlaying(true);
    }
  };

  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <Volume2 className="h-4 w-4 text-[var(--app-primary)]" />
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--app-fg-muted)]">
          Ambientes Sonoros
        </h2>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {SOUND_ENVIRONMENTS.map((env) => (
          <button
            key={env.id}
            type="button"
            onClick={() => toggleSound(env.id)}
            className={`flex flex-col items-center gap-1 rounded-xl p-3 text-center transition-all duration-200 ${
              selectedSound === env.id
                ? "bg-[var(--app-primary)]/20 border-2 border-[var(--app-primary)]"
                : "bg-[var(--app-surface)] border-2 border-transparent hover:border-[var(--app-primary)]/30"
            }`}
          >
            <span className="text-2xl">{env.icon}</span>
            <span className="text-[10px] font-medium text-[var(--app-fg)]">
              {env.name}
            </span>
            {selectedSound === env.id && isPlaying && (
              <div className="flex gap-0.5">
                <span className="h-1 w-0.5 animate-pulse rounded-full bg-[var(--app-primary)]" />
                <span className="h-1 w-0.5 animate-pulse rounded-full bg-[var(--app-primary)] delay-75" />
                <span className="h-1 w-0.5 animate-pulse rounded-full bg-[var(--app-primary)] delay-150" />
              </div>
            )}
          </button>
        ))}
      </div>
      {selectedSound && (
        <div className="mt-3 flex items-center justify-between rounded-xl bg-[var(--app-surface-elevated)] px-4 py-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">
              {SOUND_ENVIRONMENTS.find((e) => e.id === selectedSound)?.icon}
            </span>
            <span className="text-xs font-medium text-[var(--app-fg)]">
              {SOUND_ENVIRONMENTS.find((e) => e.id === selectedSound)?.name}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="rounded-full p-2 transition-all duration-200 hover:bg-[var(--app-surface-soft)]"
          >
            {isPlaying ? (
              <VolumeX className="h-4 w-4 text-[var(--app-fg-muted)]" />
            ) : (
              <Volume2 className="h-4 w-4 text-[var(--app-primary)]" />
            )}
          </button>
        </div>
      )}
    </section>
  );
}
