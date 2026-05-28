export type CommunityTab = "templates" | "my-contributions" | "saved";

export type TemplateType =
  | "apunte"
  | "mapa_mental"
  | "esquema"
  | "planificador"
  | "tabla";

export type TemplateCareer =
  | "medicina"
  | "ingenieria"
  | "derecho"
  | "administracion"
  | "psicologia"
  | "sistemas"
  | "arquitectura"
  | "otras";

export type TemplateStatus = "pending" | "approved" | "rejected";

export interface CommunityFilters {
  career: TemplateCareer | "todas";
  types: TemplateType[];
  universityFirst: boolean;
}

export interface AcademicTemplateDto {
  id: string;
  type: TemplateType;
  title: string;
  career: TemplateCareer;
  subject: string;
  subjectTags: string[];
  description: string;
  university: string | null;
  status: TemplateStatus;
  downloadCount: number;
  saveCount: number;
  isFeatured: boolean;
  isNewThisWeek: boolean;
  savedByMe: boolean;
  authorName: string;
  authorId: string;
  attachmentUrl: string | null;
  attachmentName: string | null;
  createdAt: string;
  approvedAt: string | null;
}

export interface TopContributorDto {
  id: string;
  name: string;
  university: string | null;
  contributions: number;
  initial: string;
}
