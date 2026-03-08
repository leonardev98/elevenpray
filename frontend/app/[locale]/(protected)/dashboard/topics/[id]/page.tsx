"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

export default function TopicDetailRedirectPage() {
  const router = useRouter();
  const t = useTranslations("dashboard");
  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);
  return (
    <div className="flex items-center justify-center p-8">
      <p className="text-[var(--app-fg)]/60">{t("redirecting")}</p>
    </div>
  );
}
