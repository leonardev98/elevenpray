"use client";

import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MOCK_COURSES } from "../../lib/mock-student-data";
import { ScreenPlaceholder } from "../../components/ScreenPlaceholder";
import { StudentPageShell } from "../../components/StudentPageShell";
import { BookOpen, Layers, Sparkles } from "lucide-react";

export default function StudentCourseDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const t = useTranslations("studentCourses");
  const course = MOCK_COURSES.find((c) => c.id === id) ?? MOCK_COURSES[0];

  return (
    <StudentPageShell title={course.name}>
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-6 w-full justify-start rounded-xl bg-[var(--app-surface)] p-1">
          <TabsTrigger value="overview" className="rounded-lg">
            {t("tabOverview")}
          </TabsTrigger>
          <TabsTrigger value="materials" className="rounded-lg">
            {t("tabMaterials")}
          </TabsTrigger>
          <TabsTrigger value="flashcards" className="rounded-lg">
            {t("tabFlashcards")}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <div className="student-card space-y-3 p-6">
            <p className="text-sm text-[var(--app-fg-secondary)]">{course.professor}</p>
            <p className="text-[var(--app-fg)]">{t("overviewMock")}</p>
          </div>
        </TabsContent>
        <TabsContent value="materials">
          <ScreenPlaceholder
            icon={BookOpen}
            title={t("materialsTitle")}
            description={t("materialsDesc")}
            badge={t("comingSoon")}
          />
        </TabsContent>
        <TabsContent value="flashcards">
          <ScreenPlaceholder
            icon={Layers}
            title={t("flashcardsTitle")}
            description={t("flashcardsDesc")}
            badge={t("comingSoon")}
          />
        </TabsContent>
      </Tabs>
      <div className="mt-6">
        <ScreenPlaceholder
          icon={Sparkles}
          title={t("aiTitle")}
          description={t("aiDesc")}
          badge={t("comingSoon")}
        />
      </div>
    </StudentPageShell>
  );
}
