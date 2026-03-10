"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../../../../../providers/auth-provider";
import { getRoutineTemplatesByWorkspace } from "../../../../../../lib/workspaces-api";
import { RoutineLoadingState } from "../../../components/routine-loading-state";

export default function WorkspaceRoutinePage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.id as string;
  const { token } = useAuth();
  const [status, setStatus] = useState<"loading" | "redirect" | "error">("loading");

  useEffect(() => {
    if (!token || !workspaceId) return;
    getRoutineTemplatesByWorkspace(token, workspaceId)
      .then((templates: unknown[]) => {
        const list = templates as { year: number; weekNumber: number; id: string }[];
        const template = list.find((r) => r.year === 0 && r.weekNumber === 0);
        if (template) {
          setStatus("redirect");
          router.replace(`/dashboard/routines/${template.id}`);
        } else {
          setStatus("error");
        }
      })
      .catch(() => setStatus("error"));
  }, [token, workspaceId, router]);

  if (status === "loading") {
    return <RoutineLoadingState />;
  }

  if (status === "error") {
    return (
      <div className="p-6">
        <p className="text-red-500">No se encontró la plantilla de rutina para este workspace.</p>
        <button
          type="button"
          onClick={() => router.back()}
          className="mt-4 rounded-lg border border-[var(--app-border)] px-3 py-2 text-sm text-[var(--app-fg)]"
        >
          Volver
        </button>
      </div>
    );
  }

  return <RoutineLoadingState />;
}
