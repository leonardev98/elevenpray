"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useAuth } from "../../../providers/auth-provider";
import { ThemeToggle } from "../../../components/theme-toggle";
import { toast } from "../../../lib/toast";
import { LocaleSwitcher } from "../../../components/locale-switcher";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const tLanding = useTranslations("landing");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(email, password, name);
      toast.success("Cuenta creada", "Te llevamos a configurar tus espacios");
      router.push("/onboarding");
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("errorSignUp");
      setError(msg);
      toast.error("Error al registrarse", msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[var(--app-bg)] px-4 py-6">
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
      <div className="absolute right-4 top-4 flex items-center gap-2">
        <LocaleSwitcher />
        <ThemeToggle />
      </div>
      <main className="w-full max-w-sm rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-lg sm:p-8">
        <h1 className="text-xl font-semibold tracking-normal text-[var(--app-fg)]">
          {t("createAccount")}
        </h1>
        <p className="mt-1 text-sm text-[var(--app-fg)]/60">{tLanding("title")}</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[var(--app-fg)]">
              {tCommon("name")}
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2.5 text-base text-[var(--app-fg)] focus:border-[var(--app-navy)] focus:outline-none focus:ring-1 focus:ring-[var(--app-navy)] min-h-[48px]"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[var(--app-fg)]">
              {tCommon("email")}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2.5 text-base text-[var(--app-fg)] focus:border-[var(--app-navy)] focus:outline-none focus:ring-1 focus:ring-[var(--app-navy)] min-h-[48px]"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[var(--app-fg)]">
              {tCommon("password")}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2.5 text-base text-[var(--app-fg)] focus:border-[var(--app-navy)] focus:outline-none focus:ring-1 focus:ring-[var(--app-navy)] min-h-[48px]"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[48px] rounded-lg bg-[var(--app-navy)] py-2.5 font-medium text-[var(--app-white)] transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? t("creating") : t("register")}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-[var(--app-fg)]/60">
          {t("hasAccount")}{" "}
          <Link href="/login" className="font-medium text-[var(--app-navy)] hover:underline">
            {t("signInLink")}
          </Link>
        </p>
      </main>
    </div>
  );
}
