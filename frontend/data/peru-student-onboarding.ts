import { getCareersByUniversityId } from "./peru-careers-by-university";

/** Opción canónica para listas del onboarding estudiantil (Perú). */
export type StudentOnboardingOption = {
  id: string;
  /** Nombre completo que se guarda en el perfil al elegir de la lista (sin siglas entre paréntesis). */
  label: string;
  /** Sigla / acrónimo opcional, mostrado como badge en la lista. */
  shortName?: string;
  /** Texto usado para filtrar (incluye nombre, siglas y alias coloquiales). */
  textValue: string;
};

export const STUDENT_ONBOARDING_OTHER_ID = "__student_onboarding_other__";

/** Fragmento en `textValue` de la opción “Otra” para que el filtro del ComboBox no la oculte al buscar. */
export const STUDENT_ONBOARDING_OTHER_FILTER_SENTINEL = "__mitsyy_other_option__";

/**
 * Universidades peruanas licenciadas y de alta demanda, ordenadas alfabéticamente por nombre completo.
 * El `label` contiene solo el nombre limpio (sin paréntesis) y `shortName` la sigla.
 */
export const PERUVIAN_UNIVERSITIES: StudentOnboardingOption[] = [
  {
    id: "esan",
    label: "Universidad ESAN",
    shortName: "ESAN",
    textValue: "Universidad ESAN esan escuela de administracion negocios",
  },
  {
    id: "pucp",
    label: "Pontificia Universidad Católica del Perú",
    shortName: "PUCP",
    textValue: "Pontificia Universidad Católica del Perú PUCP pucp católica catolica",
  },
  {
    id: "ucal",
    label: "Universidad de Ciencias y Artes de América Latina",
    shortName: "UCAL",
    textValue: "Universidad de Ciencias y Artes de América Latina UCAL ucal",
  },
  {
    id: "ucsur",
    label: "Universidad Científica del Sur",
    shortName: "UCSUR",
    textValue: "Universidad Científica del Sur UCSUR ucsur cientifica científica sur",
  },
  {
    id: "ucv",
    label: "Universidad César Vallejo",
    shortName: "UCV",
    textValue: "Universidad César Vallejo UCV ucv cesar vallejo",
  },
  {
    id: "udep",
    label: "Universidad de Piura",
    shortName: "UDEP",
    textValue: "Universidad de Piura UDEP udep piura",
  },
  {
    id: "udl",
    label: "Universidad de Lima",
    shortName: "ULima",
    textValue: "Universidad de Lima ULima ulima udl",
  },
  {
    id: "up",
    label: "Universidad del Pacífico",
    shortName: "UP",
    textValue: "Universidad del Pacífico UP up pacifico pacífico",
  },
  {
    id: "unalm",
    label: "Universidad Nacional Agraria La Molina",
    shortName: "UNALM",
    textValue: "Universidad Nacional Agraria La Molina UNALM unalm agraria la molina",
  },
  {
    id: "uni",
    label: "Universidad Nacional de Ingeniería",
    shortName: "UNI",
    textValue: "Universidad Nacional de Ingeniería UNI uni ingeniería ingenieria",
  },
  {
    id: "unfv",
    label: "Universidad Nacional Federico Villarreal",
    shortName: "UNFV",
    textValue: "Universidad Nacional Federico Villarreal UNFV unfv villarreal",
  },
  {
    id: "unmsm",
    label: "Universidad Nacional Mayor de San Marcos",
    shortName: "UNMSM",
    textValue: "Universidad Nacional Mayor de San Marcos UNMSM unmsm san marcos",
  },
  {
    id: "unsa",
    label: "Universidad Nacional de San Agustín",
    shortName: "UNSA",
    textValue: "Universidad Nacional de San Agustín UNSA unsa san agustin arequipa",
  },
  {
    id: "upch",
    label: "Universidad Peruana Cayetano Heredia",
    shortName: "UPCH",
    textValue: "Universidad Peruana Cayetano Heredia UPCH upch cayetano heredia medicina",
  },
  {
    id: "upc",
    label: "Universidad Peruana de Ciencias Aplicadas",
    shortName: "UPC",
    textValue: "Universidad Peruana de Ciencias Aplicadas UPC upc ciencias aplicadas",
  },
  {
    id: "upn",
    label: "Universidad Privada del Norte",
    shortName: "UPN",
    textValue: "Universidad Privada del Norte UPN upn norte trujillo chiclayo",
  },
  {
    id: "urp",
    label: "Universidad Ricardo Palma",
    shortName: "URP",
    textValue: "Universidad Ricardo Palma URP urp ricardo palma",
  },
  {
    id: "usmp",
    label: "Universidad de San Martín de Porres",
    shortName: "USMP",
    textValue: "Universidad de San Martín de Porres USMP usmp san martín martin porres",
  },
  {
    id: "utec",
    label: "Universidad de Ingeniería y Tecnología",
    shortName: "UTEC",
    textValue: "Universidad de Ingeniería y Tecnología UTEC utec ingenieria tecnologia",
  },
  {
    id: "utp",
    label: "Universidad Tecnológica del Perú",
    shortName: "UTP",
    textValue: "Universidad Tecnológica del Perú UTP utp tecnológica tecnologica",
  },
];

