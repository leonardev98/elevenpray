"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "../../../../../../providers/auth-provider";
import {
  getWorkspaceProducts,
  createWorkspaceProduct,
  updateWorkspaceProduct,
  deleteWorkspaceProduct,
  type WorkspaceProductApi,
  type CreateWorkspaceProductDto,
  type ProductStatus,
  type ProductCategory,
  PRODUCT_CATEGORY_LABELS,
  PRODUCT_STATUS_LABELS,
  USAGE_TIME_LABELS,
} from "../../../../../../lib/workspace-products-api";

const CATEGORIES = Object.keys(PRODUCT_CATEGORY_LABELS) as ProductCategory[];
const STATUSES = Object.keys(PRODUCT_STATUS_LABELS) as ProductStatus[];

function ProductForm({
  workspaceId,
  product,
  onSave,
  onCancel,
}: {
  workspaceId: string;
  product: WorkspaceProductApi | null;
  onSave: () => void;
  onCancel: () => void;
}) {
  const { token } = useAuth();
  const [name, setName] = useState(product?.name ?? "");
  const [brand, setBrand] = useState(product?.brand ?? "");
  const [category, setCategory] = useState<ProductCategory>(product?.category ?? "serum");
  const [status, setStatus] = useState<ProductStatus>(product?.status ?? "active");
  const [usageTime, setUsageTime] = useState<string>(product?.usageTime ?? "");
  const [mainIngredients, setMainIngredients] = useState(
    product?.mainIngredients?.join(", ") ?? ""
  );
  const [notes, setNotes] = useState(product?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setError("");
    try {
      const ingredients = mainIngredients
        .split(/[,;]/)
        .map((s) => s.trim())
        .filter(Boolean);
      const dto: CreateWorkspaceProductDto = {
        name: name.trim() || "Sin nombre",
        brand: brand.trim() || null,
        category,
        status,
        usageTime: usageTime === "" ? null : (usageTime as "am" | "pm" | "both"),
        mainIngredients: ingredients.length ? ingredients : null,
        notes: notes.trim() || null,
      };
      if (product) {
        await updateWorkspaceProduct(token, workspaceId, product.id, dto);
      } else {
        await createWorkspaceProduct(token, workspaceId, dto);
      }
      onSave();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      <div>
        <label className="mb-1 block text-xs font-medium text-[var(--app-fg)]/70">Nombre *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-sm text-[var(--app-fg)] focus:border-[var(--app-gold)] focus:outline-none focus:ring-1 focus:ring-[var(--app-gold)]"
          placeholder="Ej. Vit C serum"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-[var(--app-fg)]/70">Marca</label>
        <input
          type="text"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-sm text-[var(--app-fg)] focus:border-[var(--app-gold)] focus:outline-none focus:ring-1 focus:ring-[var(--app-gold)]"
          placeholder="Ej. The Ordinary"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--app-fg)]/70">Categoría</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ProductCategory)}
            className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-sm text-[var(--app-fg)] focus:border-[var(--app-gold)] focus:outline-none focus:ring-1 focus:ring-[var(--app-gold)]"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {PRODUCT_CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--app-fg)]/70">Estado</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ProductStatus)}
            className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-sm text-[var(--app-fg)] focus:border-[var(--app-gold)] focus:outline-none focus:ring-1 focus:ring-[var(--app-gold)]"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {PRODUCT_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-[var(--app-fg)]/70">
          Ingredientes principales (separados por coma)
        </label>
        <input
          type="text"
          value={mainIngredients}
          onChange={(e) => setMainIngredients(e.target.value)}
          placeholder="Ej. Niacinamide, Zinc, Vit C"
          className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-sm text-[var(--app-fg)] placeholder:text-[var(--app-fg)]/50 focus:border-[var(--app-gold)] focus:outline-none focus:ring-1 focus:ring-[var(--app-gold)]"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-[var(--app-fg)]/70">Uso</label>
        <select
          value={usageTime}
          onChange={(e) => setUsageTime(e.target.value)}
          className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-sm text-[var(--app-fg)] focus:border-[var(--app-gold)] focus:outline-none focus:ring-1 focus:ring-[var(--app-gold)]"
        >
          <option value="">—</option>
          <option value="am">{USAGE_TIME_LABELS.am}</option>
          <option value="pm">{USAGE_TIME_LABELS.pm}</option>
          <option value="both">{USAGE_TIME_LABELS.both}</option>
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-[var(--app-fg)]/70">Notas</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-sm text-[var(--app-fg)] focus:border-[var(--app-gold)] focus:outline-none focus:ring-1 focus:ring-[var(--app-gold)]"
          placeholder="Reacciones, observaciones…"
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-[var(--app-border)] px-4 py-2 text-sm text-[var(--app-fg)] hover:bg-[var(--app-bg)]"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-[var(--app-gold)] px-4 py-2 text-sm font-medium text-[var(--app-black)] hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Guardando…" : product ? "Guardar" : "Crear"}
        </button>
      </div>
    </form>
  );
}

