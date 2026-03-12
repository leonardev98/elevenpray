"use client";

/**
 * Placeholder para la mascota Mitsyy (ratita pelona).
 * Sustituir por el asset final cuando esté disponible.
 */
export function MitsyyPlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={`h-32 w-32 sm:h-40 sm:w-40 ${className ?? ""}`}
      role="img"
      aria-label="Mitsyy, mascota"
    >
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full max-h-40 max-w-40 text-[var(--app-fg)]/80"
      >
        {/* Cuerpo de ratita (óvalo) */}
        <ellipse cx="60" cy="72" rx="32" ry="28" fill="currentColor" opacity="0.2" />
        <ellipse cx="60" cy="70" rx="28" ry="24" fill="currentColor" opacity="0.35" />
        {/* Cabeza */}
        <circle cx="60" cy="42" r="26" fill="currentColor" opacity="0.35" />
        {/* Orejas */}
        <ellipse cx="42" cy="28" rx="10" ry="12" fill="currentColor" opacity="0.4" />
        <ellipse cx="78" cy="28" rx="10" ry="12" fill="currentColor" opacity="0.4" />
        {/* Ojos */}
        <circle cx="52" cy="40" r="4" fill="currentColor" />
        <circle cx="68" cy="40" r="4" fill="currentColor" />
        {/* Pupilas */}
        <circle cx="53" cy="40" r="1.5" fill="var(--app-bg)" />
        <circle cx="69" cy="40" r="1.5" fill="var(--app-bg)" />
        {/* Nariz */}
        <ellipse cx="60" cy="48" rx="4" ry="3" fill="currentColor" />
        {/* Bigotes (ratita) */}
        <path d="M36 46 L24 44" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
        <path d="M36 50 L22 50" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
        <path d="M36 54 L24 56" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
        <path d="M84 46 L96 44" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
        <path d="M84 50 L98 50" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
        <path d="M84 54 L96 56" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
      </svg>
    </div>
  );
}
