"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useAuth } from "../providers/auth-provider";
import { ThemeToggle } from "./theme-toggle";
import { LocaleSwitcher } from "./locale-switcher";

function IconWork() {
  return (
    <svg className="h-10 w-10 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}
function IconStudy() {
  return (
    <svg className="h-10 w-10 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
    </svg>
  );
}
function IconHealth() {
  return (
    <svg className="h-10 w-10 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}

function TemplateIcon({ type }: { type: string }) {
  const c = "currentColor";
  switch (type) {
    case "gym":
      return (
        <svg className="h-8 w-8 text-[var(--app-fg)]" fill="none" stroke={c} viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      );
    case "book":
      return (
        <svg className="h-8 w-8 text-[var(--app-fg)]" fill="none" stroke={c} viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      );
    case "sprint":
      return (
        <svg className="h-8 w-8 text-[var(--app-fg)]" fill="none" stroke={c} viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      );
    case "food":
      return (
        <svg className="h-8 w-8 text-[var(--app-fg)]" fill="none" stroke={c} viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 00-2 2v5a2 2 0 002 2h14a2 2 0 002-2v-5a2 2 0 00-2-2H5z" />
        </svg>
      );
    case "chart":
      return (
        <svg className="h-8 w-8 text-[var(--app-fg)]" fill="none" stroke={c} viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      );
    default:
      return (
        <svg className="h-8 w-8 text-[var(--app-fg)]" fill="none" stroke={c} viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      );
  }
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
    <div className="relative min-h-screen bg-white text-[var(--app-fg)]">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-[var(--app-border)] bg-[var(--app-surface)]/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="text-lg font-semibold text-[var(--app-fg)]">
            {t("title")}
          </Link>
          <nav className="hidden items-center gap-2 sm:flex" aria-label="Principal">
            <span className="rounded-md px-3 py-2 text-sm text-[var(--app-fg)]/80 transition-shadow duration-200 hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:text-[var(--app-fg)] dark:hover:shadow-[0_2px_10px_rgba(0,0,0,0.25)]">
              {t("navProduct")}
            </span>
            <span className="rounded-md px-3 py-2 text-sm text-[var(--app-fg)]/80 transition-shadow duration-200 hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:text-[var(--app-fg)] dark:hover:shadow-[0_2px_10px_rgba(0,0,0,0.25)]">
              {t("navSolutions")}
            </span>
            <span className="rounded-md px-3 py-2 text-sm text-[var(--app-fg)]/80 transition-shadow duration-200 hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:text-[var(--app-fg)] dark:hover:shadow-[0_2px_10px_rgba(0,0,0,0.25)]">
              {t("navTemplates")}
            </span>
            <span className="rounded-md px-3 py-2 text-sm text-[var(--app-fg)]/80 transition-shadow duration-200 hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:text-[var(--app-fg)] dark:hover:shadow-[0_2px_10px_rgba(0,0,0,0.25)]">
              {t("navPricing")}
            </span>
          </nav>
          <div className="flex items-center gap-5 sm:gap-6">
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
      <div
          className="absolute top-0 left-0 right-0 pointer-events-none h-[100vh] w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#333333_1px,transparent_1px)] [background-size:24px_24px] [mask-image:linear-gradient(to_bottom,white,transparent)] [-webkit-mask-image:linear-gradient(to_bottom,white,transparent)]"
          aria-hidden="true"
        />
        {/* Hero */}
        <section className="relative z-0 mx-auto max-w-4xl px-4 pt-12 pb-16 text-center sm:px-6 sm:pt-16 sm:pb-20">
          {/* Resplandor para limpiar los puntos detrás del texto */}
          <div
            className="absolute left-1/2 top-8 -z-10 h-[140px] w-full max-w-2xl -translate-x-1/2 bg-white opacity-95 blur-[40px] dark:bg-[var(--app-bg)] dark:opacity-95"
            aria-hidden="true"
          />
          <div className="mx-auto max-w-3xl">
            <h1
              className="leading-tight tracking-tight text-[#1a1a1a] sm:leading-[1.1]"
              style={{
                fontFamily: "var(--font-hero), system-ui, sans-serif",
                fontSize: "clamp(2rem, 5vw, 3.25rem)",
                fontWeight: 800,
                letterSpacing: "-0.03em",
              }}
            >
              {t("heroTitle")}
            </h1>
          </div>
          <div className="relative mx-auto mt-4 max-w-2xl">
            {/* Resplandor detrás del subtítulo */}
            <div
              className="absolute left-1/2 top-1/2 -z-10 h-14 w-full -translate-x-1/2 -translate-y-1/2 bg-white opacity-95 blur-[32px] dark:bg-[var(--app-bg)] dark:opacity-95"
              aria-hidden="true"
            />
            <p
              className="relative text-base text-[#4a4a4a] sm:text-lg"
              style={{
                fontFamily: "var(--font-hero), system-ui, sans-serif",
                fontWeight: 400,
                letterSpacing: "-0.01em",
                lineHeight: 1.6,
              }}
            >
              {t("heroSubtitle")}
            </p>
          </div>
          <div className="mt-8 flex justify-center">
            <Link
              href="/register"
              className="w-full min-w-[200px] rounded-lg bg-[var(--app-fg)] px-6 py-3.5 text-center font-medium text-[var(--app-bg)] transition hover:opacity-90 sm:w-auto sm:min-w-[240px]"
            >
              {t("ctaPrimary")}
            </Link>
          </div>
          {/* Glow + placeholder imagen */}
          <div className="relative mx-auto mt-12 max-w-4xl" aria-hidden>
            <div
              className="absolute inset-0 -z-10 rounded-2xl bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.06),transparent_65%)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.06),transparent_65%)]"
              aria-hidden
            />
            <div
              className="overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[#F9FAFB] shadow-sm dark:border-[var(--app-border)] dark:bg-[var(--app-surface)]"
              title="Espacio reservado para imagen de la aplicación"
            >
              <div className="aspect-[16/10] w-full" />
            </div>
          </div>
        </section>

        {/* Organización por dominios - Bento grid */}
        <section id="domains" className="border-t border-[var(--app-border)] bg-[var(--app-surface)]/50 py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-center text-2xl font-bold text-[var(--app-fg)] sm:text-3xl">
              {t("domainsTitle")}
            </h2>
            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:grid-rows-2">
              <div
                className="flex flex-col justify-center rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-8 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3)] sm:row-span-2 sm:justify-center sm:p-10"
              >
                <span className="mx-auto text-[var(--app-fg)]">
                  <IconWork />
                </span>
                <span className="mt-4 text-lg font-semibold text-[var(--app-fg)] sm:text-xl">{t("domainWork")}</span>
                <p className="mt-3 text-sm text-[#666666] dark:text-[var(--app-fg)]/60">{t("domainWorkDesc")}</p>
              </div>
              <div
                className="flex flex-col justify-center rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-8 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3)] sm:p-10"
              >
                <span className="mx-auto text-[var(--app-fg)]">
                  <IconStudy />
                </span>
                <span className="mt-4 text-lg font-semibold text-[var(--app-fg)] sm:text-xl">{t("domainStudy")}</span>
                <p className="mt-3 text-sm text-[#666666] dark:text-[var(--app-fg)]/60">{t("domainStudyDesc")}</p>
              </div>
              <div
                className="flex flex-col justify-center rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-8 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3)] sm:p-10"
              >
                <span className="mx-auto text-[var(--app-fg)]">
                  <IconHealth />
                </span>
                <span className="mt-4 text-lg font-semibold text-[var(--app-fg)] sm:text-xl">{t("domainHealth")}</span>
                <p className="mt-3 text-sm text-[#666666] dark:text-[var(--app-fg)]/60">{t("domainHealthDesc")}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Plantillas + Tu nueva rutina - fondo gris para color blocking */}
        <section className="border-t border-[var(--app-border)] bg-[#F9FAFB] py-16 dark:bg-[var(--app-bg)]">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid gap-12 lg:grid-cols-[1fr,340px]">
              <div>
                <h2 className="text-2xl font-bold text-[var(--app-fg)] sm:text-3xl">
                  {t("templatesTitle")}
                </h2>
                <p className="mt-2 text-[var(--app-fg)]/80">{t("templatesSubtitle")}</p>
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                  {[
                    { name: t("templateWorkout"), icon: "gym" },
                    { name: t("templateResearch"), icon: "book" },
                    { name: t("templateSprint"), icon: "sprint" },
                    { name: t("templateNutrition"), icon: "food" },
                    { name: t("templateMarket"), icon: "chart" },
                  ].map(({ name, icon }) => (
                    <div
                      key={name}
                      className="flex flex-col rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--app-fg)]/20 hover:shadow-[0_8px_20px_-4px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.25)]"
                    >
                      <div className="mb-3 flex min-h-[48px] items-center justify-center rounded-lg bg-[var(--app-bg)] dark:bg-[var(--app-fg)]/10">
                        <TemplateIcon type={icon} />
                      </div>
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
              <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-sm transition-all duration-200 hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_8px_28px_-8px_rgba(0,0,0,0.3)]">
                <h3 className="text-xl font-bold text-[var(--app-fg)]">{t("newRoutineTitle")}</h3>
                <p className="mt-2 text-sm text-[var(--app-fg)]/80">{t("newRoutineSubtitle")}</p>
                <div className="mt-6 flex flex-col items-center">
                  <Link
                    href="/register"
                    className="inline-flex rounded-lg bg-[var(--app-fg)] px-8 py-4 text-center font-medium text-[var(--app-bg)] transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90 hover:shadow-[0_6px_16px_-2px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_6px_20px_-2px_rgba(0,0,0,0.4)]"
                  >
                    {t("createFirstWorkspace")}
                  </Link>
                  <p className="mt-3 text-xs text-[var(--app-fg)]/60">
                    {t("ctaUrgency")}
                  </p>
                </div>
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
