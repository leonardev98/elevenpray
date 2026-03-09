"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useAuth } from "../providers/auth-provider";
import { ThemeToggle } from "./theme-toggle";
import { LocaleSwitcher } from "./locale-switcher";

function IconWork() {
  return (
    <svg className="h-6 w-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}
function IconStudy() {
  return (
    <svg className="h-6 w-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
    </svg>
  );
}
function IconHealth() {
  return (
    <svg className="h-6 w-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}

export function Landing() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const t = useTranslations("landing");
  const tCommon = useTranslations("common");

  useEffect(() => {
    if (isLoading) return;
    if (token && user) router.replace("/dashboard");
  }, [isLoading, token, user, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--app-bg)]">
        <p className="text-[var(--app-fg)]/60">{tCommon("loading")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-fg)]">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-[var(--app-border)] bg-[var(--app-surface)]/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="text-lg font-semibold text-[var(--app-fg)]">
            {t("title")}
          </Link>
          <nav className="hidden items-center gap-6 sm:flex" aria-label="Principal">
            <span className="text-sm text-[var(--app-fg)]/80">{t("navProduct")}</span>
            <span className="text-sm text-[var(--app-fg)]/80">{t("navSolutions")}</span>
            <span className="text-sm text-[var(--app-fg)]/80">{t("navTemplates")}</span>
            <span className="text-sm text-[var(--app-fg)]/80">{t("navPricing")}</span>
          </nav>
          <div className="flex items-center gap-3">
            <LocaleSwitcher />
            <ThemeToggle />
            <Link
              href="/login"
              className="hidden text-sm font-medium text-[var(--app-fg)] hover:underline sm:inline"
            >
              {t("signIn")}
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-[var(--app-fg)] px-4 py-2.5 text-sm font-medium text-[var(--app-bg)] transition hover:opacity-90"
            >
              {t("startFree")}
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-4xl px-4 pt-12 pb-16 text-center sm:px-6 sm:pt-16 sm:pb-20">
          <h1 className="text-3xl font-bold tracking-tight text-[var(--app-fg)] sm:text-4xl md:text-5xl">
            {t("heroTitle")}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-[var(--app-fg)]/80 sm:text-lg">
            {t("heroSubtitle")}
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/register"
              className="w-full min-w-[200px] rounded-lg bg-[var(--app-fg)] px-6 py-3.5 text-center font-medium text-[var(--app-bg)] transition hover:opacity-90 sm:w-auto sm:min-w-[240px]"
            >
              {t("ctaPrimary")}
            </Link>
          </div>
          {/* Placeholder para imagen: rectángulo negro de referencia */}
          <div
            className="mx-auto mt-12 max-w-4xl overflow-hidden rounded-xl border border-[var(--app-border)] shadow-xl"
            aria-hidden
          >
            <div
              className="aspect-[16/10] w-full bg-[var(--app-fg)]"
              title="Espacio reservado para imagen de la aplicación"
            />
          </div>
        </section>

        {/* Organización por dominios */}
        <section id="domains" className="border-t border-[var(--app-border)] bg-[var(--app-surface)]/50 py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-center text-2xl font-bold text-[var(--app-fg)] sm:text-3xl">
              {t("domainsTitle")}
            </h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                { icon: IconWork, label: t("domainWork") },
                { icon: IconStudy, label: t("domainStudy") },
                { icon: IconHealth, label: t("domainHealth") },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-3 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 text-center"
                >
                  <span className="text-[var(--app-fg)]">
                    <Icon />
                  </span>
                  <span className="font-medium text-[var(--app-fg)]">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Plantillas + Tu nueva rutina */}
        <section className="border-t border-[var(--app-border)] py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid gap-12 lg:grid-cols-[1fr,340px]">
              <div>
                <h2 className="text-2xl font-bold text-[var(--app-fg)] sm:text-3xl">
                  {t("templatesTitle")}
                </h2>
                <p className="mt-2 text-[var(--app-fg)]/80">{t("templatesSubtitle")}</p>
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                  {[
                    t("templateWorkout"),
                    t("templateResearch"),
                    t("templateSprint"),
                    t("templateNutrition"),
                    t("templateMarket"),
                  ].map((name) => (
                    <div
                      key={name}
                      className="flex flex-col items-center justify-center gap-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] py-4"
                    >
                      <span className="text-center text-sm font-medium text-[var(--app-fg)]">{name}</span>
                    </div>
                  ))}
                </div>
                <Link
                  href="/register"
                  className="mt-4 inline-block text-sm font-medium text-[var(--app-fg)] hover:underline"
                >
                  {t("exploreRoutines")} →
                </Link>
              </div>
              <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6">
                <h3 className="text-xl font-bold text-[var(--app-fg)]">{t("newRoutineTitle")}</h3>
                <p className="mt-2 text-sm text-[var(--app-fg)]/80">{t("newRoutineSubtitle")}</p>
                <Link
                  href="/register"
                  className="mt-6 block w-full rounded-lg bg-[var(--app-fg)] py-3 text-center font-medium text-[var(--app-bg)] transition hover:opacity-90"
                >
                  {t("createFirstWorkspace")}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Contactos */}
        <section className="border-t border-[var(--app-border)] py-12">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-xl font-semibold text-[var(--app-fg)]">{t("contactTitle")}</h2>
            <a
              href={`mailto:${t("contactEmail")}`}
              className="mt-2 inline-block text-[var(--app-fg)]/80 underline-offset-2 hover:underline"
            >
              {t("contactEmail")}
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-[var(--app-border)] bg-[var(--app-surface)]/50 py-12">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
              <div>
                <h4 className="font-semibold text-[var(--app-fg)]">{t("footerProduct")}</h4>
                <ul className="mt-3 space-y-2 text-sm text-[var(--app-fg)]/80">
                  <li><Link href="/register" className="hover:underline">{t("navTemplates")}</Link></li>
                  <li><Link href="/register" className="hover:underline">{t("navPricing")}</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-[var(--app-fg)]">{t("footerResources")}</h4>
                <ul className="mt-3 space-y-2 text-sm text-[var(--app-fg)]/80">
                  <li><Link href="/login" className="hover:underline">{t("signIn")}</Link></li>
                  <li><Link href="/register" className="hover:underline">{t("signUp")}</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-[var(--app-fg)]">{t("footerCompany")}</h4>
                <ul className="mt-3 space-y-2 text-sm text-[var(--app-fg)]/80">
                  <li><span className="cursor-default">ElevenPray</span></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-[var(--app-fg)]">{t("title")}</h4>
                <p className="mt-3 text-sm text-[var(--app-fg)]/80">{t("footerDescription")}</p>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
