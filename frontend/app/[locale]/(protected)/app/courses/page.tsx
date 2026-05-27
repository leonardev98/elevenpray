"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/app/providers/auth-provider";
import { useCurriculum } from "@/app/lib/curriculum/hooks";
import { curriculumCourseToMock } from "@/app/lib/curriculum/display";
import { createCurriculumCourse, deleteCurriculumCourse } from "@/app/lib/curriculum/api";
import {
  countCoursesByCycle,
  defaultCycleFilterForCurriculum,
  filterCurriculumCoursesForList,
  findCurriculumCourseByListId,
  parseProfileCycle,
  resolveActiveCycleNumber,
} from "@/app/lib/curriculum/courses-list";
import { getCoursesForList } from "../lib/mock-course-data";
import type { MockCourseExtended } from "../lib/mock-course-data";
import {
  removePersistedStudentCourse,
  type StudentCourseStored,
} from "../lib/student-courses-storage";
import { AddCourseModal } from "../components/courses/AddCourseModal";
import { CourseCard } from "../components/courses/CourseCard";
import { CoursesEmptyState } from "../components/courses/CoursesEmptyState";
import { ConfirmDestructiveModal } from "../components/ConfirmDestructiveModal";
import { StudentPageShell } from "../components/StudentPageShell";
import { cycleToRoman } from "@/app/lib/curriculum/curriculum-utils";
import { CycleSelector, type CycleFilter } from "./components/CycleSelector";

function toStored(course: MockCourseExtended): StudentCourseStored {
  return course as unknown as StudentCourseStored;
}

export default function StudentCoursesPage() {
  const t = useTranslations("studentCourses");
  const { token, user } = useAuth();
  const { state: curriculumState, loading: curriculumLoading, cycleNumbers, load } = useCurriculum();
  const [localCourses, setLocalCourses] = useState<MockCourseExtended[]>([]);
  const [cycleFilter, setCycleFilter] = useState<CycleFilter>("current");
  const [filterInitialized, setFilterInitialized] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<MockCourseExtended | null>(null);
  const [deletingCourse, setDeletingCourse] = useState<MockCourseExtended | null>(null);

  const refreshLocal = useCallback(() => {
    setLocalCourses(getCoursesForList());
  }, []);

  useEffect(() => {
    queueMicrotask(refreshLocal);
  }, [refreshLocal]);

  const profileCycle = useMemo(
    () => parseProfileCycle(user?.studentProfile?.cycle),
    [user?.studentProfile?.cycle],
  );

  const activeCycle = useMemo(
    () => resolveActiveCycleNumber(curriculumState?.courses ?? [], profileCycle),
    [curriculumState, profileCycle],
  );

  const defaultCycle = activeCycle;

  const courseCountByCycle = useMemo(
    () => countCoursesByCycle(curriculumState?.courses ?? []),
    [curriculumState],
  );

  const hasCurriculum =
    Boolean(token && curriculumState && curriculumState.courses.length > 0);

  useEffect(() => {
    if (!curriculumState?.courses.length || filterInitialized) return;
    setCycleFilter(defaultCycleFilterForCurriculum(curriculumState.courses, profileCycle));
    setFilterInitialized(true);
  }, [curriculumState, filterInitialized, profileCycle]);

  const courses = useMemo(() => {
    if (hasCurriculum) {
      const filtered = filterCurriculumCoursesForList(
        curriculumState!.courses,
        cycleFilter,
        { activeCycle },
      );
      return filtered.map(curriculumCourseToMock);
    }

    if (curriculumLoading) {
      return [];
    }

    return localCourses;
  }, [hasCurriculum, curriculumState, cycleFilter, activeCycle, localCourses, curriculumLoading]);

  const handleConfirmDelete = useCallback(async () => {
    if (!deletingCourse) return;
    const fromMalla = curriculumState?.courses
      ? findCurriculumCourseByListId(curriculumState.courses, deletingCourse.id)
      : undefined;
    if (fromMalla && token) {
      try {
        await deleteCurriculumCourse(token, fromMalla.id);
        await load();
      } catch {
        /* keep modal open on failure */
        return;
      }
    } else {
      removePersistedStudentCourse(deletingCourse.id);
      refreshLocal();
    }
    setDeletingCourse(null);
  }, [deletingCourse, curriculumState, token, load, refreshLocal]);

  const handleAddSuccess = useCallback(async () => {
    refreshLocal();
    if (!token) return;
    const latest = getCoursesForList();
    const created = latest[latest.length - 1];
    if (!created) return;
    try {
      const cycle =
        typeof cycleFilter === "number" ? cycleFilter : defaultCycle;
      await createCurriculumCourse(token, {
        name: created.name,
        code: created.code || undefined,
        credits: created.credits ?? 3,
        cycleNumber: cycle,
        status: "in_progress",
      });
      await load();
    } catch {
      /* local course still available */
    }
  }, [refreshLocal, token, cycleFilter, defaultCycle, load]);

  return (
    <StudentPageShell>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
      >
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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

        {hasCurriculum && (
          <div className="mb-8">
            <CycleSelector
              value={cycleFilter}
              onChange={setCycleFilter}
              cycleNumbers={cycleNumbers}
              activeCycle={activeCycle}
              courseCountByCycle={courseCountByCycle}
            />
          </div>
        )}

        {!curriculumLoading && courses.length === 0 ? (
          <CoursesEmptyState
            onAddCourse={() => setModalOpen(true)}
            subtitle={
              hasCurriculum && cycleFilter === "current"
                ? t("emptyCurrentCycle", { roman: cycleToRoman(activeCycle) })
                : undefined
            }
          />
        ) : curriculumLoading ? null : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onEdit={(c) => setEditingCourse(c)}
                onDelete={(c) => setDeletingCourse(c)}
              />
            ))}
          </div>
        )}
      </motion.div>

      <AddCourseModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => void handleAddSuccess()}
      />

      <AddCourseModal
        open={editingCourse != null}
        mode="edit"
        initialCourse={editingCourse ? toStored(editingCourse) : null}
        onClose={() => setEditingCourse(null)}
        onSuccess={refreshLocal}
      />

      <ConfirmDestructiveModal
        open={deletingCourse != null}
        title={t("deleteCourseTitle")}
        message={
          deletingCourse
            ? t("confirmDeleteCourseMessage", { name: deletingCourse.name })
            : ""
        }
        onClose={() => setDeletingCourse(null)}
        onConfirm={handleConfirmDelete}
      />
    </StudentPageShell>
  );
}
