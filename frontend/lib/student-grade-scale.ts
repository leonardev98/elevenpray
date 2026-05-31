export type StudentGradeScale = "0_20" | "0_100" | "A_F";

export const STUDENT_GRADE_SCALE_VALUES: StudentGradeScale[] = [
  "0_20",
  "0_100",
  "A_F",
];

export function isStudentGradeScale(value: string): value is StudentGradeScale {
  return STUDENT_GRADE_SCALE_VALUES.includes(value as StudentGradeScale);
}

export function normalizeStudentGradeScale(
  value: string | null | undefined,
): StudentGradeScale {
  if (value && isStudentGradeScale(value)) return value;
  return "0_20";
}
