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
 * Universidades peruanas más populares, ordenadas alfabéticamente por nombre completo.
 * El `label` contiene solo el nombre limpio (sin paréntesis) y `shortName` la sigla.
 */
export const PERUVIAN_UNIVERSITIES: StudentOnboardingOption[] = [
  {
    id: "pucp",
    label: "Pontificia Universidad Católica del Perú",
    shortName: "PUCP",
    textValue: "Pontificia Universidad Católica del Perú PUCP pucp católica catolica",
  },
  {
    id: "ucsur",
    label: "Universidad Científica del Sur",
    shortName: "UCSUR",
    textValue: "Universidad Científica del Sur UCSUR ucsur cientifica científica sur",
  },
  {
    id: "udl",
    label: "Universidad de Lima",
    shortName: "ULima",
    textValue: "Universidad de Lima ULima ulima udl",
  },
  {
    id: "usmp",
    label: "Universidad de San Martín de Porres",
    shortName: "USMP",
    textValue: "Universidad de San Martín de Porres USMP usmp san martín martin porres",
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
    id: "utp",
    label: "Universidad Tecnológica del Perú",
    shortName: "UTP",
    textValue: "Universidad Tecnológica del Perú UTP utp tecnológica tecnologica",
  },
];

/** Carreras universitarias más comunes en Perú, ordenadas alfabéticamente. */
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
