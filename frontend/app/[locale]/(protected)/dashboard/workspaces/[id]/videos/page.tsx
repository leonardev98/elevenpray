"use client";

import { useParams } from "next/navigation";
import Link from "next/link";

export default function WorkspaceVideosPage() {
  const params = useParams();
  const workspaceId = params.id as string;
  const base = `/dashboard/workspaces/${workspaceId}`;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--app-fg)]">
        Vídeos
      </h1>
      <p className="text-[var(--app-fg)]/70">
        Guías en vídeo: rutina mañana y noche, retinol, acné y más.
      </p>
      <div className="rounded-2xl border border-dashed border-[var(--app-border)] bg-[var(--app-surface)] p-8 text-center">
        <p className="text-sm text-[var(--app-fg)]/50">
          Los vídeos se mostrarán aquí cuando estén disponibles.
        </p>
      </div>
      <Link
        href={base}
        className="inline-block text-sm font-medium text-[var(--app-navy)] hover:underline"
      >
        Volver al overview
      </Link>
    </div>
  );
}
