"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/app/providers/auth-provider";
import { isStudentOnboardingComplete } from "@/app/lib/auth-api";
import { saveStudentProfile } from "../lib/student-storage";

export function RedirectToStudentOnboarding({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const tCommon = useTranslations("common");
  const { user, isLoading } = useAuth();
  const [ready, setReady] = useState(false);

  const needsOnboarding = !!user && !isStudentOnboardingComplete(user);

  useEffect(() => {
    if (isLoading) return;
    setReady(true);
    if (user?.studentProfile) {
      saveStudentProfile(
        {
          name: user.name,
          university: user.studentProfile.university,
          career: user.studentProfile.career,
          cycle: user.studentProfile.cycle,
        },
        user.id,
      );
    }
    if (needsOnboarding) {
      router.replace("/onboarding");
    }
  }, [isLoading, user, needsOnboarding, router]);

  if (isLoading || !ready) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-[var(--app-fg)]/60">{tCommon("loading")}</p>
      </div>
    );
  }

  if (needsOnboarding && !pathname?.startsWith("/onboarding")) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-[var(--app-fg)]/60">{tCommon("loading")}</p>
      </div>
    );
  }

  return <>{children}</>;
}
