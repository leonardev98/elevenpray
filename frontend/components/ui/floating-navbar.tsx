"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Menu, X } from "lucide-react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "motion/react";
import { cn } from "@/lib/utils";

type NavItem = {
  name: string;
  link: string;
  icon?: React.ReactNode;
  ariaLabel?: string;
};
type LinkComponent = React.ComponentType<{
  href: string;
  children: React.ReactNode;
  className?: string;
  "aria-label"?: string;
  onClick?: () => void;
}>;

const mobileMenuBtnClass = (open: boolean) =>
  cn(
    "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition",
    open
      ? "border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)]"
      : "border-[var(--border)] bg-[var(--bg-base)] text-[var(--text-primary)] hover:bg-[var(--accent-subtle)]"
  );

const MobileNavCloseContext = React.createContext<(() => void) | null>(null);

export function useMobileNavClose() {
  return React.useContext(MobileNavCloseContext);
}

export const FloatingNav = ({
  navItems,
  className,
  logo,
  rightContent,
  mobileMenuFooter,
  alwaysVisible = false,
  linkComponent,
  mobileMenuOpenLabel = "Open menu",
  mobileMenuCloseLabel = "Close menu",
}: {
  navItems: NavItem[];
  className?: string;
  logo?: React.ReactNode;
  rightContent?: React.ReactNode;
  mobileMenuFooter?: React.ReactNode;
  alwaysVisible?: boolean;
  linkComponent?: LinkComponent;
  mobileMenuOpenLabel?: string;
  mobileMenuCloseLabel?: string;
}) => {
  const { scrollYProgress } = useScroll();
  const [visible, setVisible] = useState(alwaysVisible);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useMotionValueEvent(scrollYProgress, "change", (current) => {
    if (alwaysVisible) {
      setVisible(true);
      return;
    }
    if (typeof current === "number") {
      const direction = current - scrollYProgress.getPrevious()!;
      if (scrollYProgress.get() < 0.05) {
        setVisible(false);
      } else {
        setVisible(direction < 0);
      }
    }
  });

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  useEffect(() => {
    const onResize = () => {
      if (window.matchMedia("(min-width: 768px)").matches) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    if (menuOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  const renderNavLink = (navItem: NavItem, idx: number, mobile = false) => {
    const isHash = navItem.link.startsWith("#");
    const isInternal = navItem.link.startsWith("/") && !isHash;
    const Comp = linkComponent && isInternal ? linkComponent : "a";
    const label = navItem.ariaLabel ?? navItem.name;
    const cls = cn(
      mobile
        ? "flex min-h-12 w-full items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition-colors active:scale-[0.99]"
        : "relative flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium transition-colors",
      "text-[var(--text-body)] hover:bg-[var(--accent-subtle)] hover:text-[var(--text-primary)]"
    );
    const child = mobile ? (
      <>
        {navItem.icon ? (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-subtle)] text-[var(--accent)] [&_svg]:h-5 [&_svg]:w-5">
            {navItem.icon}
          </span>
        ) : null}
        <span>{navItem.name}</span>
      </>
    ) : (
      <span>{navItem.name}</span>
    );

    const clickProps = mobile ? { onClick: closeMenu } : {};

    if (Comp === "a") {
      return (
        <a key={`link-${idx}`} href={navItem.link} className={cls} aria-label={label} {...clickProps}>
          {child}
        </a>
      );
    }
    return (
      <Comp
        key={`link-${idx}`}
        href={navItem.link}
        className={cls}
        aria-label={label}
        {...clickProps}
      >
        {child}
      </Comp>
    );
  };

  const desktopBar = (
    <div
      className={cn(
        "hidden items-center gap-2 rounded-full border px-3 py-2 shadow-lg backdrop-blur-md md:flex",
        "border-[var(--border)] bg-[var(--bg-surface)]/95 shadow-[var(--shadow-md)]"
      )}
      style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
    >
      {logo ? <div className="flex items-center py-0.5 pr-2">{logo}</div> : null}
      {logo && navItems.length > 0 ? (
        <div className="h-5 w-px bg-[var(--border)]" aria-hidden />
      ) : null}
      <nav className="flex items-center gap-0.5" aria-label="Main">
        {navItems.map((item, idx) => renderNavLink(item, idx, false))}
      </nav>
      {rightContent ? (
        <>
          <div className="h-5 w-px bg-[var(--border)]" aria-hidden />
          <div className="flex items-center gap-1.5">{rightContent}</div>
        </>
      ) : (
        <>
          <div className="h-5 w-px bg-[var(--border)]" aria-hidden />
          <a
            href="/login"
            className="flex items-center justify-center rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-fg)] transition-all hover:opacity-90"
          >
            Login
          </a>
        </>
      )}
    </div>
  );

  const renderMobileMenuToggle = () => (
    <button
      type="button"
      className={mobileMenuBtnClass(menuOpen)}
      onClick={() => setMenuOpen((o) => !o)}
      aria-expanded={menuOpen}
      aria-controls="mobile-nav-panel"
      aria-label={menuOpen ? mobileMenuCloseLabel : mobileMenuOpenLabel}
    >
      {menuOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
    </button>
  );

  const mobileMenuPortal =
    mounted
      ? createPortal(
          <AnimatePresence>
            {menuOpen ? (
              <div className="md:hidden">
                <motion.button
                  type="button"
                  key="backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 z-[5200] bg-[var(--text-primary)]/45"
                  aria-label={mobileMenuCloseLabel}
                  onClick={closeMenu}
                />
                <motion.div
                  key="panel"
                  id="mobile-nav-panel"
                  role="dialog"
                  aria-modal="true"
                  aria-label={mobileMenuOpenLabel}
                  initial={{ y: "-100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "-100%" }}
                  transition={{ type: "spring", damping: 32, stiffness: 380 }}
                  className="fixed inset-x-0 top-0 z-[5201] flex max-h-[100dvh] flex-col bg-[var(--bg-surface)] shadow-[var(--shadow-md)] pt-[env(safe-area-inset-top)]"
                  style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
                >
                  <div className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-[var(--border)] px-4">
                    <div className="min-w-0 shrink">{logo}</div>
                    {renderMobileMenuToggle()}
                  </div>
                  <MobileNavCloseContext.Provider value={closeMenu}>
                    <nav
                      className="flex flex-1 flex-col gap-1 overflow-y-auto overscroll-contain px-4 py-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
                      aria-label="Main"
                    >
                      {navItems.map((item, idx) => renderNavLink(item, idx, true))}
                      {(mobileMenuFooter ?? rightContent) ? (
                        <div className="mt-4 flex flex-col gap-3 border-t border-[var(--border)] pt-4">
                          {mobileMenuFooter ?? rightContent}
                        </div>
                      ) : null}
                    </nav>
                  </MobileNavCloseContext.Provider>
                </motion.div>
              </div>
            ) : null}
          </AnimatePresence>,
          document.body
        )
      : null;

  const mobileHeader = (
    <>
      <header
        className={cn(
          "fixed left-0 right-0 z-[5100] border-b border-[var(--border)] bg-[var(--bg-surface)] md:hidden",
          "pt-[env(safe-area-inset-top)]",
          menuOpen && "pointer-events-none invisible"
        )}
        style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
      >
        <div className="flex h-14 items-center justify-between gap-3 px-4">
          <div className="min-w-0 shrink">{logo}</div>
          {renderMobileMenuToggle()}
        </div>
      </header>
      {mobileMenuPortal}
    </>
  );

  if (alwaysVisible) {
    return (
      <div className={className}>
        {mobileHeader}
        <div
          className={cn(
            "fixed left-0 right-0 z-[5050] hidden items-center justify-center px-4 md:flex",
            "top-[max(1.25rem,env(safe-area-inset-top))]"
          )}
        >
          {desktopBar}
        </div>
      </div>
    );
  }

  return (
    <>
      {mobileHeader}
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 1, y: -100 }}
          animate={{ y: visible ? 0 : -100, opacity: visible ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "fixed inset-x-0 z-[5050] mx-auto hidden max-w-fit items-center justify-center md:flex",
            "top-[max(1.25rem,env(safe-area-inset-top))]",
            className
          )}
        >
          {desktopBar}
        </motion.div>
      </AnimatePresence>
    </>
  );
};
