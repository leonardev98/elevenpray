import type { StudentOnboardingOption } from "./peru-student-onboarding";

/** Gradiente CSS (compatible con style={{ background }}) por institución. */
export type InstitutionBannerStyle = {
  background: string;
};

/** Estilos referenciales hasta subir logos a S3. */
export const INSTITUTION_BANNER_STYLES: Record<string, InstitutionBannerStyle> = {
  senati: {
    background: "linear-gradient(135deg, #0f4c81 0%, #1a6bb5 50%, #38bdf8 100%)",
  },
  cibertec: {
    background: "linear-gradient(135deg, #7c2d12 0%, #ea580c 50%, #fdba74 100%)",
  },
  idat: {
    background: "linear-gradient(135deg, #312e81 0%, #6366f1 50%, #a5b4fc 100%)",
  },
  sise: {
    background: "linear-gradient(135deg, #14532d 0%, #16a34a 50%, #86efac 100%)",
  },
  isil: {
    background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #93c5fd 100%)",
  },
  certus: {
    background: "linear-gradient(135deg, #581c87 0%, #9333ea 50%, #d8b4fe 100%)",
  },
  toulouse: {
    background: "linear-gradient(135deg, #831843 0%, #db2777 50%, #fbcfe8 100%)",
  },
  zegel: {
    background: "linear-gradient(135deg, #134e4a 0%, #0d9488 50%, #5eead4 100%)",
  },
  itp: {
    background: "linear-gradient(135deg, #422006 0%, #ca8a04 50%, #fde047 100%)",
  },
  leonardo: {
    background: "linear-gradient(135deg, #1e1b4b 0%, #4f46e5 50%, #c7d2fe 100%)",
  },
  default_universidad: {
    background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #93c5fd 100%)",
  },
  default_tecnico: {
    background: "linear-gradient(135deg, #0f766e 0%, #14b8a6 50%, #99f6e4 100%)",
  },
  unmsm: {
    background: "linear-gradient(135deg, #7f1d1d 0%, #b91c1c 45%, #fbbf24 100%)",
  },
  pucp: {
    background: "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #fcd34d 100%)",
  },
  upc: {
    background: "linear-gradient(135deg, #4c1d95 0%, #7c3aed 50%, #c4b5fd 100%)",
  },
  utec: {
    background: "linear-gradient(135deg, #0c4a6e 0%, #0284c7 50%, #7dd3fc 100%)",
  },
  usmp: {
    background: "linear-gradient(135deg, #14532d 0%, #15803d 50%, #fde047 100%)",
  },
  uni: {
    background: "linear-gradient(135deg, #1e293b 0%, #475569 50%, #94a3b8 100%)",
  },
};

export function getInstitutionBannerStyle(
  institutionId: string | null | undefined,
  programType: "tecnico" | "universidad",
): InstitutionBannerStyle {
  if (institutionId && INSTITUTION_BANNER_STYLES[institutionId]) {
    return INSTITUTION_BANNER_STYLES[institutionId]!;
  }
  return programType === "tecnico"
    ? INSTITUTION_BANNER_STYLES.default_tecnico!
    : INSTITUTION_BANNER_STYLES.default_universidad!;
}

/**
 * Diez institutos técnicos de alta demanda en Perú.
 * `imageUrl` reservado para futura URL en S3.
 */
export const PERUVIAN_TECHNICAL_INSTITUTES: StudentOnboardingOption[] = [
  {
    id: "senati",
    label: "SENATI",
    shortName: "SENATI",
    textValue: "SENATI Servicio Nacional de Adiestramiento Trabajo Industrial",
    imageUrl: undefined,
  },
  {
    id: "cibertec",
    label: "CIBERTEC",
    shortName: "CIBERTEC",
    textValue: "CIBERTEC instituto técnico carreras tecnológicas",
  },
  {
    id: "idat",
    label: "IDAT",
    shortName: "IDAT",
    textValue: "IDAT Instituto de Educación Superior",
  },
  {
    id: "sise",
    label: "SISE",
    shortName: "SISE",
    textValue: "SISE San Ignacio de Loyola instituto",
  },
  {
    id: "isil",
    label: "ISIL",
    shortName: "ISIL",
    textValue: "ISIL Instituto San Ignacio de Loyola",
  },
  {
    id: "certus",
    label: "CERTUS",
    shortName: "CERTUS",
    textValue: "CERTUS instituto superior técnico",
  },
  {
    id: "toulouse",
    label: "Toulouse Lautrec",
    shortName: "TL",
    textValue: "Toulouse Lautrec instituto diseño comunicación",
  },
  {
    id: "zegel",
    label: "Zegel IPAE",
    shortName: "Zegel",
    textValue: "Zegel IPAE instituto administración empresas",
  },
  {
    id: "itp",
    label: "Instituto Tecnológico del Perú",
    shortName: "ITP",
    textValue: "Instituto Tecnológico del Perú ITP",
  },
  {
    id: "leonardo",
    label: "Instituto Leonardo Da Vinci",
    shortName: "ILDV",
    textValue: "Instituto Leonardo Da Vinci leonardo da vinci",
  },
];

export function findTechnicalInstituteOption(
  value: string,
): StudentOnboardingOption | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const byId = PERUVIAN_TECHNICAL_INSTITUTES.find((i) => i.id === trimmed);
  if (byId) return byId;
  const lower = trimmed.toLowerCase();
  return PERUVIAN_TECHNICAL_INSTITUTES.find(
    (i) =>
      i.label.toLowerCase() === lower ||
      i.shortName?.toLowerCase() === lower ||
      i.textValue.toLowerCase().includes(lower),
  );
}
