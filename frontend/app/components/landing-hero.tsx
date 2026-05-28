"use client";

import { useEffect, useId, useState } from "react";
import Image from "next/image";
import { Sora } from "next/font/google";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { motion, useReducedMotion } from "motion/react";
import { MitsyyLogo } from "./mitsyy-logo";
import styles from "./landing-hero.module.css";

const LISYY_IMAGE_URL =
  "https://mitsyy-bucket.s3.us-east-2.amazonaws.com/lizyy+sin+fonod.png";
const DASHBOARD_IMAGE_URL =
  "https://mitsyy-bucket.s3.us-east-2.amazonaws.com/dasborad.png";

const sora = Sora({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const easeOutCubicBezier = [0.16, 1, 0.3, 1] as const;

function useFadeUp(delay: number, reduceMotion: boolean) {
  if (reduceMotion) {
    return {
      initial: false as const,
      animate: undefined,
      transition: undefined,
    };
  }
  return {
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: easeOutCubicBezier },
  };
}

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

function AnimatedStudentCount({ reduceMotion }: { reduceMotion: boolean }) {
  const [count, setCount] = useState(780);

  useEffect(() => {
    if (reduceMotion) {
      setCount(1240);
      return;
    }

    setCount(780);
    const from = 780;
    const to = 1240;
    const duration = 1700;
    let start: number | null = null;
    let frame: number;

    const tick = (timestamp: number) => {
      if (start === null) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      setCount(Math.round(from + (to - from) * easeOutCubic(progress)));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reduceMotion]);

  return <strong>{count.toLocaleString("es-PE")}</strong>;
}

function ArrowRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 12h14M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M13 2 4 14h6l-1 8 9-12h-6l1-8z"
        fill="currentColor"
      />
    </svg>
  );
}

function FlameIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2c2 4-3 5-3 9 0 2 1.5 3.5 3 3.5s3-1.5 3-3.5c0-1.2-.5-2-1-2.5 1.5.5 3 2 3 5C17 17.5 14.5 21 12 21S7 17.5 7 13.5C7 9 11 7 12 2z"
        fill="currentColor"
      />
    </svg>
  );
}

const TRUST_AVATARS = [
  { letter: "D", gradient: "linear-gradient(135deg, #5C8C5C, #2D5A2D)" },
  { letter: "A", gradient: "linear-gradient(135deg, #A88B4A, #6B5A2D)" },
  { letter: "L", gradient: "linear-gradient(135deg, #5C7A8C, #2D4A5A)" },
  { letter: "M", gradient: "linear-gradient(135deg, #8C5C6B, #5A2D3A)" },
] as const;

