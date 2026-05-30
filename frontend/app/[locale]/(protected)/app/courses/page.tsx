"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useAuth } from "@/app/providers/auth-provider";
import { useCurriculum } from "@/app/lib/curriculum/hooks";
import { curriculumCourseToMock } from "@/app/lib/curriculum/display";
import { deleteCurriculumCourse, updateCurriculumCourse } from "@/app/lib/curriculum/api";
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
  updatePersistedStudentCourse,
  type StudentCourseStored,
} from "../lib/student-courses-storage";
import { AddCourseModal, type CourseModalSuccessPayload } from "../components/courses/AddCourseModal";
import { CourseCard } from "../components/courses/CourseCard";
import { CoursesEmptyState } from "../components/courses/CoursesEmptyState";
import { ConfirmDestructiveModal } from "../components/ConfirmDestructiveModal";
import { StudentPageShell } from "../components/StudentPageShell";
import { cycleToRoman } from "@/app/lib/curriculum/curriculum-utils";
import { CycleSelector, type CycleFilter } from "./components/CycleSelector";
import { CoursesSkeleton } from "../components/courses/CoursesSkeleton";

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

  const defaultCycleForModal = useMemo(() => {
    if (typeof cycleFilter === "number") return cycleFilter;
    if (hasCurriculum) return activeCycle;
    return 1;
  }, [cycleFilter, hasCurriculum, activeCycle]);

  const courses = useMemo(() => {
    if (token) {
      if (curriculumLoading) return [];
      if (hasCurriculum) {
        const filtered = filterCurriculumCoursesForList(
          curriculumState!.courses,
          cycleFilter,
          { activeCycle },
        );
        return filtered.map(curriculumCourseToMock);
      }
      return [];
    }

    return localCourses;
  }, [token, hasCurriculum, curriculumState, cycleFilter, activeCycle, localCourses, curriculumLoading]);

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

  const handleEditSuccess = useCallback(
    async ({ cycleNumber, course }: CourseModalSuccessPayload) => {
      updatePersistedStudentCourse(course.id, course);
      refreshLocal();
      if (!token || !curriculumState) return;
      const linked = findCurriculumCourseByListId(curriculumState.courses, course.id);
      if (!linked) return;
      try {
        await updateCurriculumCourse(token, linked.id, {
          name: course.name,
          credits: course.credits ?? 3,
          cycleNumber,
        });
        await load();
      } catch {
        /* local changes kept */
      }
    },
    [refreshLocal, token, curriculumState, load],
  );

  const editingCurriculum = useMemo(() => {
    if (!editingCourse || !curriculumState) return null;
    return findCurriculumCourseByListId(curriculumState.courses, editingCourse.id) ?? null;
  }, [editingCourse, curriculumState]);

  return (
    <StudentPageShell title={t("title")}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
      >
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-[var(--app-fg)] lg:text-3xl">
            {t("title")}
          </h1>
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

        {curriculumLoading && token ? (
          <CoursesSkeleton showCycleFilter />
        ) : !curriculumLoading && courses.length === 0 ? (
          <CoursesEmptyState
            subtitle={
              hasCurriculum && cycleFilter === "current"
                ? t("emptyCurrentCycle", { roman: cycleToRoman(activeCycle) })
                : undefined
            }
          />
        ) : (
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
        open={editingCourse != null}
        mode="edit"
        initialCourse={editingCourse ? toStored(editingCourse) : null}
        defaultCycleNumber={editingCurriculum?.cycleNumber ?? editingCourse?.cycleNumber ?? defaultCycleForModal}
        onClose={() => setEditingCourse(null)}
        onSuccess={(payload) => void handleEditSuccess(payload)}
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
