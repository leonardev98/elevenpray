"use client";

import { Link } from "@/i18n/navigation";
import { useMobileNavClose } from "@/components/ui/floating-navbar";
import { cn } from "@/lib/utils";

type LandingMobileNavLinkProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
};

export function LandingMobileNavLink({
  href,
  children,
  variant = "secondary",
  className,
}: LandingMobileNavLinkProps) {
  const close = useMobileNavClose();

  return (
    <Link
      href={href}
      onClick={() => close?.()}
      className={cn(
        "flex min-h-11 w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium transition active:scale-[0.99]",
        variant === "primary"
          ? "bg-[var(--accent)] text-[var(--accent-fg)] shadow-[var(--shadow-sm)]"
          : "border border-[var(--border)] bg-[var(--bg-base)] text-[var(--text-primary)]",
        className
      )}
    >
      {children}
    </Link>
  );
}