const NAV_SECTIONS = [
  { href: "#producto", key: "navProduct" as const },
  { href: "#como-funciona", key: "navHowItWorks" as const },
  { href: "#testimonios", key: "navTestimonials" as const },
  { href: "#pricing", key: "navPricing" as const },
] as const;

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      {open ? (
        <path
          d="M6 6l12 12M18 6 6 18"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      ) : (
        <path
          d="M4 7h16M4 12h16M4 17h16"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

function HeroNavbar() {
  const t = useTranslations("landing");
  const menuId = useId();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    if (menuOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  useEffect(() => {
    const onResize = () => {
      if (window.matchMedia("(min-width: 880px)").matches) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={styles.navHeader}>
      <nav className={styles.navbar} aria-label="Navegación principal">
        <div className={styles.navStart}>
          <Link href="/" className={styles.navLogo} aria-label="Mitsyy">
            <MitsyyLogo priority navbar />
          </Link>

          <button
            type="button"
            className={styles.navMenuBtn}
            aria-expanded={menuOpen}
            aria-controls={menuId}
            aria-label={menuOpen ? t("navMenuClose") : t("navMenuOpen")}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <MenuIcon open={menuOpen} />
          </button>
        </div>

        <div className={styles.navLinks}>
          {NAV_SECTIONS.map(({ href, key }) => (
            <a key={href} href={href} className={styles.navLink}>
              {t(key)}
            </a>
          ))}
        </div>

        <div className={styles.navActions}>
          <Link
            href="/login"
            className={`${styles.navGhost} ${sora.className}`}
          >
            {t("signIn")}
          </Link>
          <Link
            href="/register"
            className={`${styles.navSolid} ${sora.className}`}
          >
            {t("createAccount")}
          </Link>
        </div>
      </nav>

      <div
        id={menuId}
        className={styles.navMobilePanel}
        data-open={menuOpen || undefined}
        hidden={!menuOpen}
        role="dialog"
        aria-modal="true"
        aria-label={t("navMenuLabel")}
      >
        <button
          type="button"
          className={styles.navMobileBackdrop}
          aria-label={t("navMenuClose")}
          tabIndex={menuOpen ? 0 : -1}
          onClick={closeMenu}
        />
        <div className={styles.navMobileSheet}>
          <nav className={styles.navMobileLinks} aria-label={t("navMenuLabel")}>
            {NAV_SECTIONS.map(({ href, key }) => (
              <a
                key={href}
                href={href}
                className={styles.navMobileLink}
                onClick={closeMenu}
              >
                {t(key)}
              </a>
            ))}
          </nav>
          <div className={styles.navMobileActions}>
            <Link
              href="/login"
              className={`${styles.navMobileGhost} ${sora.className}`}
              onClick={closeMenu}
            >
              {t("signIn")}
            </Link>
            <Link
              href="/register"
              className={`${styles.navMobileSolid} ${sora.className}`}
              onClick={closeMenu}
            >
              {t("createAccount")}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

export function LandingHero() {
  const reduceMotion = useReducedMotion() ?? false;
  const [lisyyClicked, setLisyyClicked] = useState(false);
  const [scrollHidden, setScrollHidden] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 8) {
        setScrollHidden(true);
        window.removeEventListener("scroll", onScroll);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLisyyClick = () => {
    setLisyyClicked(true);
    window.setTimeout(() => setLisyyClicked(false), 350);
  };

  return (
    <section className={styles.hero} aria-label="Presentación de Mitsyy">
      <div className={styles.bgLayer} aria-hidden>
        <div className={styles.gridBg} />
        <div className={`${styles.glow} ${styles.glow1}`} />
        <div className={`${styles.glow} ${styles.glow2}`} />
      </div>

      <HeroNavbar />

      <div className={styles.inner}>
        <div className={styles.leftCol}>
          <motion.span
            className={styles.eyebrow}
            {...useFadeUp(0, reduceMotion)}
          >
            <span className={styles.eyebrowDot} aria-hidden />
            Perú y LATAM · Gratis para empezar
          </motion.span>

          <h1 className={`${styles.title} ${sora.className}`}>
            <motion.span
              className={styles.titleLine}
              {...useFadeUp(0.08, reduceMotion)}
            >
              Organiza.
            </motion.span>
            <motion.span
              className={styles.titleLine}
              {...useFadeUp(0.12, reduceMotion)}
            >
              Estudia.
            </motion.span>
            <motion.span
              className={styles.titleLine}
              {...useFadeUp(0.16, reduceMotion)}
            >
              <span className={styles.titleHighlight}>Aprueba.</span>
            </motion.span>
          </h1>

          <motion.p
            className={styles.subtitle}
            {...useFadeUp(0.24, reduceMotion)}
          >
            Mitsyy es el asistente universitario que arma tu malla, entiende tus
            apuntes y te prepara para el parcial — con IA de verdad.
          </motion.p>

          <motion.div
            className={styles.ctaRow}
            {...useFadeUp(0.32, reduceMotion)}
          >
            <Link
              href="/register"
              className={`${styles.ctaPrimary} ${sora.className}`}
            >
              Crear cuenta gratis
            </Link>
            <a
              href="#como-funciona"
              className={`${styles.ctaGhost} ${sora.className}`}
            >
              Ver cómo funciona
              <ArrowRightIcon />
            </a>
          </motion.div>

          <motion.div
            className={styles.trust}
            {...useFadeUp(0.4, reduceMotion)}
          >
            <div className={styles.trustAvatars} aria-hidden>
              {TRUST_AVATARS.map(({ letter, gradient }) => (
                <span
                  key={letter}
                  className={`${styles.trustAvatar} ${sora.className}`}
                  style={{ background: gradient }}
                >
                  {letter}
                </span>
              ))}
            </div>
            <div className={styles.trustText}>
              <p className={styles.trustLine1}>
                <span className={sora.className}>
                  <AnimatedStudentCount reduceMotion={reduceMotion} />
                </span>{" "}
                estudiantes ya estudian con Lisyy
              </p>
              <p className={styles.trustLine2}>
                UPC · UNMSM · PUCP · UNI · UNSA
              </p>
            </div>
          </motion.div>
        </div>

        <motion.div
          className={styles.rightCol}
          initial={
            reduceMotion ? false : { opacity: 0, x: 24, scale: 0.97 }
          }
          animate={
            reduceMotion ? undefined : { opacity: 1, x: 0, scale: 1 }
          }
          transition={
            reduceMotion
              ? undefined
              : { duration: 0.9, delay: 0.2, ease: easeOutCubicBezier }
          }
        >
          <div className={styles.dashboardWrap}>
            <Image
              src={DASHBOARD_IMAGE_URL}
              alt="Vista del dashboard de Mitsyy"
              width={1280}
              height={800}
              className={styles.dashboardImg}
              unoptimized
              priority
            />
          </div>

          <div className={`${styles.speech} ${sora.className}`}>
            Tu <strong>compañera de carrera</strong>
          </div>

          <button
            type="button"
            className={`${styles.lisyy} ${lisyyClicked ? styles.lisyyClicked : ""}`}
            onClick={handleLisyyClick}
            aria-label="Lisyy, tu compañera de carrera"
          >
            <Image
              src={LISYY_IMAGE_URL}
              alt=""
              width={230}
              height={230}
              unoptimized
              priority
              className={styles.lisyyImg}
            />
          </button>

          <div className={`${styles.chip} ${styles.chipXp}`}>
            <span className={`${styles.chipIcon} ${styles.chipIconXp}`}>
              <BoltIcon />
            </span>
            <span>
              +<strong className={sora.className}>500</strong> XP esta semana
            </span>
          </div>

          <div className={`${styles.chip} ${styles.chipStreak}`}>
            <span className={`${styles.chipIcon} ${styles.chipIconStreak}`}>
              <FlameIcon />
            </span>
            <span>
              Racha de <strong className={sora.className}>7 días</strong>
            </span>
          </div>
        </motion.div>
      </div>

      {!scrollHidden ? (
        <div className={styles.scrollCue} aria-hidden>
          <span className={styles.scrollLine} />
          <span className={`${styles.scrollLabel} ${sora.className}`}>
            scroll
          </span>
        </div>
      ) : null}
    </section>
  );
}