export default function WorkspaceProductsPage() {
  const params = useParams();
  const workspaceId = params.id as string;
  const { token } = useAuth();
  const [products, setProducts] = useState<WorkspaceProductApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<WorkspaceProductApi | null>(null);

  function loadProducts() {
    if (!token || !workspaceId) return;
    setLoading(true);
    getWorkspaceProducts(token, workspaceId, {
      status: filterStatus ? (filterStatus as ProductStatus) : undefined,
      category: filterCategory || undefined,
    })
      .then(setProducts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadProducts();
  }, [token, workspaceId, filterStatus, filterCategory]);

  async function handleDelete(p: WorkspaceProductApi) {
    if (!token || !confirm("¿Eliminar este producto?")) return;
    try {
      await deleteWorkspaceProduct(token, workspaceId, p.id);
      loadProducts();
      setEditingProduct(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al eliminar");
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold tracking-tight text-[var(--app-fg)]">
          Productos
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            aria-label="Filtrar por estado"
            className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-2.5 py-1.5 text-sm text-[var(--app-fg)] focus:border-[var(--app-gold)] focus:outline-none focus:ring-1 focus:ring-[var(--app-gold)]"
          >
            <option value="">Todos los estados</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {PRODUCT_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            aria-label="Filtrar por categoría"
            className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-2.5 py-1.5 text-sm text-[var(--app-fg)] focus:border-[var(--app-gold)] focus:outline-none focus:ring-1 focus:ring-[var(--app-gold)]"
          >
            <option value="">Todas las categorías</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {PRODUCT_CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => {
              setEditingProduct(null);
              setModalOpen(true);
            }}
            className="rounded-lg bg-[var(--app-gold)] px-3 py-1.5 text-sm font-medium text-[var(--app-black)] hover:opacity-90"
          >
            Añadir producto
          </button>
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-[var(--app-fg)]/60">Cargando…</p>
      ) : products.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[var(--app-border)] py-12 text-center text-sm text-[var(--app-fg)]/60">
          No hay productos. Añade el primero para empezar.
        </p>
      ) : (
        <ul className="space-y-2">
          {products.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium text-[var(--app-fg)]">{p.name}</p>
                <p className="text-xs text-[var(--app-fg)]/60">
                  {p.brand && `${p.brand} · `}
                  {PRODUCT_CATEGORY_LABELS[p.category]}
                  {p.usageTime && ` · ${USAGE_TIME_LABELS[p.usageTime]}`}
                </p>
              </div>
              <span className="rounded-full bg-[var(--app-bg)] px-2 py-0.5 text-xs text-[var(--app-fg)]/80">
                {PRODUCT_STATUS_LABELS[p.status]}
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct(p);
                    setModalOpen(true);
                  }}
                  className="rounded-lg border border-[var(--app-border)] px-2.5 py-1.5 text-xs text-[var(--app-fg)] hover:bg-[var(--app-bg)]"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(p)}
                  className="rounded-lg border border-red-500/30 px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-500/10 dark:text-red-400"
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-4">
        <Link
          href={`/dashboard/workspaces/${workspaceId}`}
          className="text-sm text-[var(--app-gold)] hover:underline"
        >
          Volver al overview
        </Link>
      </p>

      {modalOpen && (
        <>
          <div
            role="presentation"
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => {
              setModalOpen(false);
              setEditingProduct(null);
            }}
          />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold text-[var(--app-fg)]">
              {editingProduct ? "Editar producto" : "Nuevo producto"}
            </h3>
            <ProductForm
              workspaceId={workspaceId}
              product={editingProduct}
              onSave={() => {
                setModalOpen(false);
                setEditingProduct(null);
                loadProducts();
              }}
              onCancel={() => {
                setModalOpen(false);
                setEditingProduct(null);
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}
