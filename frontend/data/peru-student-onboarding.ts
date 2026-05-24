/** Opción canónica para listas del onboarding estudiantil (Perú). */
export type StudentOnboardingOption = {
  id: string;
  /** Valor guardado en perfil al elegir de la lista */
  label: string;
  /** Texto usado para filtrar (incluye siglas y alias) */
  textValue: string;
};

export const STUDENT_ONBOARDING_OTHER_ID = "__student_onboarding_other__";

/** Fragmento en `textValue` de la opción “Otra” para que el filtro del ComboBox no la oculte al buscar. */
export const STUDENT_ONBOARDING_OTHER_FILTER_SENTINEL = "__mitsyy_other_option__";

export const PERUVIAN_UNIVERSITIES: StudentOnboardingOption[] = [
  {
    id: "pucp",
    label: "Pontificia Universidad Católica del Perú (PUCP)",
    textValue: "Pontificia Universidad Católica del Perú PUCP pucp católica",
  },
  {
    id: "unmsm",
    label: "Universidad Nacional Mayor de San Marcos (UNMSM)",
    textValue: "Universidad Nacional Mayor de San Marcos UNMSM san marcos unmsm",
  },
  {
    id: "uni",
    label: "Universidad Nacional de Ingeniería (UNI)",
    textValue: "Universidad Nacional de Ingeniería UNI uni ingeniería",
  },
  {
    id: "upc",
    label: "Universidad Peruana de Ciencias Aplicadas (UPC)",
    textValue: "Universidad Peruana de Ciencias Aplicadas UPC upc ciencias aplicadas",
  },
  {
    id: "udl",
    label: "Universidad de Lima",
    textValue: "Universidad de Lima UDL udl",
  },
  {
    id: "upch",
    label: "Universidad Peruana Cayetano Heredia (UPCH)",
    textValue: "Universidad Peruana Cayetano Heredia UPCH upch cayetano heredia medicina",
  },
  {
    id: "unalm",
    label: "Universidad Nacional Agraria La Molina (UNALM)",
    textValue: "Universidad Nacional Agraria La Molina UNALM unalm agraria la molina",
  },
  {
    id: "unfv",
    label: "Universidad Nacional Federico Villarreal (UNFV)",
    textValue: "Universidad Nacional Federico Villarreal UNFV unfv villarreal",
  },
  {
    id: "utp",
    label: "Universidad Tecnológica del Perú (UTP)",
    textValue: "Universidad Tecnológica del Perú UTP utp tecnológica",
  },
  {
    id: "usmp",
    label: "Universidad San Martín de Porres (USMP)",
    textValue: "Universidad San Martín de Porres USMP usmp san martín",
  },
];

export const PERUVIAN_CAREERS: StudentOnboardingOption[] = [
  { id: "ind", label: "Ingeniería Industrial", textValue: "Ingeniería Industrial industrial" },
  { id: "sis", label: "Ingeniería de Sistemas", textValue: "Ingeniería de Sistemas sistemas" },
  { id: "sw", label: "Ingeniería de Software", textValue: "Ingeniería de Software software sistemas" },
  { id: "civ", label: "Ingeniería Civil", textValue: "Ingeniería Civil civil" },
  { id: "der", label: "Derecho", textValue: "Derecho leyes abogacía" },
  { id: "med", label: "Medicina Humana", textValue: "Medicina Humana medicina médico" },
  { id: "adm", label: "Administración", textValue: "Administración admin negocios" },
  { id: "con", label: "Contabilidad", textValue: "Contabilidad contador ciencias contables" },
  { id: "eco", label: "Economía", textValue: "Economía económico" },
  { id: "psi", label: "Psicología", textValue: "Psicología psicólogo" },
  { id: "arq", label: "Arquitectura", textValue: "Arquitectura arquitecto" },
  { id: "mkt", label: "Marketing", textValue: "Marketing mercadotecnia" },
  { id: "enf", label: "Enfermería", textValue: "Enfermería enfermero" },
  { id: "odo", label: "Odontología", textValue: "Odontología odontólogo" },
  { id: "edu", label: "Educación", textValue: "Educación pedagogía docencia" },
];
