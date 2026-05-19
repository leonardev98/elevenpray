"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { getCoursesForList } from "../lib/mock-course-data";
import { AddCourseModal } from "../components/courses/AddCourseModal";
import { CourseCard } from "../components/courses/CourseCard";
import { CoursesEmptyState } from "../components/courses/CoursesEmptyState";
import { StudentPageShell } from "../components/StudentPageShell";

export default function StudentCoursesPage() {
  const t = useTranslations("studentCourses");
  const courses = getCoursesForList();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <StudentPageShell>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
      >
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-semibold text-[var(--app-fg)] lg:text-3xl">
            {t("title")}
          </h1>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--app-primary)] px-5 py-2.5 text-sm font-semibold text-[var(--app-bg)] transition hover:bg-[var(--app-primary-hover)]"
          >
            <Plus className="h-4 w-4" />
            {t("addCourse")}
          </button>
        </header>

        {courses.length === 0 ? (
          <CoursesEmptyState onAddCourse={() => setModalOpen(true)} />
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </motion.div>

      <AddCourseModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </StudentPageShell>
  );
}
