"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "../../../providers/auth-provider";
import { useTranslations } from "next-intl";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token, user, isLoading } = useAuth();
  const router = useRouter();
  const t = useTranslations("common");

  useEffect(() => {
    if (isLoading) return;
    if (!token || !user) {
      router.replace("/login");
    }
  }, [isLoading, token, user, router]);

  if (isLoading || !token || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--app-bg)]">
        <p className="text-[var(--app-fg)]/60">{t("loading")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--app-bg)]">
      {children}
    </div>
  );
}
