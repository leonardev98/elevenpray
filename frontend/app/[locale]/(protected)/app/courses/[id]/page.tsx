"use client";

import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getCourseById } from "../../lib/mock-course-data";
import { CourseDetailHeader } from "../../components/courses/CourseDetailHeader";
import { CourseTabs } from "../../components/courses/CourseTabs";
import { StudentPageShell } from "../../components/StudentPageShell";

export default function StudentCourseDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const t = useTranslations("studentCourses");
  const course = getCourseById(id);

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
    <StudentPageShell hideTopBar maxWidth="max-w-6xl">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        className="relative"
      >
        <CourseDetailHeader course={course} />
        <CourseTabs course={course} />
      </motion.div>
    </StudentPageShell>
  );
}
