export interface StudentProfilePublic {
  university: string;
  career: string;
  cycle: string;
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
