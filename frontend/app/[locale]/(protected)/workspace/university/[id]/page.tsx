"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/app/providers/auth-provider";
import { CreateCourseModal, type CreateCourseFormValues } from "./components/CreateCourseModal";
import { UniversityOnboardingWizard } from "./components/UniversityOnboardingWizard";
import { UniversityDashboard } from "./components/UniversityDashboard";
import { ClassSessionDetailModal } from "./components/ClassSessionDetailModal";
import { useStudyUniversity } from "@/app/lib/study-university/hooks";
import { toast } from "@/app/lib/toast";

export default function UniversityWorkspacePage() {
  const params = useParams();
  const workspaceId = params.id as string;
  const { token } = useAuth();
  const university = useStudyUniversity(workspaceId, token);
  const [draftSlot, setDraftSlot] = useState<{ date: string; startTime: string; endTime: string } | null>(null);
  const loadUniversity = university.load;

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
            toast.warning(
              "Curso creado",
              "No se generaron sesiones automáticas: el semestre no tiene fechas de inicio y fin configuradas.",
            );
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
