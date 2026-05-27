"use client";

import { Check, Copy, Gift, Users } from "lucide-react";
import { useState } from "react";
import { REFERRAL_REFEREE_REWARD } from "@/data/gamification-config";
import { cn } from "@/lib/utils";
import { useGamification } from "../gamification-context";

export function ReferralSection() {
  const { data, copyReferralCode } = useGamification();
  const { referidos } = data.extras;
  const [copied, setCopied] = useState(false);

  const nextTier = referidos.tiers.find((t) => !t.completado);
  const meta = nextTier?.activados ?? referidos.tiers[referidos.tiers.length - 1]?.activados ?? 10;
  const progressPct = Math.min((referidos.activados / meta) * 100, 100);

  async function handleCopy() {
    const ok = await copyReferralCode();
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="student-card space-y-5 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-base font-semibold text-[var(--text-primary)]">
            <Users className="h-5 w-5 text-[var(--accent)]" />
            Referidos gamificados
          </h3>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Arco de progresión — ambos ganan al activar con tu código
          </p>
        </div>
        <span className="rounded-full bg-[var(--accent-subtle)] px-3 py-1 text-xs font-medium text-[var(--accent)]">
          Tu código fue usado{" "}
          <strong>{referidos.usosEstaSemana}</strong> veces esta semana
        </span>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <code className="flex-1 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg-input)] px-4 py-2.5 text-center text-sm font-semibold tracking-wider text-[var(--text-primary)] sm:text-left">
          {referidos.codigo}
        </code>
        <button
          type="button"
          onClick={() => void handleCopy()}
          className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-sm)] bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-[var(--accent-fg)] transition-opacity hover:opacity-90"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              Copiado
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copiar código
            </>
          )}
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-[var(--text-muted)]">
            {referidos.activados} / {meta} mentores completados
          </span>
          <span className="font-medium text-[var(--xp)]">{Math.round(progressPct)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[var(--bg-input)]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--xp)] transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {referidos.tiers.map((tier) => (
          <div
            key={tier.activados}
            className={cn(
              "rounded-[var(--radius-sm)] border p-3 text-xs",
              tier.completado
                ? "border-[var(--xp)]/40 bg-[color-mix(in_srgb,var(--xp)_8%,transparent)]"
                : "border-[var(--border)] bg-[var(--bg-elevated)]",
            )}
          >
            <div className="mb-1 flex items-center justify-between">
              <span className="font-semibold text-[var(--text-primary)]">
                {tier.activados} referido{tier.activados > 1 ? "s" : ""}
              </span>
              {tier.completado && (
                <Check className="h-4 w-4 shrink-0 text-[var(--xp)]" aria-hidden />
              )}
            </div>
            <p className="font-medium text-[var(--accent)]">{tier.label}</p>
            <ul className="mt-1 space-y-0.5 text-[var(--text-muted)]">
              {tier.rewards.map((r) => (
                <li key={r}>· {r}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="flex items-start gap-2 rounded-[var(--radius-sm)] bg-[var(--bg-input)] p-3 text-xs text-[var(--text-muted)]">
        <Gift className="mt-0.5 h-4 w-4 shrink-0 text-[var(--xp)]" />
        {REFERRAL_REFEREE_REWARD}
      </p>
    </div>
  );
}
