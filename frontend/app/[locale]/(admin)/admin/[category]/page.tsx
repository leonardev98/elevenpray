"use client";

import { useParams } from "next/navigation";
import { Link as I18nLink } from "@/i18n/navigation";
import { getWorkspaceType } from "@/app/lib/workspace-type-registry";

const MOCK_SECTIONS = [
  {
    id: "links",
    title: "Enlaces",
    description: "Añade enlaces a artículos, guías o recursos externos.",
    icon: "🔗",
    placeholder: "Ej: https://ejemplo.com/guia-rutina",
  },
  {
    id: "text",
    title: "Texto / Entradas",
    description: "Pega textos o entradas que aparecerán en el feed de la categoría.",
    icon: "📝",
    placeholder: "Pegar contenido aquí…",
  },
  {
    id: "products",
    title: "Productos destacados",
    description: "Productos top o recomendados para esta categoría.",
    icon: "⭐",
    placeholder: "Nombre del producto, marca, enlace…",
  },
  {
    id: "youtube",
    title: "YouTube",
    description: "Vídeos o listas de reproducción de YouTube.",
    icon: "▶️",
    placeholder: "URL del vídeo o playlist",
  },
] as const;

export default function AdminCategoryPage() {
  const params = useParams();
  const categoryId = typeof params?.category === "string" ? params.category : "";
  const category = getWorkspaceType(categoryId);

  if (!category) {
    return (
      <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] p-8 text-center">
        <p className="text-[var(--app-fg)]/70">Categoría no encontrada.</p>
        <I18nLink
          href="/admin"
          className="mt-4 inline-block text-[var(--app-gold)] hover:underline"
        >
          Volver a categorías
        </I18nLink>
      </div>
    );
  }

  return (
    <>
      <div className="mb-10 flex items-center gap-4">
        <I18nLink
          href="/admin"
          className="rounded-xl p-2.5 text-[var(--app-fg)]/70 transition hover:bg-[var(--app-surface-soft)] hover:text-[var(--app-fg)]"
          aria-label="Volver"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </I18nLink>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--app-fg)]">
            {category.label}
          </h1>
          <p className="mt-1 text-[var(--app-fg)]/60">
            Gestionar contenido curado (mock). Se conectará al backend después.
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {MOCK_SECTIONS.map((section) => (
          <section
            key={section.id}
            className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-sm transition dark:border-[var(--app-border)] dark:bg-[var(--app-surface)]"
          >
            <div className="mb-5 flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--app-navy)]/10 text-2xl dark:bg-[var(--app-gold)]/10" aria-hidden>
                {section.icon}
              </span>
              <div>
                <h2 className="text-xl font-bold text-[var(--app-fg)]">
                  {section.title}
                </h2>
                <p className="mt-0.5 text-sm leading-relaxed text-[var(--app-fg)]/60">
                  {section.description}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <textarea
                readOnly
                placeholder={section.placeholder}
                className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-3 text-sm text-[var(--app-fg)] placeholder:text-[var(--app-fg)]/40 focus:border-[var(--app-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--app-gold)]/20 dark:bg-[var(--app-surface-soft)]"
                rows={2}
              />
              <button
                type="button"
                className="rounded-xl bg-[var(--app-navy)] px-5 py-2.5 text-sm font-semibold text-[var(--app-white)] transition hover:opacity-90 disabled:opacity-50"
              >
                Añadir (mock)
              </button>
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
