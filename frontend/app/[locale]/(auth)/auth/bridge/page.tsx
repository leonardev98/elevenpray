"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/navigation";
import { useAuth } from "../../../../providers/auth-provider";
import { normalizePublicUser } from "@/app/lib/auth-api";

function getAllowedNext(next: string | null): string {
  if (!next || typeof next !== "string") return "/app";
  const path = next.startsWith("/") ? next : `/${next}`;
  if (path === "/app" || path.startsWith("/app/")) return path;
  if (path === "/admin" || path.startsWith("/admin/")) return path;
  if (path === "/onboarding") return path;
  return "/app";
}

interface NextAuthSession {
  user?: { id?: string; email?: string; name?: string; image?: string };
  backendAccessToken?: string;
  backendUser?: {
    id: string;
    email: string;
    name: string;
    role?: "user" | "platform_admin";
    avatarUrl?: string | null;
  };
  backendError?: string;
}

export default function AuthBridgePage() {
  const router = useRouter();
  const params = useSearchParams();
  const { setSession } = useAuth();
  const t = useTranslations("auth");
  const [error, setError] = useState<string | null>(null);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const handled = useRef(false);

  function humanizeBackendError(raw: string): string {
    const lower = raw.toLowerCase();
    if (
      lower.includes("backend_internal_url") ||
      lower.includes("configuración") ||
      lower.includes("not configured")
    ) {
      return t("bridgeConfigError");
    }
    if (
      lower.includes("failed to parse url") ||
      lower.includes("invalid url") ||
      lower.includes("enotfound") ||
      lower.includes("econnrefused") ||
      lower.includes("fetch failed") ||
      lower.includes("network error") ||
      lower.includes("no se pudo contactar")
    ) {
      return t("bridgeBackendUnreachable");
    }
    if (
      lower.includes("invalid google") ||
      lower.includes("google email is not verified")
    ) {
      return t("bridgeGoogleInvalid");
    }
    return t("bridgeUnknownError");
  }

  const next = getAllowedNext(params.get("next"));

  const run = useCallback(async () => {
    try {
      const sessionRes = await fetch("/api/auth/session", {
        cache: "no-store",
      });
      if (!sessionRes.ok) {
        throw new Error(t("bridgeNoSession"));
      }
      const session = (await sessionRes.json()) as NextAuthSession | null;

      if (!session) {
        setErrorDetail(null);
        throw new Error(t("bridgeNoSession"));
      }
      if (session.backendError) {
        setErrorDetail(session.backendError);
        throw new Error(humanizeBackendError(session.backendError));
      }
      if (!session.backendAccessToken || !session.backendUser) {
        setErrorDetail(null);
        throw new Error(t("bridgeNoBackendToken"));
      }

      setSession(
        session.backendAccessToken,
        normalizePublicUser(
          session.backendUser as unknown as Record<string, unknown>,
        ),
      );

      // Best-effort: limpia la cookie de NextAuth ya que toda la app usa
      // nuestro propio JWT desde aquí en adelante.
      try {
        const csrfRes = await fetch("/api/auth/csrf", { cache: "no-store" });
        const csrf = (await csrfRes.json().catch(() => ({}))) as {
          csrfToken?: string;
        };
        if (csrf.csrfToken) {
          await fetch("/api/auth/signout", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              csrfToken: csrf.csrfToken,
              json: "true",
            }),
            cache: "no-store",
          });
        }
      } catch {
        // Ignorar: no es crítico para el bridge
      }

      router.replace(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("bridgeUnknownError"));
    }
  }, [next, router, setSession, t]);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;
    void run();
  }, [run]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--app-bg)] px-4">
      <div className="w-full max-w-sm rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-8 text-center shadow-sm">
        {error ? (
          <>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-600 dark:text-red-400">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="mt-4 text-lg font-semibold text-[var(--app-fg)]">
              {t("bridgeErrorTitle")}
            </h1>
            <p className="mt-2 text-sm text-[var(--app-fg)]/70">{error}</p>
            {errorDetail && errorDetail !== error && (
              <details className="mt-3 text-left">
                <summary className="cursor-pointer text-xs font-medium text-[var(--app-fg)]/55 hover:text-[var(--app-fg)]/80">
                  {t("bridgeShowDetails")}
                </summary>
                <pre className="mt-2 overflow-auto rounded-lg bg-[var(--app-bg)] p-3 text-left text-[11px] leading-snug text-[var(--app-fg)]/70 ring-1 ring-[var(--app-border)]">
                  {errorDetail}
                </pre>
              </details>
            )}
            <Link
              href="/login"
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-[var(--app-navy)] px-4 py-2.5 text-sm font-medium text-[var(--app-white)] transition hover:opacity-90"
            >
              {t("bridgeBackToLogin")}
            </Link>
          </>
        ) : (
          <>
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[var(--app-border)] border-t-[var(--app-navy)]" />
            <h1 className="mt-4 text-lg font-semibold text-[var(--app-fg)]">
              {t("bridgeFinishingTitle")}
            </h1>
            <p className="mt-2 text-sm text-[var(--app-fg)]/60">
              {t("bridgeFinishingSubtitle")}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
