"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../../../../../providers/auth-provider";
import { getWorkspace } from "../../../../../../lib/workspaces-api";
import type { WorkspaceApi } from "../../../../../../lib/workspaces-api";
import { FaceMap } from "@/components/skincare/face-map/FaceMap";

export default function WorkspaceFacePage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.id as string;
  const { token } = useAuth();
  const [workspace, setWorkspace] = useState<WorkspaceApi | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !workspaceId) return;
    getWorkspace(token, workspaceId)
      .then(setWorkspace)
      .catch(() => setWorkspace(null))
      .finally(() => setLoading(false));
  }, [token, workspaceId]);

  useEffect(() => {
    if (loading || !workspace) return;
    if (workspace.workspaceType !== "skincare") {
      router.replace(`/dashboard/workspaces/${workspaceId}`);
    }
  }, [loading, workspace, workspaceId, router]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="app-loading-spinner" aria-hidden />
        <span className="sr-only">Cargando mapa facial…</span>
      </div>
    );
  }

  if (!workspace || workspace.workspaceType !== "skincare") {
    return null;
  }

  return (
    <FaceMap workspaceId={workspaceId} token={token} />
  );
}
