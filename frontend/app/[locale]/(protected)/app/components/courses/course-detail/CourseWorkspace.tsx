"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/app/providers/auth-provider";
import { getCourseFiles, type MockCourseExtended } from "../../../lib/mock-course-data";
import { useCourseNotes } from "../../../lib/course-notes-store";
import { useStudyBackendLink } from "../../../lib/study-backend-link";
import { StudentTasksProvider, useStudentTasks } from "../../../tasks/context/student-tasks-context";
import { CourseAiDrawer } from "./CourseAiDrawer";
import { CourseAiFab } from "./CourseAiFab";
import { CourseDetailHeaderRedesign } from "./CourseDetailHeaderRedesign";
import { CourseDetailTabBar, type CourseTabId } from "./CourseDetailTabBar";
import { ApuntesTab } from "./tabs/ApuntesTab";
import { ArchivosTab } from "./tabs/ArchivosTab";
import { ClasesTab } from "./tabs/ClasesTab";
import { FlashcardsTab } from "./tabs/FlashcardsTab";
import { QuizzesTab } from "./tabs/QuizzesTab";
import { TareasTab } from "./tabs/TareasTab";

const TAB_MOTION = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.15 },
};

const IA_EASE = "[transition-timing-function:cubic-bezier(0.16,1,0.3,1)]";

interface CourseWorkspaceProps {
  course: MockCourseExtended;
}

function CourseWorkspaceInner({ course }: CourseWorkspaceProps) {
  const { token } = useAuth();
  const { ensureCourse } = useStudyBackendLink(token);
  const { getTasksForCourse } = useStudentTasks();
  const [tabActivo, setTabActivo] = useState<CourseTabId>("apuntes");
  const [panelIA, setPanelIA] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  useEffect(() => {
    void ensureCourse(course);
  }, [course, ensureCourse]);

  const notes = useCourseNotes(course.id);
  const courseTasks = getTasksForCourse(course.id);
  const files = useMemo(() => getCourseFiles(course.id), [course.id]);

  const stats = useMemo(() => {
    const tareasCompletadas = courseTasks.filter((t) => t.status === "done").length;
    return {
      apuntes: notes.length,
      archivos: files.length,
      flashcards: 0,
      tareasCompletadas,
    };
  }, [notes.length, files.length, courseTasks]);

  return (
    <>
      <div
        className={cn(
          "flex w-full min-w-0 flex-col text-[var(--app-fg)] lg:flex-row lg:items-stretch",
          panelIA && "lg:gap-0",
        )}
      >
        <div
          className={cn(
            "min-w-0 flex-1 transition-[max-width] duration-[280ms] lg:max-w-none",
            IA_EASE,
            panelIA ? "lg:max-w-[calc(100%-380px)]" : "lg:max-w-full",
          )}
        >
          <CourseDetailHeaderRedesign course={course} stats={stats} />

          <CourseDetailTabBar course={course} tabActivo={tabActivo} onTabChange={setTabActivo} />

          <div className="mt-6 min-h-[320px]">
            <AnimatePresence mode="wait">
              <motion.div key={tabActivo} {...TAB_MOTION}>
                {tabActivo === "apuntes" && (
                  <ApuntesTab
                    course={course}
                    selectedNoteId={selectedNoteId}
                    onSelectNote={setSelectedNoteId}
                  />
                )}
                {tabActivo === "clases" && <ClasesTab course={course} />}
                {tabActivo === "tareas" && <TareasTab course={course} />}
                {tabActivo === "archivos" && <ArchivosTab course={course} files={files} />}
                {tabActivo === "flashcards" && <FlashcardsTab course={course} />}
                {tabActivo === "quizzes" && <QuizzesTab course={course} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {panelIA ? (
          <button
            type="button"
            className="fixed inset-0 z-[120] bg-black/50 lg:hidden"
            aria-label="Cerrar asistente"
            onClick={() => setPanelIA(false)}
          />
        ) : null}

        <div
          className={cn(
            "z-[130] flex max-h-[100dvh] w-[380px] max-w-[100vw] shrink-0 flex-col transition-[transform,width] duration-[280ms]",
            IA_EASE,
            "fixed inset-y-0 right-0 lg:static lg:inset-auto lg:h-auto lg:max-h-none",
            panelIA
              ? "translate-x-0"
              : "pointer-events-none translate-x-full lg:translate-x-0 lg:pointer-events-none",
            panelIA ? "lg:w-[380px] lg:overflow-visible" : "lg:w-0 lg:overflow-hidden",
          )}
        >
          <CourseAiDrawer open={panelIA} onClose={() => setPanelIA(false)} courseName={course.name} />
        </div>
      </div>

      <CourseAiFab panelOpen={panelIA} onToggle={() => setPanelIA((p) => !p)} />
    </>
  );
}

export function CourseWorkspace({ course }: CourseWorkspaceProps) {
  return (
    <StudentTasksProvider>
      <CourseWorkspaceInner course={course} />
    </StudentTasksProvider>
  );
}
