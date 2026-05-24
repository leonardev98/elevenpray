"use client";

import { Download, File, FileText, Image as ImageIcon, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { courseHex } from "../course-detail-utils";
import type { MockCourseExtended, MockCourseFile } from "../../../../lib/mock-course-data";

interface ArchivosTabProps {
  course: MockCourseExtended;
  files: MockCourseFile[];
}

function FileBigIcon({ type }: { type: MockCourseFile["type"] }) {
  if (type === "pdf") return <FileText className="h-10 w-10 text-red-400" aria-hidden />;
  if (type === "image") return <ImageIcon className="h-10 w-10 text-sky-400" aria-hidden />;
  return <File className="h-10 w-10 text-zinc-400" aria-hidden />;
}

export function ArchivosTab({ course, files }: ArchivosTabProps) {
  const hex = courseHex(course);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xs font-medium uppercase tracking-wider text-zinc-500">Archivos del curso</h2>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-zinc-200"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden />
          Subir archivo
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {files.map((file) => (
          <div
            key={file.id}
            className={cn(
              "flex flex-col rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 transition-all duration-150",
              "hover:-translate-y-0.5 hover:border-l-[3px]",
            )}
            style={{ borderLeftColor: hex }}
          >
            <div className="mb-3 flex justify-center">
              <FileBigIcon type={file.type} />
            </div>
            <p className="truncate text-center text-sm font-semibold text-white">{file.name}</p>
            <p className="mt-1 text-center text-xs text-zinc-500">
              {file.size} · {file.uploadedAt}
            </p>
            {file.classLabel ? (
              <span className="mt-3 self-center rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400">
                {file.classLabel}
              </span>
            ) : null}
            <button
              type="button"
              className="mt-4 inline-flex items-center justify-center gap-1 rounded-lg border border-zinc-700 py-2 text-xs text-zinc-300 hover:border-zinc-500"
            >
              <Download className="h-3.5 w-3.5" aria-hidden />
              Descargar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
