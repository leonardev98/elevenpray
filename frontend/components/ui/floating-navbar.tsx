"use client";
import React, { useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "motion/react";
import { cn } from "@/lib/utils";

type NavItem = { name: string; link: string; icon?: React.ReactNode };
type LinkComponent = React.ComponentType<{
  href: string;
  children: React.ReactNode;
  className?: string;
}>;

export const FloatingNav = ({
  navItems,
  className,
  logo,
  rightContent,
  alwaysVisible = false,
  linkComponent,
}: {
  navItems: NavItem[];
  className?: string;
  logo?: React.ReactNode;
  rightContent?: React.ReactNode;
  alwaysVisible?: boolean;
  linkComponent?: LinkComponent;
}) => {
  const { scrollYProgress } = useScroll();
  const [visible, setVisible] = useState(alwaysVisible);

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

  const bar = (
    <div
      className={cn(
        "flex items-center justify-center gap-2 rounded-full border px-2 py-1.5 shadow-lg backdrop-blur-md",
        "border-[var(--app-border)] bg-[var(--app-bg)]/90 shadow-black/10 dark:bg-[var(--app-surface)]/95 dark:border-white/10"
      )}
      style={{ fontFamily: "var(--font-montserrat), system-ui, sans-serif" }}
    >
      {logo ? <div className="flex items-center pr-2">{logo}</div> : null}
      {logo && navItems.length > 0 ? (
        <div className="h-5 w-px bg-[var(--app-border)] dark:bg-white/10" />
      ) : null}
      <div className="flex items-center gap-1">
        {navItems.map((navItem, idx: number) => {
          const isInternal = navItem.link.startsWith("/");
          const Comp = linkComponent && isInternal ? linkComponent : "a";
          const href = isInternal && Comp === "a" ? undefined : navItem.link;
          const child = (
            <>
              <span className="block sm:hidden">{navItem.icon}</span>
              <span className="hidden sm:block">{navItem.name}</span>
            </>
          );
          const cls = cn(
            "relative flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium transition-colors",
            "text-[var(--app-fg)]/80 hover:bg-[var(--app-fg)]/10 hover:text-[var(--app-fg)] dark:hover:bg-white/10 dark:hover:text-[var(--app-fg)]"
          );
          if (Comp === "a") {
            return (
              <a key={`link-${idx}`} href={navItem.link} className={cls}>
                {child}
              </a>
            );
          }
          return (
            <Comp key={`link-${idx}`} href={navItem.link} className={cls}>
              {child}
            </Comp>
          );
        })}
      </div>
      {(rightContent || navItems.length > 0) && (
        <div className="h-5 w-px bg-[var(--app-border)] dark:bg-white/10" />
      )}
      {rightContent ? (
        <div className="flex items-center gap-1">{rightContent}</div>
      ) : (
        <a
          href="/login"
          className="relative rounded-full bg-[var(--app-fg)] px-4 py-2 text-sm font-medium text-[var(--app-bg)] transition-all hover:opacity-90 dark:bg-white dark:text-[var(--app-black)]"
        >
          Login
        </a>
      )}
    </div>
  );

  if (alwaysVisible) {
    return (
      <div
        className={cn(
          "flex fixed top-6 left-0 right-0 z-[5000] items-center justify-center px-4",
          className
        )}
      >
        {bar}
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 1, y: -100 }}
        animate={{ y: visible ? 0 : -100, opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "flex max-w-fit fixed top-6 inset-x-0 mx-auto z-[5000] items-center justify-center",
          className
        )}
      >
        {bar}
      </motion.div>
    </AnimatePresence>
  );
};
