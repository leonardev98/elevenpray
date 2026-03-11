"use client";

import { Link } from "@/i18n/navigation";
import { getAllWorkspaceTypes } from "@/app/lib/workspace-type-registry";

export default function AdminHomePage() {
  const categories = getAllWorkspaceTypes();

  return (
    <>
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--app-fg)]">
          Contenido por categoría
        </h1>
        <p className="mt-2 text-[var(--app-fg)]/70 text-lg leading-relaxed">
          Elige una categoría para gestionar enlaces, textos, productos
          destacados y contenido de YouTube que verán los usuarios.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/admin/${cat.id}`}
            className="group flex flex-col rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-sm transition-all duration-200 hover:border-[var(--app-navy)]/40 hover:shadow-lg hover:shadow-[var(--app-navy)]/5 dark:border-[var(--app-border)] dark:bg-[var(--app-surface)]"
          >
            <span className="mb-2 text-xs font-semibold uppercase tracking-widest text-[var(--app-navy)]">
              Categoría
            </span>
            <span className="text-xl font-bold text-[var(--app-fg)] group-hover:text-[var(--app-navy)] dark:group-hover:text-[var(--app-navy)]">
              {cat.label}
            </span>
            <p className="mt-3 text-sm leading-relaxed text-[var(--app-fg)]/60">
              Gestionar contenido curado para workspaces de tipo {cat.label}.
            </p>
            <span className="mt-5 inline-flex items-center text-sm font-semibold text-[var(--app-navy)]">
              Abrir
              <svg
                className="ml-1.5 h-4 w-4 transition group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
