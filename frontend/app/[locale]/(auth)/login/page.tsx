"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useAuth } from "../../../providers/auth-provider";
import { ThemeToggle } from "../../../components/theme-toggle";
import { LocaleSwitcher } from "../../../components/locale-switcher";

const MOCK_PROVIDERS = [
  { id: "google", label: "Google" },
  { id: "apple", label: "Apple" },
  { id: "microsoft", label: "Microsoft" },
  { id: "passkey", label: "Passkey" },
  { id: "sso", label: "SSO" },
] as const;

function ProviderIcon({ id }: { id: (typeof MOCK_PROVIDERS)[number]["id"] }) {
  const size = 20;
  switch (id) {
    case "google":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
      );
    case "apple":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
        </svg>
      );
    case "microsoft":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
          <path fill="#f25022" d="M2 2h9.5v9.5H2V2z" />
          <path fill="#00a4ef" d="M12.5 2H22v9.5h-9.5V2z" />
          <path fill="#7fba00" d="M2 12.5H11.5V22H2v-9.5z" />
          <path fill="#ffb900" d="M12.5 12.5H22V22h-9.5v-9.5z" />
        </svg>
      );
    case "passkey":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="7.5" cy="15.5" r="2.5" />
          <path d="M10 13L15 8l4 4-6 6-2-2" />
        </svg>
      );
    case "sso":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      );
    default:
      return null;
  }
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const tLanding = useTranslations("landing");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorSignIn"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-[var(--app-bg)]">
      {/* Flecha atrás al landpage */}
      <div className="absolute left-4 top-4 z-10">
        <Link
          href="/"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--app-fg)] hover:bg-[var(--app-surface)] transition"
          aria-label={tCommon("backToHome")}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
      </div>
      {/* Contenido principal centrado */}
      <div className="flex min-h-[calc(100vh-56px)] flex-1 flex-col items-center justify-center px-4 py-10 sm:py-14">
        <main className="w-full max-w-[400px]">
          {/* Marca y título */}
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--app-navy)] text-[var(--app-gold)] shadow-sm">
              <span className="text-xl font-bold tracking-tight">E</span>
            </div>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-[var(--app-fg)]">
              {tLanding("title")}
            </h1>
            <p className="mt-1.5 text-sm text-[var(--app-fg)]/60">
              {t("signInSubtitle")}
            </p>
          </div>

          {/* Métodos de inicio de sesión (mock) */}
          <div className="mt-8">
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--app-fg)]/50">
              {t("loginWith")}
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5 sm:gap-3">
              {MOCK_PROVIDERS.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  disabled
                  aria-label={label}
                  className="flex flex-col items-center gap-1.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] py-3 text-[var(--app-fg)]/70 opacity-75 transition hover:border-[var(--app-gold)]/30 hover:bg-[var(--app-gold)]/5 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-[var(--app-gold)]/40 focus:ring-offset-2 focus:ring-offset-[var(--app-bg)] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <ProviderIcon id={id} />
                  <span className="text-[10px] font-medium sm:text-xs">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Separador */}
          <div className="relative mt-6 flex items-center">
            <div className="flex-1 border-t border-[var(--app-border)]" />
            <span className="px-3 text-xs text-[var(--app-fg)]/45">
              {t("orContinueWith")}
            </span>
            <div className="flex-1 border-t border-[var(--app-border)]" />
          </div>

          {/* Formulario email + contraseña */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && (
              <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
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
                placeholder={t("emailPlaceholder")}
                className="mt-1.5 w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)]/80 px-3.5 py-2.5 text-[var(--app-fg)] placeholder:text-[var(--app-fg)]/40 focus:border-[var(--app-gold)]/80 focus:bg-[var(--app-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--app-gold)]/20 min-h-[48px] transition"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[var(--app-fg)]/90"
              >
                {tCommon("password")}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1.5 w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)]/80 px-3.5 py-2.5 text-[var(--app-fg)] placeholder:text-[var(--app-fg)]/40 focus:border-[var(--app-gold)]/80 focus:bg-[var(--app-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--app-gold)]/20 min-h-[48px] transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[48px] rounded-xl bg-[var(--app-navy)] py-3 font-medium text-[var(--app-white)] shadow-sm transition hover:bg-[var(--app-navy-muted)] hover:shadow disabled:opacity-50"
            >
              {loading ? t("entering") : t("enter")}
            </button>
          </form>

          {/* Registrarse */}
          <p className="mt-6 text-center text-sm text-[var(--app-fg)]/60">
            {t("noAccount")}{" "}
            <Link
              href="/register"
              className="font-medium text-[var(--app-gold)] underline-offset-2 hover:underline"
            >
              {t("signUp")}
            </Link>
          </p>
        </main>
      </div>

      {/* Barra inferior: idioma y tema */}
      <footer className="flex shrink-0 items-center justify-center gap-4 border-t border-[var(--app-border)]/80 bg-[var(--app-surface)]/50 px-4 py-3">
        <span className="text-xs text-[var(--app-fg)]/50">{tCommon("language")}</span>
        <LocaleSwitcher />
        <ThemeToggle />
      </footer>
    </div>
  );
}
