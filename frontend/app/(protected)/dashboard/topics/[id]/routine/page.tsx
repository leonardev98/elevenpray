"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TopicRoutineRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard/routines");
  }, [router]);
  return (
    <div className="flex items-center justify-center p-8">
      <p className="text-[var(--app-fg)]/60">Redirigiendo a rutinas…</p>
    </div>
  );
}
