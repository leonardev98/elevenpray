"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";

const LEGACY_PREFIXES = [
  "/dashboard",
  "/workspace/developer",
  "/workspace/university",
  "/dashboard/topics",
];

export function RedirectLegacyRoutes({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!pathname) return;
    const isLegacy = LEGACY_PREFIXES.some(
      (p) => pathname === p || pathname.startsWith(`${p}/`),
    );
    if (isLegacy) {
      router.replace("/app");
    }
  }, [pathname, router]);

  return <>{children}</>;
}
