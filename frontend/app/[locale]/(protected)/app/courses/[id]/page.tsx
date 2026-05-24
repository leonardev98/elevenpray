"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getCourseById } from "../../lib/mock-course-data";
import type { MockCourseExtended } from "../../lib/mock-course-data";
import { CourseWorkspace } from "../../components/courses/course-detail/CourseWorkspace";
import { StudentPageShell } from "../../components/StudentPageShell";

export default function StudentCourseDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const t = useTranslations("studentCourses");
  const tCommon = useTranslations("common");
  const [course, setCourse] = useState<MockCourseExtended | null | undefined>(undefined);

  useEffect(() => {
    queueMicrotask(() => {
      setCourse(getCourseById(id) ?? null);
    });
  }, [id]);

  if (course === undefined) {
    return (
      <StudentPageShell hideTopBar maxWidth="max-w-6xl">
        <div className="flex min-h-[40vh] items-center justify-center">
          <p className="text-sm text-[var(--app-fg-muted)]">{tCommon("loading")}</p>
        </div>
      </StudentPageShell>
    );
  }

  if (!course) {
    return (
      <StudentPageShell hideTopBar maxWidth="max-w-6xl">
        <div className="py-20 text-center">
          <p className="text-lg text-[var(--app-fg)]">{t("courseNotFound")}</p>
          <Link
            href="/app/courses"
            className="mt-4 inline-block text-sm text-[var(--app-primary)] hover:underline"
          >
            {t("backToCourses")}
          </Link>
        </div>
      </StudentPageShell>
    );
  }

  return (
    <StudentPageShell hideTopBar maxWidth="max-w-7xl">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        className="relative"
      >
        <CourseWorkspace course={course} />
      </motion.div>
    </StudentPageShell>
  );
}
