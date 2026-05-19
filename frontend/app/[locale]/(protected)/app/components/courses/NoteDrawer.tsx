"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import type { MockCourseNote } from "../../lib/mock-course-data";

interface NoteDrawerProps {
  note: MockCourseNote | null;
  onClose: () => void;
}

export function NoteDrawer({ note, onClose }: NoteDrawerProps) {
  const t = useTranslations("studentCourses");

  return (
    <AnimatePresence>
      {note && (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[110] bg-black/50 lg:hidden"
            aria-label={t("close")}
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed right-0 top-0 z-[115] flex h-full w-full flex-col border-l border-[var(--app-border)] bg-[var(--app-surface)] shadow-app-modal sm:w-[40%]"
          >
            <div className="flex items-center justify-between border-b border-[var(--app-border)] px-5 py-4">
              <h2 className="truncate pr-4 text-lg font-semibold text-[var(--app-fg)]">
                {note.title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 rounded-lg p-1.5 text-[var(--app-fg-secondary)] hover:bg-[var(--app-surface-elevated)]"
                aria-label={t("close")}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <textarea
                defaultValue={note.body}
                className="h-full min-h-[280px] w-full resize-none border-0 bg-transparent text-sm leading-relaxed text-[var(--app-fg)] outline-none placeholder:text-[var(--app-fg-muted)]"
                placeholder={note.title}
              />
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
