import type { MoodFactorId, MoodId } from "../wellbeing-types";

export type DailyActionType = "breathing" | "pomodoro" | "flashcards" | "study";

export interface WellbeingAcademicContext {
  courseName?: string;
  courseCode?: string;
}

export interface DailyActionRecommendation {
  messageKey: string;
  messageParams?: Record<string, string>;
  ctaKey: string;
  actionType: DailyActionType;
}

const LOW_MOODS: MoodId[] = ["low", "bad"];
const GOOD_MOODS: MoodId[] = ["excellent", "good"];

export function getDailyAction(
  mood: MoodId,
  factors: MoodFactorId[],
  academic: WellbeingAcademicContext,
): DailyActionRecommendation {
  const courseLabel = academic.courseName ?? academic.courseCode ?? "tu curso pendiente";
  const courseParams = { course: courseLabel };

  if (LOW_MOODS.includes(mood) && factors.includes("examNear")) {
    return {
      messageKey: "dailyAction.stressedExam",
      ctaKey: "dailyAction.ctaBreathing",
      actionType: "breathing",
    };
  }

  if (GOOD_MOODS.includes(mood)) {
    return {
      messageKey: "dailyAction.goodEnergy",
      messageParams: courseParams,
      ctaKey: "dailyAction.ctaPomodoro",
      actionType: "pomodoro",
    };
  }

  if (LOW_MOODS.includes(mood)) {
    return {
      messageKey: "dailyAction.restDay",
      ctaKey: "dailyAction.ctaFlashcards",
      actionType: "flashcards",
    };
  }

  if (mood === "normal") {
    return {
      messageKey: "dailyAction.stableDay",
      ctaKey: "dailyAction.ctaStudy",
      actionType: "study",
    };
  }

  return {
    messageKey: "dailyAction.fallback",
    ctaKey: "dailyAction.ctaStudy",
    actionType: "study",
  };
}
