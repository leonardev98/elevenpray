export type StudentProgramType = 'tecnico' | 'universidad';

export type StudentGradeScale = '0_20' | '0_100' | 'A_F';

export interface StudentProfilePublic {
  university: string;
  career: string;
  cycle: string;
  institutionType?: StudentProgramType | null;
  curriculumTotalCycles?: number | null;
  gradeScale?: StudentGradeScale | null;
}

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'platform_admin';
  avatarUrl: string | null;
  studentProfile: StudentProfilePublic | null;
  studentOnboardingCompleted: boolean;
}
