"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "../../../../../../providers/auth-provider";
import { getExperts, type ExpertConsultationExpertApi } from "../../../../../../lib/expert-consultation-api";

export default function WorkspaceExpertsPage() {
  const params = useParams();
  const workspaceId = params.id as string;
  const { token } = useAuth();
  const [experts, setExperts] = useState<ExpertConsultationExpertApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token || !workspaceId) return;
    setLoading(true);
    getExperts(token, workspaceId)
      .then(setExperts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token, workspaceId]);

  return (
    <div className="space-y-6">
      {/* Disclaimer: orientación educativa, no diagnóstico médico */}
      <aside
        className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4 text-sm text-[var(--app-fg)]/80"
        role="note"
        aria-label="Aviso legal"
      >
        <p>
          Este espacio ofrece <strong>orientación y mentoría</strong> por parte de expertos. No
          sustituye el diagnóstico ni el tratamiento médico. Si tienes dudas sobre tu salud, consulta
          siempre a un profesional sanitario.
        </p>
      </aside>

      <section aria-labelledby="experts-heading">
        <h1 id="experts-heading" className="mb-4 text-xl font-semibold text-[var(--app-fg)]">
          Expertos
        </h1>

        {loading && (
          <p className="text-[var(--app-fg)]/60">Cargando…</p>
        )}

        {error && (
          <p className="text-red-500" role="alert">
            {error}
          </p>
        )}

        {!loading && !error && experts.length === 0 && (
          <p className="text-[var(--app-fg)]/70">
            Aún no hay expertos disponibles en este espacio. Pronto podrás conectar con mentores y
            recibir orientación personalizada.
          </p>
        )}

        {!loading && !error && experts.length > 0 && (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list">
            {experts.map((expert) => (
              <li key={expert.id}>
                <article
                  className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4 transition hover:border-[var(--app-navy)]/40"
                  aria-labelledby={`expert-${expert.id}-name`}
                >
                  <div className="flex gap-3">
                    {expert.avatarUrl ? (
                      <img
                        src={expert.avatarUrl}
                        alt=""
                        className="h-12 w-12 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--app-navy)]/20 text-lg font-medium text-[var(--app-navy)]"
                        aria-hidden
                      >
                        {expert.name.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h2
                        id={`expert-${expert.id}-name`}
                        className="font-medium text-[var(--app-fg)]"
                      >
                        {expert.name}
                      </h2>
                      {expert.title && (
                        <p className="text-sm text-[var(--app-fg)]/70">{expert.title}</p>
                      )}
                      {expert.specialties?.length ? (
                        <p className="mt-1 text-xs text-[var(--app-navy)]">
                          {expert.specialties
                            .map((s) => s.specialty?.label)
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  {expert.bio && (
                    <p className="mt-3 line-clamp-2 text-sm text-[var(--app-fg)]/80">
                      {expert.bio}
                    </p>
                  )}
                </article>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
