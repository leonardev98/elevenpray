"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";

const HERO_IMAGE = "/landing/hero-study.svg";

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

function HeroTitleWords({ text }: { text: string }) {
  const reduceMotion = useReducedMotion();
  const words = text.split(/\s+/).filter(Boolean);

  if (reduceMotion) {
    return <>{text}</>;
  }

  return (
    <span className="inline">
      {words.map((word, index) => (
        <span key={`${word}-${index}`} className="mr-[0.28em] inline-block last:mr-0">
          <motion.span
            className="inline-block"
            initial={{ opacity: 0, filter: "blur(4px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{
              duration: 0.4,
              delay: index * 0.06,
              ease: "easeOut",
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

export function LandingHero() {
  const t = useTranslations("landing");
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const parallaxY = useTransform(scrollY, (value) => (reduceMotion ? 0 : value * 0.12));
  const [showPulse, setShowPulse] = useState(!reduceMotion);

  useEffect(() => {
    setShowPulse(!reduceMotion);
  }, [reduceMotion]);

  return (
    <section className="relative overflow-hidden border-b border-[var(--border)]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-[0.12]"
        style={{
          backgroundImage: "url(/pattern.svg)",
          backgroundSize: "320px 320px",
        }}
        aria-hidden
      />

      <div className="relative mx-auto flex min-h-[min(85vh,900px)] w-full max-w-6xl flex-col items-center justify-center px-4 pb-16 pt-[max(5.5rem,calc(3.75rem+env(safe-area-inset-top)))] sm:px-6 sm:pb-20 md:pt-[max(7rem,calc(5rem+env(safe-area-inset-top)))]">
        <motion.div
          className="flex w-full flex-col items-center text-center"
          style={reduceMotion ? undefined : { y: parallaxY }}
        >
          <motion.div
            className="flex w-full max-w-3xl flex-col items-center"
            variants={reduceMotion ? undefined : staggerContainer}
            initial={reduceMotion ? false : "hidden"}
            animate={reduceMotion ? undefined : "show"}
          >
            <motion.span
              variants={reduceMotion ? undefined : staggerItem}
              className="hero-badge-shimmer inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-1 text-xs font-medium text-[var(--text-body)]"
            >
              {t("heroBadge")}
            </motion.span>

            <motion.h1
              variants={reduceMotion ? undefined : staggerItem}
              className="mt-5 max-w-3xl font-extrabold leading-tight tracking-tight text-[var(--text-primary)]"
              style={{
                fontSize: "clamp(2rem, 5vw, 3.25rem)",
                letterSpacing: "-0.03em",
              }}
            >
              <HeroTitleWords text={t("heroTitle")} />
            </motion.h1>

            <motion.p
              variants={reduceMotion ? undefined : staggerItem}
              className="mt-4 max-w-2xl text-base text-[var(--text-body)] sm:text-lg"
              style={{ lineHeight: 1.6, letterSpacing: "-0.01em" }}
            >
              {t("heroSubtitle")}
            </motion.p>

            <motion.div
              variants={reduceMotion ? undefined : staggerItem}
              className="mt-8 flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center"
            >
              <div className="relative w-full sm:w-auto">
                {showPulse ? (
                  <motion.span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-xl bg-[var(--accent)]"
                    animate={{ scale: [1, 1.12], opacity: [0.5, 0] }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      repeatDelay: 2,
                      ease: "easeOut",
                    }}
                  />
                ) : null}
                <Link
                  href="/register"
                  className="relative inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[var(--accent)] px-6 py-3 font-medium text-[var(--accent-fg)] transition hover:opacity-90 sm:w-auto"
                >
                  {t("ctaPrimary")}
                </Link>
              </div>
              <a
                href="#como-funciona"
                className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-6 py-3 font-medium text-[var(--text-primary)] transition hover:border-[var(--border-strong)] hover:bg-[var(--bg-elevated)] sm:w-auto"
              >
                {t("ctaSecondary")}
              </a>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          className="relative mt-12 w-full max-w-4xl"
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55, ease: "easeOut" }}
        >
          <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] shadow-[var(--shadow-md)]">
            <div className="relative aspect-[16/10] w-full">
              <Image
                src={HERO_IMAGE}
                alt={t("heroImageAlt")}
                fill
                className="object-cover object-top"
                sizes="(max-width:896px) 100vw, 896px"
                priority
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
