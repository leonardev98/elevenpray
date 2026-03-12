"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { useTranslations } from "next-intl";
import "lenis/dist/lenis.css";
import Image from "next/image";
import { Link, useRouter } from "@/i18n/navigation";
import { useAuth } from "../providers/auth-provider";
import { ThemeToggle } from "./theme-toggle";
import { LocaleSwitcher } from "./locale-switcher";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card";
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";
import { FloatingNav } from "@/components/ui/floating-navbar";

// Imágenes referenciales Unsplash (productividad, estudios, bienestar, plantillas)
const UNSPLASH = {
  domainWork:
    "https://images.unsplash.com/photo-1600585154340-be4d9c8b8c84?w=600&h=420&fit=crop",
  domainStudy:
    "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=420&fit=crop",
  domainHealth:
    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=420&fit=crop",
  templateGym:
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&h=120&fit=crop",
  templateBook:
    "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=200&h=120&fit=crop",
  templateSprint:
    "https://images.unsplash.com/photo-1552664730-d307ca884978?w=200&h=120&fit=crop",
  templateFood:
    "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=200&h=120&fit=crop",
  templateChart:
    "https://images.unsplash.com/photo-1611974789853-9e2b8c23843e?w=200&h=120&fit=crop",
  heroMockup:
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=960&h=600&fit=crop",
} as const;

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

  // Lenis: scroll suave solo en la landing
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
      orientation: "vertical",
      autoRaf: true,
    });
    return () => lenis.destroy();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--app-bg)]">
        <p className="text-[var(--app-fg)]/60">{tCommon("loading")}</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-white text-[var(--app-fg)] dark:bg-[var(--app-bg)]">
      <FloatingNav
        alwaysVisible
        linkComponent={Link}
        logo={
          <Link href="/" className="text-lg font-semibold text-[var(--app-fg)]">
            {t("title")}
          </Link>
        }
        navItems={[
          { name: t("navProduct"), link: "#domains" },
          { name: t("navSolutions"), link: "#testimonials" },
          { name: t("navTemplates"), link: "#plantillas" },
          { name: t("navPricing"), link: "/register" },
        ]}
        rightContent={
          <>
            <LocaleSwitcher />
            <ThemeToggle />
            <Link
              href="/login"
              className="hidden rounded-full px-4 py-2 text-sm font-medium text-[var(--app-fg)]/80 transition-colors hover:bg-[var(--app-fg)]/10 hover:text-[var(--app-fg)] sm:inline-block dark:hover:bg-white/10 dark:hover:text-[var(--app-fg)]"
            >
              {t("signIn")}
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-[var(--app-fg)] px-4 py-2 text-sm font-medium text-[var(--app-bg)] transition hover:opacity-90 dark:bg-white dark:text-[var(--app-black)] dark:hover:bg-white/90"
            >
              {t("startFree")}
            </Link>
          </>
        }
      />

      <main>
        {/* Hero con Aurora desde el top; el navbar flotante va por delante (z alto) */}
        <section className="relative z-0 min-h-[85vh] w-full">
          <AuroraBackground className="absolute inset-0 z-0 min-h-[85vh] w-full">
            <span className="sr-only" aria-hidden>Background</span>
          </AuroraBackground>
          <div className="relative z-10 mx-auto flex min-h-[85vh] w-full max-w-6xl flex-col items-center justify-center px-4 pt-28 pb-16 text-center sm:px-6 sm:pt-32 sm:pb-20">
            <div className="relative z-10 mx-auto max-w-3xl">
              <h1
                className="text-[var(--app-fg)] font-extrabold leading-tight tracking-tight sm:leading-[1.1]"
                style={{
                  fontSize: "clamp(2rem, 5vw, 3.25rem)",
                  letterSpacing: "-0.03em",
                }}
              >
                {t("heroTitle")}
              </h1>
            </div>
            <div className="relative z-10 mx-auto mt-4 max-w-2xl">
              <p
                className="relative text-base text-[var(--app-fg)]/90 sm:text-lg"
                style={{
                  letterSpacing: "-0.01em",
                  lineHeight: 1.6,
                }}
              >
                {t("heroSubtitle")}
              </p>
            </div>
            <div className="relative z-10 mt-8 flex justify-center">
              <Link
                href="/register"
                className="w-full min-w-[200px] rounded-lg border border-transparent bg-[var(--app-navy)] px-6 py-3.5 text-center font-medium text-[var(--app-white)] transition hover:opacity-90 dark:border-white dark:bg-transparent dark:text-white dark:hover:bg-white/10 sm:w-auto sm:min-w-[240px]"
              >
                {t("ctaPrimary")}
              </Link>
            </div>
            <div className="relative z-10 mx-auto mt-12 max-w-4xl" aria-hidden>
              <div className="relative overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-lg">
                <div className="relative aspect-[16/10] w-full">
                  <Image
                    src={UNSPLASH.heroMockup}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width:896px) 100vw, 896px"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Organización por dominios - 3D Cards (Aceternity) */}
        <section id="domains" className="relative border-t border-[var(--app-border)] bg-[var(--app-bg)] py-16 dark:bg-[#0d0d0d]">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-center text-xl font-bold text-[var(--app-fg)] sm:text-2xl">
              {t("domainsTitle")}
            </h2>
            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
              {[
                {
                  title: t("domainWork"),
                  desc: t("domainWorkDesc"),
                  src: UNSPLASH.domainWork,
                  Icon: IconWork,
                },
                {
                  title: t("domainStudy"),
                  desc: t("domainStudyDesc"),
                  src: UNSPLASH.domainStudy,
                  Icon: IconStudy,
                },
                {
                  title: t("domainHealth"),
                  desc: t("domainHealthDesc"),
                  src: UNSPLASH.domainHealth,
                  Icon: IconHealth,
                },
              ].map(({ title, desc, src, Icon }) => (
                <CardContainer
                  key={title}
                  className="w-full"
                  containerClassName="w-full py-0"
                >
                  <CardBody className="h-[320px] w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-lg dark:border-[var(--app-fg)]/15">
                    <CardItem
                      translateZ="60"
                      className="relative flex h-full w-full flex-col overflow-hidden rounded-xl"
                    >
                      <div className="relative h-36 w-full shrink-0">
                        <Image
                          src={src}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="(max-width:768px) 100vw, 33vw"
                        />
                      </div>
                      <div className="flex flex-1 flex-col justify-center p-4 text-center">
                        <span className="mx-auto text-[var(--app-fg)]">
                          <Icon />
                        </span>
                        <span className="mt-2 text-base font-semibold text-[var(--app-fg)]">{title}</span>
                        <p className="mt-1.5 text-xs text-[var(--app-fg)]/70">{desc}</p>
                      </div>
                    </CardItem>
                  </CardBody>
                </CardContainer>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonios animados (Aceternity) */}
        <section id="testimonials" className="relative border-t border-[var(--app-border)] bg-[var(--app-surface)] py-16 dark:bg-[#111111]">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-center text-xl font-bold text-[var(--app-fg)] sm:text-2xl">
            {t("testimonialsTitle")}
          </h2>
          <AnimatedTestimonials
            autoplay
            testimonials={[
              {
                quote: t("testimonial1Quote"),
                name: t("testimonial1Name"),
                designation: t("testimonial1Designation"),
                src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face",
              },
              {
                quote: t("testimonial2Quote"),
                name: t("testimonial2Name"),
                designation: t("testimonial2Designation"),
                src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
              },
              {
                quote: t("testimonial3Quote"),
                name: t("testimonial3Name"),
                designation: t("testimonial3Designation"),
                src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
              },
              {
                quote: t("testimonial4Quote"),
                name: t("testimonial4Name"),
                designation: t("testimonial4Designation"),
                src: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
              },
            ]}
          />
          </div>
        </section>

        {/* Plantillas + Tu nueva rutina */}
        <section id="plantillas" className="border-t border-[var(--app-border)] bg-white py-16 dark:bg-[#0d0d0d]">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid gap-12 lg:grid-cols-[1fr,340px]">
              <div>
                <h2 className="text-2xl font-bold text-[var(--app-fg)] sm:text-3xl">
                  {t("templatesTitle")}
                </h2>
                <p className="mt-2 text-[var(--app-fg)]/80">{t("templatesSubtitle")}</p>
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                  {[
                    { name: t("templateWorkout"), icon: "gym", src: UNSPLASH.templateGym },
                    { name: t("templateResearch"), icon: "book", src: UNSPLASH.templateBook },
                    { name: t("templateSprint"), icon: "sprint", src: UNSPLASH.templateSprint },
                    { name: t("templateNutrition"), icon: "food", src: UNSPLASH.templateFood },
                    { name: t("templateMarket"), icon: "chart", src: UNSPLASH.templateChart },
                  ].map(({ name, icon, src }) => (
                    <div
                      key={name}
                      className="flex flex-col rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--app-fg)]/20 hover:shadow-[0_8px_20px_-4px_rgba(0,0,0,0.1)] dark:border-[var(--app-fg)]/15 dark:hover:border-[var(--app-fg)]/35 dark:hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.35),0_0_0_1px_rgba(255,255,255,0.06)]"
                    >
                      <div className="relative mb-3 aspect-[5/3] w-full overflow-hidden rounded-lg bg-[var(--app-bg)] dark:bg-[var(--app-fg)]/10">
                        <Image src={src} alt="" fill className="object-cover" sizes="(max-width:768px) 50vw, 200px" />
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
              <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-sm transition-all duration-200 hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.12)] dark:border-[var(--app-fg)]/15 dark:hover:border-[var(--app-fg)]/35 dark:hover:shadow-[0_8px_28px_-8px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.06)]">
                <h3 className="text-xl font-bold text-[var(--app-fg)]">{t("newRoutineTitle")}</h3>
                <p className="mt-2 text-sm text-[var(--app-fg)]/80">{t("newRoutineSubtitle")}</p>
                <div className="mt-6 flex flex-col items-center">
                  <Link
                    href="/register"
                    className="inline-flex rounded-lg border border-[var(--app-border)] bg-[var(--app-fg)] px-8 py-4 text-center font-medium text-[var(--app-bg)] transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90 hover:shadow-[0_6px_16px_-2px_rgba(0,0,0,0.2)] dark:border-[var(--app-border)] dark:bg-transparent dark:text-[var(--app-fg)] dark:hover:bg-[var(--app-surface)]"
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

        {/* Footer único: paleta del sistema, grid con Producto, Recursos, Empresa, Contacto */}
        <footer className="border-t border-[var(--app-border)] bg-[var(--app-navy)] py-16 dark:bg-[var(--app-surface)]">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mb-10">
              <Link href="/" className="text-xl font-bold text-white dark:text-[var(--app-fg)]">
                {t("title")}
              </Link>
              <p className="mt-2 max-w-md text-sm text-white/80 dark:text-[var(--app-fg)]/80">
                {t("footerDescription")}
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
              <div>
                <h4 className="font-semibold text-white dark:text-[var(--app-fg)]">{t("footerProduct")}</h4>
                <ul className="mt-3 space-y-2 text-sm text-white/80 dark:text-[var(--app-fg)]/80">
                  <li><Link href="/register" className="hover:underline hover:text-white dark:hover:text-[var(--app-fg)]">{t("navTemplates")}</Link></li>
                  <li><Link href="/register" className="hover:underline hover:text-white dark:hover:text-[var(--app-fg)]">{t("navPricing")}</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white dark:text-[var(--app-fg)]">{t("footerResources")}</h4>
                <ul className="mt-3 space-y-2 text-sm text-white/80 dark:text-[var(--app-fg)]/80">
                  <li><Link href="/login" className="hover:underline hover:text-white dark:hover:text-[var(--app-fg)]">{t("signIn")}</Link></li>
                  <li><Link href="/register" className="hover:underline hover:text-white dark:hover:text-[var(--app-fg)]">{t("signUp")}</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white dark:text-[var(--app-fg)]">{t("footerCompany")}</h4>
                <ul className="mt-3 space-y-2 text-sm text-white/80 dark:text-[var(--app-fg)]/80">
                  <li><span className="cursor-default">{t("title")}</span></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white dark:text-[var(--app-fg)]">{t("contactTitle")}</h4>
                <a
                  href={`mailto:${t("contactEmail")}`}
                  className="mt-3 inline-block text-sm text-white/80 underline-offset-2 hover:underline hover:text-white dark:text-[var(--app-fg)]/80 dark:hover:text-[var(--app-fg)]"
                >
                  {t("contactEmail")}
                </a>
              </div>
            </div>
            <p className="mt-12 border-t border-white/20 pt-8 text-center text-sm text-white/70 dark:border-[var(--app-border)] dark:text-[var(--app-fg)]/70">
              © {new Date().getFullYear()} {t("title")}
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
