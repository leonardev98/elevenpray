"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "../../../../../../providers/auth-provider";
import { getWorkspaceProducts } from "../../../../../../lib/workspace-products-api";
import type { WorkspaceProductApi } from "../../../../../../lib/workspace-products-api";

function aggregateIngredients(products: WorkspaceProductApi[]): {
  byKey: Map<string, string[]>;
  displayNames: string[];
} {
  const byKey = new Map<string, string[]>();
  const seenKeys = new Set<string>();
  const displayNames: string[] = [];
  for (const p of products) {
    const ingredients = p.mainIngredients ?? [];
    for (const raw of ingredients) {
      const name = raw.trim();
      const key = name.toLowerCase();
      if (!key) continue;
      const existing = byKey.get(key) ?? [];
      if (!existing.includes(p.name)) {
        existing.push(p.name);
        byKey.set(key, existing);
      }
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        displayNames.push(name);
      }
    }
  }
  displayNames.sort((a, b) => a.localeCompare(b, "es"));
  return { byKey, displayNames };
}

export default function WorkspaceInsightsPage() {
  const params = useParams();
  const workspaceId = params.id as string;
  const { token } = useAuth();
  const [products, setProducts] = useState<WorkspaceProductApi[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !workspaceId) return;
    getWorkspaceProducts(token, workspaceId)
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [token, workspaceId]);

  const { byKey: ingredientToProducts, displayNames: uniqueNames } =
    aggregateIngredients(products);

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold tracking-normal text-[var(--app-fg)]">
        Insights
      </h2>

      <section className="mb-8">
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-[var(--app-fg)]/70">
          Ingredientes en tus productos
        </h3>
        <p className="mb-3 text-sm text-[var(--app-fg)]/60">
          Activos que aparecen en tu inventario. Útil para evitar duplicados o combinar con cuidado.
        </p>
        {loading ? (
          <p className="text-sm text-[var(--app-fg)]/60">Cargando…</p>
        ) : uniqueNames.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[var(--app-border)] py-6 text-center text-sm text-[var(--app-fg)]/60">
            Añade ingredientes principales en tus productos para verlos aquí.
          </p>
        ) : (
          <ul className="space-y-2">
            {uniqueNames.map((name) => {
              const productList = ingredientToProducts.get(name.toLowerCase()) ?? [];
              return (
                <li
                  key={name}
                  className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-3"
                >
                  <p className="font-medium text-[var(--app-fg)]">{name}</p>
                  <p className="mt-0.5 text-xs text-[var(--app-fg)]/60">
                    En: {productList.join(", ")}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <p className="rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)]/60 px-3 py-2 text-xs text-[var(--app-fg)]/70">
        Introduce un nuevo activo a la vez y haz patch test cuando sea posible. Esto no es consejo médico.
      </p>

      <p className="mt-4">
        <Link
          href={`/dashboard/workspaces/${workspaceId}`}
          className="text-sm text-[var(--app-navy)] hover:underline"
        >
          Volver al overview
        </Link>
      </p>
    </div>
  );
}
