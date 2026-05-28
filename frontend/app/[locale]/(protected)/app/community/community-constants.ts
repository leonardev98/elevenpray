import type { TemplateCareer, TemplateType } from "./community-types";

export const TEMPLATE_CAREERS: {
  id: TemplateCareer | "todas";
  labelKey: string;
}[] = [
  { id: "todas", labelKey: "careerAll" },
  { id: "medicina", labelKey: "careerMedicina" },
  { id: "ingenieria", labelKey: "careerIngenieria" },
  { id: "derecho", labelKey: "careerDerecho" },
  { id: "administracion", labelKey: "careerAdministracion" },
  { id: "psicologia", labelKey: "careerPsicologia" },
  { id: "sistemas", labelKey: "careerSistemas" },
  { id: "arquitectura", labelKey: "careerArquitectura" },
  { id: "otras", labelKey: "careerOtras" },
];

export const TEMPLATE_TYPE_FILTERS: {
  id: TemplateType;
  labelKey: string;
  icon: string;
}[] = [
  { id: "apunte", labelKey: "typeApunte", icon: "📄" },
  { id: "mapa_mental", labelKey: "typeMapaMental", icon: "🗺️" },
  { id: "esquema", labelKey: "typeEsquema", icon: "📋" },
  { id: "planificador", labelKey: "typePlanificador", icon: "🗓️" },
  { id: "tabla", labelKey: "typeTabla", icon: "📊" },
];

export const TEMPLATE_TYPE_META: Record<
  TemplateType,
  { icon: string; labelKey: string }
> = {
  apunte: { icon: "📄", labelKey: "typeApunte" },
  mapa_mental: { icon: "🗺️", labelKey: "typeMapaMental" },
  esquema: { icon: "📋", labelKey: "typeEsquema" },
  planificador: { icon: "🗓️", labelKey: "typePlanificador" },
  tabla: { icon: "📊", labelKey: "typeTabla" },
};

export const CAREER_LABEL_KEYS: Record<TemplateCareer, string> = {
  medicina: "careerMedicina",
  ingenieria: "careerIngenieria",
  derecho: "careerDerecho",
  administracion: "careerAdministracion",
  psicologia: "careerPsicologia",
  sistemas: "careerSistemas",
  arquitectura: "careerArquitectura",
  otras: "careerOtras",
};

export const MAX_TEMPLATE_DESCRIPTION = 200;
export const MAX_TEMPLATE_FILE_BYTES = 10 * 1024 * 1024;

export const ALLOWED_TEMPLATE_MIMES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export const AUTHOR_COLORS: Record<string, string> = {
  "Ana R.": "bg-[var(--course-4-fg)] text-[var(--accent-fg)]",
  "Luis M.": "bg-[var(--course-1-fg)] text-[var(--accent-fg)]",
  "Carla S.": "bg-[var(--course-3-fg)] text-[var(--accent-fg)]",
  "Diego F.": "bg-[var(--course-5-fg)] text-[var(--accent-fg)]",
};

export function getAuthorColor(author: string): string {
  return AUTHOR_COLORS[author] ?? "bg-[var(--accent)] text-[var(--accent-fg)]";
}

export const DEFAULT_FILTERS = {
  career: "todas" as const,
  types: [] as TemplateType[],
  universityFirst: false,
};
