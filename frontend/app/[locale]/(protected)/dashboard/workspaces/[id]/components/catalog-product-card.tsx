"use client";

import { motion } from "framer-motion";
import type { CatalogProductApi } from "../../../../../../lib/catalog-api";
import { fadeInUp, hoverCard } from "@/lib/animations";

const CATEGORY_LABELS: Record<string, string> = {
  cleanser: "Limpiador",
  moisturizer: "Hidratante",
  sunscreen: "Protector solar",
  serum: "Sérum",
  retinoid: "Retinoide",
  exfoliant: "Exfoliante",
  toner: "Tónico",
  eye_care: "Contorno de ojos",
  mask: "Mascarilla",
  essence: "Esencia",
  oil: "Aceite",
  balm: "Bálsamo",
  spot_treatment: "Tratamiento local",
};

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
    </svg>
  );
}

/** Muestra 5 estrellas puntuadas: llenas hasta el valor, el resto vacías. */
function StarRating({ rating }: { rating: number }) {
  const value = Math.min(5, Math.max(0, rating));
  const full = Math.floor(value);
  const half = value % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`Valoración: ${value.toFixed(1)} de 5`}>
      {Array.from({ length: full }, (_, i) => (
        <span key={`f-${i}`} className="text-amber-500" aria-hidden>★</span>
      ))}
      {half > 0 && (
        <span className="text-amber-500" aria-hidden style={{ opacity: 0.6 }}>★</span>
      )}
      {Array.from({ length: empty }, (_, i) => (
        <span key={`e-${i}`} className="text-neutral-300 dark:text-neutral-600" aria-hidden>★</span>
      ))}
    </span>
  );
}

export function CatalogProductCard({
  product,
  isBookmarked,
  onToggleBookmark,
  onOpenDetail,
  onAddToRoutine,
}: {
  product: CatalogProductApi;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onOpenDetail: () => void;
  onAddToRoutine: () => void;
}) {
  const categoryLabel = CATEGORY_LABELS[product.category] ?? product.category;
  const benefitLine = product.benefits?.[0] ?? product.description ?? null;

  return (
    <motion.article
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-sm"
      initial={fadeInUp.initial}
      animate={fadeInUp.animate}
      transition={fadeInUp.transition}
      whileHover={{ ...hoverCard, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
    >
      {/* Bookmark: top-right, icon button */}
      <div className="absolute right-3 top-3 z-10" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleBookmark();
          }}
          className="rounded-full p-2 transition-colors hover:bg-[var(--app-fg)]/10"
          aria-pressed={isBookmarked}
          aria-label={isBookmarked ? "Quitar de guardados" : "Guardar producto"}
        >
          <span className={isBookmarked ? "text-[var(--app-navy)]" : "text-[var(--app-fg)]/50 group-hover:text-[var(--app-fg)]/80"}>
            <BookmarkIcon filled={isBookmarked} />
          </span>
        </button>
      </div>

      {/* 1. Zona imagen — 60% de la card: 220px, fondo #F8F7F5, padding 24px, imagen max-height 160px */}
      <div
        className="flex h-[220px] shrink-0 items-center justify-center p-6"
        style={{ backgroundColor: "#F8F7F5" }}
      >
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt=""
            className="max-h-[160px] w-full object-contain"
          />
        ) : (
          <span className="text-6xl font-extralight text-[var(--app-fg)]/15">
            {product.name.charAt(0)}
          </span>
        )}
      </div>

      {/* 2. Zona información — marca, nombre, categoría, rating, beneficio */}
      <div className="flex flex-1 flex-col px-5 pt-4 pb-4">
        {product.brand && (
          <p className="text-xs uppercase tracking-wide text-neutral-500">
            {product.brand}
          </p>
        )}
        <h3 className="mt-0.5 text-base font-semibold leading-tight text-[var(--app-fg)] line-clamp-2">
          {product.name}
        </h3>
        {product.rating != null && (
          <p className="mt-1 flex items-center gap-1.5 text-xs text-neutral-500">
            <StarRating rating={Math.min(5, Math.max(0, product.rating))} />
            <span>{product.rating.toFixed(1)}</span>
          </p>
        )}
        <span className="mt-2 inline-block w-fit rounded-full bg-[#F8F7F5] px-2.5 py-1 text-xs font-medium capitalize text-neutral-600 dark:bg-neutral-700/50 dark:text-neutral-300">
          {categoryLabel}
        </span>
        {benefitLine && (
          <p className="mt-2 line-clamp-2 text-sm text-neutral-600 dark:text-neutral-400">
            {benefitLine}
          </p>
        )}
      </div>

      {/* 3. Zona acciones — botones rectangulares (más anchos que altos) */}
      <div className="flex gap-3 px-5 pb-5" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={onOpenDetail}
          className="min-h-[44px] min-w-[100px] flex-1 rounded-xl border border-[var(--app-border)] px-5 py-2.5 text-sm font-medium text-[var(--app-fg)] transition-colors hover:border-[var(--app-navy)]/50 hover:bg-[var(--app-navy)]/10"
        >
          Info
        </button>
        <button
          type="button"
          onClick={onAddToRoutine}
          className="min-h-[44px] min-w-[120px] flex-1 rounded-xl bg-[var(--app-navy)] px-5 py-2.5 text-sm font-medium text-[var(--app-white)] transition-colors hover:opacity-90"
        >
          Añadir a rutina
        </button>
      </div>
    </motion.article>
  );
}
