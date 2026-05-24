"use client";

import { Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface CourseAiFabProps {
  panelOpen: boolean;
  onToggle: () => void;
}

export function CourseAiFab({ panelOpen, onToggle }: CourseAiFabProps) {
  return (
    <div className="group/fab pointer-events-auto fixed bottom-7 right-7 z-50">
      {!panelOpen ? (
        <span
          className={cn(
            "pointer-events-none absolute right-full top-1/2 mr-2 -translate-y-1/2 translate-x-1 whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium text-white opacity-0 transition-all duration-150 ease-out",
            "bg-zinc-800",
            "group-hover/fab:translate-x-0 group-hover/fab:opacity-100",
          )}
          aria-hidden
        >
          Asistente IA
        </span>
      ) : null}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={panelOpen}
        aria-label={panelOpen ? "Cerrar asistente IA" : "Abrir asistente IA"}
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-full text-white shadow-[0_4px_20px_rgba(13,148,136,0.4)] transition-[transform,box-shadow] duration-150 ease-out",
          "hover:scale-[1.08] hover:shadow-[0_6px_28px_rgba(13,148,136,0.55)] active:scale-100",
        )}
        style={{
          background: "linear-gradient(135deg, #0D9488 0%, #0A7A70 100%)",
        }}
      >
        <span className="relative grid h-[22px] w-[22px] place-items-center">
          <Sparkles
            className={cn(
              "col-start-1 row-start-1 h-[22px] w-[22px] text-white transition-all duration-200 ease-out",
              panelOpen ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100",
            )}
            aria-hidden
          />
          <X
            className={cn(
              "col-start-1 row-start-1 h-[22px] w-[22px] text-white transition-all duration-200 ease-out",
              panelOpen ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0",
            )}
            aria-hidden
          />
        </span>
      </button>
    </div>
  );
}
