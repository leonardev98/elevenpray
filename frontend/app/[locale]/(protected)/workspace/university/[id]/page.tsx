"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useAuth } from "@/app/providers/auth-provider";
import { CreateCourseModal, type CreateCourseFormValues } from "./components/CreateCourseModal";
import { UniversityOnboardingWizard } from "./components/UniversityOnboardingWizard";
import { UniversityDashboard } from "./components/UniversityDashboard";
import { ClassSessionDetailModal } from "./components/ClassSessionDetailModal";
import { useStudyUniversity } from "@/app/lib/study-university/hooks";
import { toast } from "@/app/lib/toast";

const WORKSPACE_NOT_FOUND = /workspace not found/i;

export default function UniversityWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.id as string;
  const { token } = useAuth();
  const t = useTranslations("university");
  const university = useStudyUniversity(workspaceId, token);
  const [draftSlot, setDraftSlot] = useState<{ date: string; startTime: string; endTime: string } | null>(null);
  const loadUniversity = university.load;
  const isWorkspaceNotFound = Boolean(university.error && WORKSPACE_NOT_FOUND.test(university.error));

  useEffect(() => {
    void loadUniversity();
  }, [loadUniversity]);

  const selectedCourse = useMemo(
    () =>
      university.selectedSession
        ? university.state.courses.find((course) => course.id === university.selectedSession?.courseId) ?? null
        : null,
    [university.selectedSession, university.state.courses],
  );

  if (isWorkspaceNotFound) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg)] p-8 text-center">
        <p className="text-lg font-medium text-[var(--app-fg)]">{t("workspaceNotFound")}</p>
        <p className="text-sm text-[var(--app-fg)]/70">{t("workspaceNotFoundDescription")}</p>
        <Link
          href="/dashboard"
          className="rounded-xl bg-[var(--app-navy)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
        >
          {t("backToDashboard")}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <UniversityDashboard
        state={university.state}
        createCourseOpen={university.createCourseOpen}
        onOpenCreateCourse={(slot) => {
          setDraftSlot(slot ?? null);
          university.setCreateCourseOpen(true);
        }}
        onOpenSession={(sessionId) => university.setSelectedSessionId(sessionId)}
        onReorderCourses={university.reorderCourses}
        onStartFocus={university.startFocus}
        onUpdateAssignmentStatus={university.updateAssignmentStatus}
      />

      <UniversityOnboardingWizard
        open={university.onboardingOpen}
        onClose={() => university.setOnboardingOpen(false)}
        onComplete={async (payload) => {
          const startDate = payload.startDate?.trim() || undefined;
          const endDate = payload.endDate?.trim() || undefined;
          try {
            await university.upsertConfig({
              ...payload,
              startDate,
              endDate,
              onboardingCompleted: true,
              onboardingStep: 3,
            });
            await university.createSemester({
              name: payload.currentSemesterLabel,
              startDate,
              endDate,
              isCurrent: true,
              creditGoal: payload.creditGoal,
            });
            university.setCreateCourseOpen(true);
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            if (WORKSPACE_NOT_FOUND.test(message)) {
              toast.error(t("workspaceNotFound"), t("workspaceNotFoundDescription"));
              router.push("/dashboard");
            } else {
              toast.error(t("onboarding.saving"), message);
            }
          }
        }}
      />

      <CreateCourseModal
        open={university.createCourseOpen}
        conflicts={university.state.conflicts}
        initialSlot={draftSlot}
        onClose={() => {
          university.setCreateCourseOpen(false);
          setDraftSlot(null);
        }}
        onSubmit={async (values: CreateCourseFormValues) => {
          const currentSemester = university.state.semesters.find((s) => s.isCurrent);
          const currentSemesterId = currentSemester?.id;
          await university.createCourse({
            ...values,
            semesterId: currentSemesterId,
          });
          const canGenerateSessions =
            currentSemesterId &&
            currentSemester?.startDate &&
            currentSemester?.endDate;
          if (canGenerateSessions) {
            await university.generateSessions({ semesterId: currentSemesterId });
          } else if (currentSemesterId) {
            toast.warning(t("courseCreated"), t("noSessionsGenerated"));
          }
        }}
      />

      <ClassSessionDetailModal
        open={Boolean(university.selectedSession)}
        session={university.selectedSession}
        course={selectedCourse}
        assignments={university.state.assignments.filter(
          (assignment) => assignment.classSessionId === university.selectedSession?.id,
        )}
        onClose={() => university.setSelectedSessionId(null)}
        onSaveNotes={async (payload) => {
          if (!university.selectedSession) return;
          await university.updateSessionNotes(university.selectedSession.id, payload);
        }}
      />
    </div>
  );
}
