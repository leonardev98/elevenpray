"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { getCourseAccentStyles } from "../../lib/course-styles";
import {
  getCourseFiles,
  getCourseNotes,
  getCourseQuizzes,
  getCourseTasks,
  type MockCourseExtended,
  type MockCourseNote,
} from "../../lib/mock-course-data";
import { CourseFilesTab } from "./CourseFilesTab";
import { CourseNotesTab } from "./CourseNotesTab";
import { CourseQuizzesTab } from "./CourseQuizzesTab";
import { CourseTasksTab } from "./CourseTasksTab";
import { NoteDrawer } from "./NoteDrawer";

const TAB_MOTION = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.15 },
};

interface CourseTabsProps {
  course: MockCourseExtended;
}

export function CourseTabs({ course }: CourseTabsProps) {
  const t = useTranslations("studentCourses");
  const styles = getCourseAccentStyles(course.accent);
  const notes = getCourseNotes(course.id);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  const selectedNote: MockCourseNote | null =
    notes.find((n) => n.id === selectedNoteId) ?? null;

  const triggerClass = cn(
    "rounded-none border-b-2 border-transparent bg-transparent px-4 py-3 shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none",
    styles.tabActive,
  );

  return (
    <>
      <Tabs defaultValue="notes" className="w-full">
        <TabsList className="mb-6 h-auto w-full justify-start gap-0 rounded-none border-b border-[var(--app-border)] bg-transparent p-0">
          <TabsTrigger value="notes" className={triggerClass}>
            {t("tabNotes")}
          </TabsTrigger>
          <TabsTrigger value="tasks" className={triggerClass}>
            {t("tabTasks")}
          </TabsTrigger>
          <TabsTrigger value="files" className={triggerClass}>
            {t("tabFiles")}
          </TabsTrigger>
          <TabsTrigger value="quizzes" className={triggerClass}>
            {t("tabQuizzes")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notes" className="mt-0 focus-visible:outline-none">
          <motion.div {...TAB_MOTION}>
            <CourseNotesTab notes={notes} onSelectNote={setSelectedNoteId} />
          </motion.div>
        </TabsContent>
        <TabsContent value="tasks" className="mt-0 focus-visible:outline-none">
          <motion.div {...TAB_MOTION}>
            <CourseTasksTab initialTasks={getCourseTasks(course.id)} />
          </motion.div>
        </TabsContent>
        <TabsContent value="files" className="mt-0 focus-visible:outline-none">
          <motion.div {...TAB_MOTION}>
            <CourseFilesTab files={getCourseFiles(course.id)} />
          </motion.div>
        </TabsContent>
        <TabsContent value="quizzes" className="mt-0 focus-visible:outline-none">
          <motion.div {...TAB_MOTION}>
            <CourseQuizzesTab quizzes={getCourseQuizzes(course.id)} />
          </motion.div>
        </TabsContent>
      </Tabs>

      <NoteDrawer note={selectedNote} onClose={() => setSelectedNoteId(null)} />
    </>
  );
}