/**
 * Lista global de carreras (compatibilidad y fallback cuando no hay universidad seleccionada).
 * @deprecated Preferir `getCareersForUniversity` en onboarding.
 */
export const PERUVIAN_CAREERS: StudentOnboardingOption[] = [
  { id: "adm", label: "Administración", textValue: "Administración admin administracion negocios" },
  { id: "arq", label: "Arquitectura", textValue: "Arquitectura arquitecto" },
  { id: "con", label: "Contabilidad", textValue: "Contabilidad contador ciencias contables" },
  { id: "der", label: "Derecho", textValue: "Derecho leyes abogacía abogacia" },
  { id: "eco", label: "Economía", textValue: "Economía economia económico" },
  { id: "edu", label: "Educación", textValue: "Educación educacion pedagogía docencia" },
  { id: "enf", label: "Enfermería", textValue: "Enfermería enfermeria enfermero" },
  { id: "civ", label: "Ingeniería Civil", textValue: "Ingeniería Civil ingenieria civil" },
  { id: "sis", label: "Ingeniería de Sistemas", textValue: "Ingeniería de Sistemas ingenieria sistemas" },
  { id: "sw", label: "Ingeniería de Software", textValue: "Ingeniería de Software ingenieria software" },
  { id: "ind", label: "Ingeniería Industrial", textValue: "Ingeniería Industrial ingenieria industrial" },
  { id: "mkt", label: "Marketing", textValue: "Marketing mercadotecnia" },
  { id: "med", label: "Medicina Humana", textValue: "Medicina Humana medicina médico medico" },
  { id: "odo", label: "Odontología", textValue: "Odontología odontologia odontólogo" },
  { id: "psi", label: "Psicología", textValue: "Psicología psicologia psicólogo" },
];

/** Busca una universidad del catálogo por id o por nombre guardado en perfil. */
export function findUniversityOption(value: string): StudentOnboardingOption | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const byId = PERUVIAN_UNIVERSITIES.find((u) => u.id === trimmed);
  if (byId) return byId;
  const lower = trimmed.toLowerCase();
  return PERUVIAN_UNIVERSITIES.find(
    (u) =>
      u.label.toLowerCase() === lower ||
      u.shortName?.toLowerCase() === lower ||
      u.textValue.toLowerCase().includes(lower),
  );
}

/** Carreras asociadas a una universidad (por id o label). Vacío si no hay universidad válida. */
export function getCareersForUniversity(universityValue: string): StudentOnboardingOption[] {
  const uni = findUniversityOption(universityValue);
  if (!uni) return [];
  return getCareersByUniversityId(uni.id);
}

/** Indica si una carrera pertenece al catálogo de la universidad (comparación por label). */
export function isCareerInUniversityCatalog(
  careerLabel: string,
  universityValue: string,
): boolean {
  const trimmed = careerLabel.trim();
  if (!trimmed) return true;
  const uni = findUniversityOption(universityValue);
  if (!uni) return true;
  const careers = getCareersByUniversityId(uni.id);
  const lower = trimmed.toLowerCase();
  return careers.some((c) => c.label.toLowerCase() === lower);
}
