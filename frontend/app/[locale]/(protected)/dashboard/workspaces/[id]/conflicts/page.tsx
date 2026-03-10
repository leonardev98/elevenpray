"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "../../../../../../providers/auth-provider";
import { getWorkspaceProducts } from "../../../../../../lib/workspace-products-api";
import {
  checkIngredientConflicts,
  type ConflictResultApi,
} from "../../../../../../lib/ingredient-conflicts-api";

export default function WorkspaceConflictsPage() {
  const params = useParams();
  const workspaceId = params.id as string;
  const { token } = useAuth();
  const [conflicts, setConflicts] = useState<ConflictResultApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ingredientsChecked, setIngredientsChecked] = useState<string[]>([]);

  useEffect(() => {
    if (!token || !workspaceId) return;
    setLoading(true);
    setError("");
    getWorkspaceProducts(token, workspaceId, { status: "active" })
      .then((products) => {
        const allIngredients = new Set<string>();
        for (const p of products) {
          for (const ing of p.mainIngredients ?? []) {
            const name = ing.trim();
            if (name) allIngredients.add(name);
          }
        }
        const list = Array.from(allIngredients);
        setIngredientsChecked(list);
        if (list.length < 2) {
          setConflicts([]);
          return;
        }
        return checkIngredientConflicts(token, list);
      })
      .then((result) => {
        if (Array.isArray(result)) setConflicts(result);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token, workspaceId]);

  const base = `/dashboard/workspaces/${workspaceId}`;

  if (loading) {
    return (
      <div className="py-8 text-center text-[var(--app-fg)]/60">
        Comprobando conflictos de ingredientes…
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-700 dark:text-red-300">
          {error}
        </div>
        <Link
          href={`${base}/products`}
          className="inline-block text-sm font-medium text-[var(--app-gold)] hover:underline"
        >
          ← Volver a Productos
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold text-[var(--app-fg)]">
        Conflictos de ingredientes
      </h1>
      <p className="text-sm text-[var(--app-fg)]/70">
        Se han comprobado los ingredientes de tus productos activos en el workspace.
        {ingredientsChecked.length > 0 && (
          <> Se han analizado {ingredientsChecked.length} ingredientes.</>
        )}
      </p>

      {conflicts.length === 0 ? (
        <section className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 text-center">
          <p className="text-[var(--app-fg)]/80">
            No se han detectado conflictos entre los ingredientes de tus productos activos.
          </p>
          <p className="mt-2 text-sm text-[var(--app-fg)]/60">
            Añade ingredientes a tus productos en Mis productos para que el análisis sea más preciso.
          </p>
          <Link
            href={`${base}/products`}
            className="mt-4 inline-block text-sm font-medium text-[var(--app-gold)] hover:underline"
          >
            Ir a Mis productos →
          </Link>
        </section>
      ) : (
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--app-fg)]/70">
            Conflictos detectados
          </h2>
          <ul className="space-y-3">
            {conflicts.map((c, i) => (
              <li
                key={`${c.ingredientA}-${c.ingredientB}-${i}`}
                className={`rounded-xl border p-4 ${
                  c.severity === "danger"
                    ? "border-red-500/40 bg-red-500/10"
                    : "border-amber-500/40 bg-amber-500/10"
                }`}
              >
                <p className="font-medium text-[var(--app-fg)]">
                  {c.ingredientA} + {c.ingredientB}
                </p>
                <p className="mt-1 text-sm text-[var(--app-fg)]/80">{c.message}</p>
                <span
                  className={`mt-2 inline-block rounded px-2 py-0.5 text-xs font-medium ${
                    c.severity === "danger"
                      ? "bg-red-500/20 text-red-700 dark:text-red-300"
                      : "bg-amber-500/20 text-amber-700 dark:text-amber-300"
                  }`}
                >
                  {c.severity === "danger" ? "Riesgo" : "Precaución"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Link
        href={`${base}/products`}
        className="inline-block text-sm font-medium text-[var(--app-gold)] hover:underline"
      >
        ← Volver a Productos
      </Link>
    </div>
  );
}
