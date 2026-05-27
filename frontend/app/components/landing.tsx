"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { useTranslations } from "next-intl";
import "lenis/dist/lenis.css";
import Image from "next/image";
import { Link, useRouter } from "@/i18n/navigation";
import {
  BookOpen,
  Calendar,
  FileUp,
  Layers,
  MessageSquare,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { useAuth } from "../providers/auth-provider";
import { ThemeToggle } from "./theme-toggle";
import { LocaleSwitcher } from "./locale-switcher";
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";
import { FloatingNav } from "@/components/ui/floating-navbar";
import { LandingPricingSection } from "./landing-pricing-section";
import { LandingMobileNavLink } from "./landing-mobile-nav-link";
import { LandingHero } from "./landing-hero";
import { MitsyyLogo } from "./mitsyy-logo";

const LANDING_IMAGES = {
  flashcards: "/landing/feature-flashcards.svg",
} as const;

function NavIcon({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function Landing() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const t = useTranslations("landing");
  const tCommon = useTranslations("common");

  useEffect(() => {
    if (isLoading) return;
    if (token && user) router.replace("/app");
  }, [isLoading, token, user, router]);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;
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
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-base)]">
        <p className="text-[var(--text-muted)]">{tCommon("loading")}</p>
      </div>
    );
  }

  const features = [
    {
      title: t("feature1Title"),
      desc: t("feature1Desc"),
      icon: MessageSquare,
    },
    {
      title: t("feature2Title"),
      desc: t("feature2Desc"),
      icon: Layers,
    },
    {
      title: t("feature3Title"),
      desc: t("feature3Desc"),
      icon: Zap,
    },
    {
      title: t("feature4Title"),
      desc: t("feature4Desc"),
      icon: Calendar,
    },
  ] as const;

  const steps = [
    { n: 1, title: t("step1Title"), desc: t("step1Desc"), icon: FileUp },
    { n: 2, title: t("step2Title"), desc: t("step2Desc"), icon: Sparkles },
    { n: 3, title: t("step3Title"), desc: t("step3Desc"), icon: BookOpen },
  ] as const;

  return (
    <div className="relative min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      <FloatingNav
        alwaysVisible
        linkComponent={Link}
        mobileMenuOpenLabel={tCommon("openMenu")}
        mobileMenuCloseLabel={tCommon("closeMenu")}
        logo={
          <Link href="/" className="inline-flex items-center" aria-label={t("title")}>
            <MitsyyLogo size="xl" priority />
          </Link>
        }
        navItems={[
          {
            name: t("navProduct"),
            link: "#producto",
            ariaLabel: t("navProduct"),
            icon: (
              <NavIcon>
                <Layers className="h-5 w-5" aria-hidden />
              </NavIcon>
            ),
          },
          {
            name: t("navHowItWorks"),
            link: "#como-funciona",
            ariaLabel: t("navHowItWorks"),
            icon: (
              <NavIcon>
                <Sparkles className="h-5 w-5" aria-hidden />
              </NavIcon>
            ),
          },
          {
            name: t("navTestimonials"),
            link: "#testimonios",
            ariaLabel: t("navTestimonials"),
            icon: (
              <NavIcon>
                <MessageSquare className="h-5 w-5" aria-hidden />
              </NavIcon>
            ),
          },
          {
            name: t("navPricing"),
            link: "#pricing",
            ariaLabel: t("navPricing"),
            icon: (
              <NavIcon>
                <Zap className="h-5 w-5" aria-hidden />
              </NavIcon>
            ),
          },
        ]}
        rightContent={
          <>
            <LocaleSwitcher />
            <ThemeToggle />
            <Link
              href="/login"
              className="inline-flex min-h-10 items-center justify-center rounded-full px-4 py-2 text-sm font-medium text-[var(--text-body)] transition-colors hover:bg-[var(--accent-subtle)] hover:text-[var(--text-primary)]"
            >
              {t("signIn")}
            </Link>
            <Link
              href="/register"
              className="inline-flex min-h-10 items-center justify-center rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-fg)] transition hover:opacity-90"
            >
              {t("startFree")}
            </Link>
          </>
        }
        mobileMenuFooter={
          <>
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <LocaleSwitcher variant="segmented" />
              </div>
              <ThemeToggle />
            </div>
            <LandingMobileNavLink href="/login">{t("signIn")}</LandingMobileNavLink>
            <LandingMobileNavLink href="/register" variant="primary">
              {t("startFree")}
            </LandingMobileNavLink>
          </>
        }
      />

      <main>
        <LandingHero />

        {/* Features */}
        <section id="producto" className="border-b border-[var(--border)] bg-[var(--bg-surface)] py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
                {t("featuresTitle")}
              </h2>
              <p className="mt-3 text-[var(--text-body)]">{t("featuresSubtitle")}</p>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map(({ title, desc, icon: Icon }) => (
                <article
                  key={title}
                  className="flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--bg-base)] p-6 shadow-[var(--shadow-sm)] transition hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-md)]"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent-subtle)] text-[var(--accent)]">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--text-body)]">{desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="como-funciona" className="border-b border-[var(--border)] py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div>
                <h2 className="text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
                  {t("howItWorksTitle")}
                </h2>
                <p className="mt-3 text-[var(--text-body)]">{t("howItWorksSubtitle")}</p>
                <ol className="mt-10 space-y-8">
                  {steps.map(({ n, title, desc, icon: Icon }) => (
                    <li key={n} className="flex gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-lg font-bold text-[var(--accent-fg)]">
                        {n}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-[var(--accent)]" aria-hidden />
                          <h3 className="font-semibold text-[var(--text-primary)]">{title}</h3>
                        </div>
                        <p className="mt-1 text-sm text-[var(--text-body)]">{desc}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] shadow-[var(--shadow-md)]">
                <div className="relative aspect-[3/2] w-full">
                  <Image
                    src={LANDING_IMAGES.flashcards}
                    alt={t("featureCardsAlt")}
                    fill
                    className="object-contain p-4"
                    sizes="(max-width:1024px) 100vw, 50vw"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Community */}
        <section id="comunidad" className="border-b border-[var(--border)] bg-[var(--accent-subtle)] py-14 dark:bg-[var(--bg-surface)]">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 text-center sm:px-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--accent-fg)]">
              <Users className="h-6 w-6" aria-hidden />
            </div>
            <h2 className="text-xl font-bold text-[var(--text-primary)] sm:text-2xl">
              {t("communityTitle")}
            </h2>
            <p className="max-w-xl text-[var(--text-body)]">{t("communityDesc")}</p>
            <Link
              href="/register"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--accent)] px-6 py-3 font-medium text-[var(--accent-fg)] transition hover:opacity-90"
            >
              {t("communityCta")}
            </Link>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonios" className="border-b border-[var(--border)] bg-[var(--bg-surface)] py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-center text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
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

        <LandingPricingSection />

        {/* Final CTA */}
        <section className="border-b border-[var(--border)] py-16 sm:py-20">
          <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
              {t("finalCtaTitle")}
            </h2>
            <p className="mt-3 text-[var(--text-body)]">{t("finalCtaSubtitle")}</p>
            <Link
              href="/register"
              className="mt-8 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[var(--accent)] px-8 py-3.5 font-medium text-[var(--accent-fg)] transition hover:opacity-90 sm:w-auto"
            >
              {t("finalCtaButton")}
            </Link>
            <p className="mt-4 text-xs text-[var(--text-muted)]">{t("ctaUrgency")}</p>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-[var(--accent)] py-16 text-[var(--accent-fg)] dark:bg-[var(--bg-elevated)] dark:text-[var(--text-primary)]">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mb-10">
              <Link href="/" className="inline-flex" aria-label={t("title")}>
                <MitsyyLogo size="lg" />
              </Link>
              <p className="mt-2 max-w-md text-sm opacity-90 dark:text-[var(--text-body)]">
                {t("footerDescription")}
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
              <div>
                <h4 className="font-semibold">{t("footerProduct")}</h4>
                <ul className="mt-3 space-y-2 text-sm opacity-90">
                  <li>
                    <a href="#producto" className="hover:underline">
                      {t("footerLinkFeatures")}
                    </a>
                  </li>
                  <li>
                    <a href="#como-funciona" className="hover:underline">
                      {t("footerLinkHowItWorks")}
                    </a>
                  </li>
                  <li>
                    <a href="#pricing" className="hover:underline">
                      {t("footerLinkPricing")}
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold">{t("footerResources")}</h4>
                <ul className="mt-3 space-y-2 text-sm opacity-90">
                  <li>
                    <Link href="/login" className="hover:underline">
                      {t("signIn")}
                    </Link>
                  </li>
                  <li>
                    <Link href="/register" className="hover:underline">
                      {t("signUp")}
                    </Link>
                  </li>
                  <li>
                    <Link href="/pricing" className="hover:underline">
                      {t("navPricing")}
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold">{t("footerCompany")}</h4>
                <ul className="mt-3 space-y-2 text-sm opacity-90">
                  <li>{t("title")}</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold">{t("contactTitle")}</h4>
                <a
                  href={`mailto:${t("contactEmail")}`}
                  className="mt-3 inline-block text-sm opacity-90 underline-offset-2 hover:underline"
                >
                  {t("contactEmail")}
                </a>
              </div>
            </div>
            <p className="mt-12 border-t border-white/20 pt-8 text-center text-sm opacity-80 dark:border-[var(--border)]">
              © {new Date().getFullYear()} {t("title")}
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
