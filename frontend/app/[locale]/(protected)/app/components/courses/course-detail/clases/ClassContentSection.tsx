"use client";

import type { JSONContent } from "@tiptap/core";
import { NotebookPen } from "lucide-react";
import { MiniEditor } from "../editor/MiniEditor";

interface ClassContentSectionProps {
  classId: string;
  contentJson: JSONContent | null;
  onChange: (next: JSONContent) => void;
}

export function ClassContentSection({ classId, contentJson, onChange }: ClassContentSectionProps) {
  return (
    <section className="space-y-3">
      <SectionHeader title="Contenido de la clase" subtitle="Tus apuntes de esta sesión" icon={NotebookPen} />
      <MiniEditor
        editorKey={classId}
        contentJson={contentJson}
        onChange={onChange}
        placeholder="Escribe los temas vistos, ejemplos y observaciones de la clase…"
      />
    </section>
  );
}

function SectionHeader({
  title,
  subtitle,
  icon: Icon,
}: {
  title: string;
  subtitle?: string;
  icon: typeof NotebookPen;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-7 w-7 items-center justify-center rounded-md border-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-muted)]">
        <Icon className="h-3.5 w-3.5" aria-hidden />
      </span>
      <div>
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h3>
        {subtitle ? <p className="text-[11px] text-[var(--text-muted)]">{subtitle}</p> : null}
      </div>
    </div>
  );
}
