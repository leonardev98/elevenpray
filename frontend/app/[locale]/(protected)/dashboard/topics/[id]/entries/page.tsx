"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TopicEntriesRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);
  return (
    <div className="flex items-center justify-center p-8">
      <p className="text-[var(--app-fg)]/60">Redirigiendo al dashboard…</p>
    </div>
  );
}
