"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { BookOpen, Sparkles, Users } from "lucide-react";
import { signIn } from "next-auth/react";
import { Link, useRouter } from "@/i18n/navigation";
import { useAuth } from "../../../providers/auth-provider";
import { ThemeToggle } from "../../../components/theme-toggle";
import { toast } from "../../../lib/toast";
import { LocaleSwitcher } from "../../../components/locale-switcher";
import { MitsyyLogo } from "../../../components/mitsyy-logo";

function getAllowedNext(next: string | null): string {
  if (!next || typeof next !== "string") return "/app";
  const path = next.startsWith("/") ? next : `/${next}`;
  if (path === "/app" || path.startsWith("/app/")) return path;
  if (path === "/admin" || path.startsWith("/admin/")) return path;
  return "/app";
}

function GoogleIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const searchParams = useSearchParams();
  const next = getAllowedNext(searchParams.get("next"));
  const { login } = useAuth();
  const router = useRouter();
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const tLanding = useTranslations("landing");

  async function handleGoogleLogin() {
    setError("");
    setGoogleLoading(true);
    try {
      const bridgeUrl = `/auth/bridge?next=${encodeURIComponent(next)}`;
      // `signIn` de `next-auth/react` (client) dispara el redirect completo a
      // /api/auth/signin/google → Google → /api/auth/callback/google → bridgeUrl.
      // No usamos el `signIn` server-side de `@/auth` porque desde un onClick
      // en un client component no lanza la redirección OAuth en v5.
      await signIn("google", { callbackUrl: bridgeUrl });
    } catch (err) {
      setGoogleLoading(false);
      const msg =
        err instanceof Error ? err.message : t("errorGoogleSignIn");
      setError(msg);
      toast.error(t("errorSignIn"), msg);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Sesión iniciada", "Bienvenido de nuevo");
      router.push(next);
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("errorSignIn");
      setError(msg);
      toast.error("Error al iniciar sesión", msg);
    } finally {
      setLoading(false);
    }
  }

  const features = [
    { Icon: Sparkles, key: "featureNotes" as const },
    { Icon: BookOpen, key: "featureCourses" as const },
    { Icon: Users, key: "featureCommunity" as const },
  ];

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-fg)]">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr] xl:grid-cols-[1.15fr_1fr]">
        {/* ============================================================
            PANEL IZQUIERDO — Branding (lg+)
        ============================================================ */}
        <aside className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:px-12 lg:py-12 xl:px-16">
          {/* Fondo: capas suaves de color del sistema Paper */}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-br from-[var(--app-primary-soft)] via-[var(--app-surface)] to-[var(--app-bg)]"
          />
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 18% 22%, var(--app-navy) 0, transparent 38%), radial-gradient(circle at 82% 78%, var(--app-navy-muted) 0, transparent 42%)",
            }}
          />
          {/* Grid sutil tipo cuaderno */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                "linear-gradient(var(--app-fg) 1px, transparent 1px), linear-gradient(90deg, var(--app-fg) 1px, transparent 1px)",
              backgroundSize: "36px 36px",
            }}
          />

          {/* Contenido */}
          <div className="relative">
            <Link
              href="/"
              className="inline-flex items-center"
              aria-label={tCommon("backToHome")}
            >
              <MitsyyLogo size="lg" priority />
            </Link>
          </div>

          <div className="relative max-w-md">
            <h2 className="text-3xl font-semibold leading-tight tracking-tight text-[var(--app-fg)] xl:text-4xl">
              {t("brandTagline")}
            </h2>
            <ul className="mt-8 space-y-4">
              {features.map(({ Icon, key }) => (
                <li key={key} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--app-surface)] text-[var(--app-navy)] ring-1 ring-[var(--app-border)]">
                    <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
                  </span>
                  <span className="text-sm leading-relaxed text-[var(--app-fg)]/80">
                    {t(key)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative flex items-center gap-3 text-xs text-[var(--app-fg)]/55">
            <span>© {new Date().getFullYear()} Mitsyy</span>
            <span aria-hidden>·</span>
            <span>{tLanding("title")}</span>
          </div>
        </aside>

        {/* ============================================================
            PANEL DERECHO — Formulario
        ============================================================ */}
        <main className="relative flex min-h-screen flex-col">
          {/* Topbar mobile + acciones */}
          <div className="flex items-center justify-between px-5 pt-5 sm:px-8 sm:pt-6 lg:px-10">
            <Link
              href="/"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--app-fg)] transition hover:bg-[var(--app-surface)]"
              aria-label={tCommon("backToHome")}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </Link>
            <div className="flex items-center gap-2">
              <LocaleSwitcher />
              <ThemeToggle />
            </div>
          </div>

          <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8 sm:py-12 lg:px-10">
            <div className="w-full max-w-[420px]">
              {/* Marca móvil */}
              <div className="lg:hidden">
                <MitsyyLogo size="lg" />
              </div>

              <header className="mt-6 lg:mt-0">
                <h1 className="text-3xl font-semibold tracking-tight text-[var(--app-fg)]">
                  {t("welcomeBack")}
                </h1>
                <p className="mt-2 text-sm text-[var(--app-fg)]/60">
                  {t("welcomeBackSubtitle")}
                </p>
              </header>

              {/* Botón Google */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={googleLoading || loading}
                className="mt-8 inline-flex w-full items-center justify-center gap-3 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-3 text-sm font-medium text-[var(--app-fg)] shadow-sm transition hover:border-[var(--app-navy)]/40 hover:bg-[var(--app-surface-elevated)] focus:outline-none focus:ring-2 focus:ring-[var(--app-navy)]/30 focus:ring-offset-2 focus:ring-offset-[var(--app-bg)] disabled:cursor-not-allowed disabled:opacity-60 min-h-[48px]"
              >
                {googleLoading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--app-border)] border-t-[var(--app-navy)]" />
                ) : (
                  <GoogleIcon />
                )}
                <span>{t("continueWithGoogle")}</span>
              </button>

              {/* Separador */}
              <div className="relative my-6 flex items-center">
                <div className="flex-1 border-t border-[var(--app-border)]" />
                <span className="px-3 text-xs uppercase tracking-wider text-[var(--app-fg)]/50">
                  {t("orContinueWithEmail")}
                </span>
                <div className="flex-1 border-t border-[var(--app-border)]" />
              </div>

              {/* Formulario email */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <p
                    role="alert"
                    className="rounded-xl border border-red-500/20 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-600 dark:text-red-400"
                  >
                    {error}
                  </p>
                )}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-[var(--app-fg)]/90"
                  >
                    {tCommon("email")}
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder={t("emailPlaceholder")}
                    className="mt-1.5 w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)]/70 px-3.5 py-2.5 text-[var(--app-fg)] placeholder:text-[var(--app-fg)]/40 transition focus:border-[var(--app-navy)] focus:bg-[var(--app-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--app-navy)]/25 min-h-[48px]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-[var(--app-fg)]/90"
                  >
                    {tCommon("password")}
                  </label>
                  <div className="relative mt-1.5">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)]/70 py-2.5 pl-3.5 pr-11 text-[var(--app-fg)] placeholder:text-[var(--app-fg)]/40 transition focus:border-[var(--app-navy)] focus:bg-[var(--app-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--app-navy)]/25 min-h-[48px]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-[var(--app-fg)]/50 transition hover:bg-[var(--app-navy)]/5 hover:text-[var(--app-fg)]/80 focus:outline-none focus:ring-2 focus:ring-[var(--app-navy)]/30"
                      aria-label={
                        showPassword ? t("hidePassword") : t("showPassword")
                      }
                    >
                      {showPassword ? (
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading || googleLoading}
                  className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-[var(--app-navy)] py-3 text-sm font-semibold text-[var(--app-white)] shadow-sm transition hover:bg-[var(--app-navy-muted)] hover:shadow disabled:cursor-not-allowed disabled:opacity-60 min-h-[48px]"
                >
                  {loading ? t("entering") : t("enter")}
                </button>
              </form>

              <p className="mt-7 text-center text-sm text-[var(--app-fg)]/60">
                {t("noAccount")}{" "}
                <Link
                  href="/register"
                  className="font-medium text-[var(--app-navy)] underline-offset-4 hover:underline"
                >
                  {t("signUp")}
                </Link>
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
