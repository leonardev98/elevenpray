"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

export default function TopicRoutineRedirectPage() {
  const router = useRouter();
  const t = useTranslations("routines");
  useEffect(() => {
    router.replace("/dashboard/routines");
  }, [router]);
  return (
    <div className="flex items-center justify-center p-8">
      <p className="text-[var(--app-fg)]/60">{t("redirecting")}</p>
    </div>
  );
}
