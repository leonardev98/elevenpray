"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { hasStudentProfile } from "../lib/student-storage";

export function RedirectToStudentOnboarding({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const tCommon = useTranslations("common");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
    if (!hasStudentProfile()) {
      router.replace("/onboarding");
    }
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-[var(--app-fg)]/60">{tCommon("loading")}</p>
      </div>
    );
  }

  if (!hasStudentProfile() && !pathname?.startsWith("/onboarding")) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-[var(--app-fg)]/60">{tCommon("loading")}</p>
      </div>
    );
  }

  return <>{children}</>;
}
