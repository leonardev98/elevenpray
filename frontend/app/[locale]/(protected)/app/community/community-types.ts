export type PostType = "apunte" | "pregunta" | "plantilla" | "pdf";

export type CommunityTab = "feed" | "questions" | "templates";

export type UniversityId = "UNI" | "UPC" | "PUCP" | "UNMSM" | "General" | "Todas";

export type ReportTargetType = "post" | "question" | "answer" | "comment";

export interface CommunityTemplate {
  id: string;
  name: string;
  author: string;
  university: string;
  downloads: number;
  rating: number;
}

export interface TrendItem {
  id: string;
  rank: number;
  topic: string;
  postCount: number;
}

export interface TopContributor {
  id: string;
  name: string;
  university: string;
  initial: string;
  color: string;
  contributions: number;
}
