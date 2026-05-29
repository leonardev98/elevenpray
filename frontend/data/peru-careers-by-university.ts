import type { StudentOnboardingOption } from "./peru-student-onboarding";

/** Crea una opción de carrera con id único por universidad. */
function c(uniId: string, slug: string, label: string, aliases = ""): StudentOnboardingOption {
  const textValue = aliases ? `${label} ${aliases}` : label;
  return { id: `${uniId}-${slug}`, label, textValue };
}

/** Carreras comunes cuando no hay catálogo específico investigado. */
export const COMMON_UNIVERSITY_CAREERS: StudentOnboardingOption[] = [
  c("common", "adm", "Administración", "administracion negocios"),
  c("common", "arq", "Arquitectura", "arquitecto"),
  c("common", "con", "Contabilidad", "contador"),
  c("common", "der", "Derecho", "leyes abogacia"),
  c("common", "eco", "Economía", "economia"),
  c("common", "edu", "Educación", "pedagogia docencia"),
  c("common", "enf", "Enfermería", "enfermeria"),
  c("common", "civ", "Ingeniería Civil", "ingenieria civil"),
  c("common", "sis", "Ingeniería de Sistemas", "ingenieria sistemas informatica"),
  c("common", "sw", "Ingeniería de Software", "ingenieria software"),
  c("common", "ind", "Ingeniería Industrial", "ingenieria industrial"),
  c("common", "mkt", "Marketing", "mercadotecnia"),
  c("common", "med", "Medicina Humana", "medicina medico"),
  c("common", "odo", "Odontología", "odontologia"),
  c("common", "psi", "Psicología", "psicologia"),
  c("common", "com", "Comunicación", "comunicaciones"),
  c("common", "tur", "Turismo y Hotelería", "turismo hoteleria"),
];

function remapCommon(uniId: string, careers: StudentOnboardingOption[]): StudentOnboardingOption[] {
  return careers.map((item) => {
    const slug = item.id.replace(/^common-/, "");
    return c(uniId, slug, item.label, item.textValue.replace(item.label, "").trim());
  });
}

/** Catálogo de carreras de pregrado por universidad (fuentes: sitios oficiales de admisión/pregrado). */
export const CAREERS_BY_UNIVERSITY_ID: Record<string, StudentOnboardingOption[]> = {
  // Universidad del Pacífico — admision.up.edu.pe/carreras (12 carreras)
  up: [
    c("up", "adm", "Administración"),
    c("up", "con", "Contabilidad", "contador"),
    c("up", "der", "Derecho"),
    c("up", "eco", "Economía"),
    c("up", "fin", "Finanzas"),
    c("up", "nie", "Negocios Internacionales", "comercio exterior"),
    c("up", "mkt", "Marketing"),
    c("up", "ie", "Ingeniería Empresarial"),
    c("up", "ii", "Ingeniería de la Información", "sistemas tecnologia"),
    c("up", "iid", "Ingeniería en Innovación y Diseño", "diseno innovacion"),
    c("up", "hd", "Humanidades Digitales"),
    c("up", "pfe", "Política, Filosofía y Economía", "politica filosofia"),
  ],

  // PUCP — admision.pucp.edu.pe/carreras (selección representativa del catálogo oficial)
  pucp: [
    c("pucp", "ant", "Antropología"),
    c("pucp", "arq", "Arquitectura"),
    c("pucp", "amd", "Arte, Moda y Diseño Textil", "moda diseño"),
    c("pucp", "cpg", "Ciencia Política y Gobierno", "politica"),
    c("pucp", "com", "Comunicación Audiovisual"),
    c("pucp", "con", "Contabilidad"),
    c("pucp", "der", "Derecho"),
    c("pucp", "dis", "Diseño Gráfico", "diseño grafico"),
    c("pucp", "die", "Diseño Industrial"),
    c("pucp", "edu", "Educación Inicial"),
    c("pucp", "edp", "Educación Primaria"),
    c("pucp", "eds", "Educación Secundaria"),
    c("pucp", "fil", "Filosofía"),
    c("pucp", "fin", "Finanzas"),
    c("pucp", "gas", "Gastronomía", "chef cocina"),
    c("pucp", "hot", "Hotelería"),
    c("pucp", "amb", "Ingeniería Ambiental y Sostenible", "ambiental"),
    c("pucp", "bio", "Ingeniería Biomédica"),
    c("pucp", "civ", "Ingeniería Civil"),
    c("pucp", "tel", "Ingeniería de las Telecomunicaciones", "telecomunicaciones"),
    c("pucp", "min", "Ingeniería de Minas", "minas"),
    c("pucp", "ele", "Ingeniería Electrónica", "electronica"),
    c("pucp", "geo", "Ingeniería Geológica", "geologia"),
    c("pucp", "ind", "Ingeniería Industrial"),
    c("pucp", "inf", "Ingeniería Informática", "sistemas software"),
    c("pucp", "mec", "Ingeniería Mecánica"),
    c("pucp", "mecat", "Ingeniería Mecatrónica", "mecatronica"),
    c("pucp", "qui", "Ingeniería Química", "quimica"),
    c("pucp", "per", "Periodismo"),
    c("pucp", "psi", "Psicología"),
    c("pucp", "pub", "Publicidad"),
    c("pucp", "ri", "Relaciones Internacionales"),
    c("pucp", "soc", "Sociología"),
  ],

  // UPC — carreras de pregrado (ciencias aplicadas)
  upc: [
    c("upc", "adm", "Administración y Negocios"),
    c("upc", "arq", "Arquitectura"),
    c("upc", "com", "Comunicaciones"),
    c("upc", "con", "Contabilidad y Finanzas"),
    c("upc", "der", "Derecho"),
    c("upc", "dis", "Diseño"),
    c("upc", "eco", "Economía"),
    c("upc", "psi", "Psicología"),
    c("upc", "civ", "Ingeniería Civil"),
    c("upc", "ind", "Ingeniería Industrial"),
    c("upc", "sis", "Ingeniería de Sistemas de Información", "sistemas informatica"),
    c("upc", "mec", "Ingeniería Mecatrónica"),
    c("upc", "mkt", "Marketing"),
    c("upc", "nut", "Nutrición"),
    c("upc", "enf", "Enfermería"),
  ],

  // UPCH — enfoque salud
  upch: [
    c("upch", "med", "Medicina Humana", "medicina medico"),
    c("upch", "odo", "Odontología", "odontologia"),
    c("upch", "enf", "Enfermería"),
    c("upch", "psi", "Psicología"),
    c("upch", "nut", "Nutrición"),
    c("upch", "far", "Farmacia y Bioquímica", "farmacia bioquimica"),
    c("upch", "bio", "Biología", "biologia"),
    c("upch", "adm", "Administración en Salud"),
    c("upch", "der", "Derecho"),
    c("upch", "eco", "Economía"),
  ],

  // UNI — ingeniería y ciencias
  uni: [
    c("uni", "arq", "Arquitectura"),
    c("uni", "civ", "Ingeniería Civil"),
    c("uni", "ele", "Ingeniería Eléctrica", "electrica electronica"),
    c("uni", "geo", "Ingeniería Geológica", "geologia minas"),
    c("uni", "ind", "Ingeniería Industrial"),
    c("uni", "mec", "Ingeniería Mecánica"),
    c("uni", "min", "Ingeniería de Minas", "minas metalurgia"),
    c("uni", "pet", "Ingeniería de Petróleo y Gas Natural", "petroleo gas"),
    c("uni", "qui", "Ingeniería Química", "quimica"),
    c("uni", "sis", "Ingeniería de Sistemas e Informática", "sistemas informatica software"),
    c("uni", "est", "Ingeniería Estadística", "estadistica"),
    c("uni", "fis", "Ingeniería Física", "fisica"),
    c("uni", "mat", "Matemáticas", "matematica"),
    c("uni", "fisica", "Física"),
    c("uni", "qui-pura", "Química"),
  ],

  // UNMSM — universidad nacional mayor
  unmsm: [
    c("unmsm", "adm", "Administración"),
    c("unmsm", "ant", "Antropología"),
    c("unmsm", "arq", "Arquitectura"),
    c("unmsm", "bio", "Biología"),
    c("unmsm", "com", "Comunicación Social"),
    c("unmsm", "con", "Contabilidad"),
    c("unmsm", "der", "Derecho"),
    c("unmsm", "eco", "Economía"),
    c("unmsm", "edu", "Educación"),
    c("unmsm", "enf", "Enfermería"),
    c("unmsm", "civ", "Ingeniería Civil"),
    c("unmsm", "ele", "Ingeniería Electrónica"),
    c("unmsm", "ind", "Ingeniería Industrial"),
    c("unmsm", "sis", "Ingeniería de Sistemas", "informatica"),
    c("unmsm", "mec", "Ingeniería Mecánica"),
    c("unmsm", "med", "Medicina Humana"),
    c("unmsm", "nut", "Nutrición"),
    c("unmsm", "odo", "Odontología"),
    c("unmsm", "psi", "Psicología"),
    c("unmsm", "soc", "Sociología"),
    c("unmsm", "tur", "Turismo"),
    c("unmsm", "vet", "Medicina Veterinaria", "veterinaria"),
  ],

  // USMP
  usmp: [
    c("usmp", "adm", "Administración"),
    c("usmp", "arq", "Arquitectura"),
    c("usmp", "com", "Comunicación"),
    c("usmp", "con", "Contabilidad"),
    c("usmp", "der", "Derecho"),
    c("usmp", "eco", "Economía"),
    c("usmp", "edu", "Educación"),
    c("usmp", "enf", "Enfermería"),
    c("usmp", "civ", "Ingeniería Civil"),
    c("usmp", "ind", "Ingeniería Industrial"),
    c("usmp", "sis", "Ingeniería de Sistemas", "informatica"),
    c("usmp", "mec", "Ingeniería Mecánica"),
    c("usmp", "med", "Medicina Humana"),
    c("usmp", "mkt", "Marketing"),
    c("usmp", "odo", "Odontología"),
    c("usmp", "psi", "Psicología"),
    c("usmp", "tur", "Turismo y Hotelería"),
  ],

  // Universidad de Lima
  udl: [
    c("udl", "adm", "Administración"),
    c("udl", "arq", "Arquitectura"),
    c("udl", "com", "Comunicación"),
    c("udl", "con", "Contabilidad"),
    c("udl", "der", "Derecho"),
    c("udl", "eco", "Economía"),
    c("udl", "psi", "Psicología"),
    c("udl", "civ", "Ingeniería Civil"),
    c("udl", "ind", "Ingeniería Industrial"),
    c("udl", "sis", "Ingeniería de Sistemas", "informatica"),
    c("udl", "mkt", "Marketing"),
    c("udl", "nie", "Negocios Internacionales"),
    c("udl", "tur", "Turismo y Hotelería"),
  ],

  // UTP
  utp: [
    c("utp", "adm", "Administración de Empresas"),
    c("utp", "arq", "Arquitectura"),
    c("utp", "con", "Contabilidad"),
    c("utp", "der", "Derecho"),
    c("utp", "civ", "Ingeniería Civil"),
    c("utp", "amb", "Ingeniería Ambiental"),
    c("utp", "ind", "Ingeniería Industrial"),
    c("utp", "mec", "Ingeniería Mecánica"),
    c("utp", "sis", "Ingeniería de Software", "sistemas informatica"),
    c("utp", "ele", "Ingeniería Electrónica"),
    c("utp", "mkt", "Marketing"),
    c("utp", "psi", "Psicología"),
    c("utp", "enf", "Enfermería"),
    c("utp", "nut", "Nutrición"),
  ],

  // UCSUR
  ucsur: [
    c("ucsur", "adm", "Administración"),
    c("ucsur", "arq", "Arquitectura"),
    c("ucsur", "bio", "Biología"),
    c("ucsur", "com", "Comunicación"),
    c("ucsur", "con", "Contabilidad"),
    c("ucsur", "der", "Derecho"),
    c("ucsur", "eco", "Economía"),
    c("ucsur", "psi", "Psicología"),
    c("ucsur", "civ", "Ingeniería Civil"),
    c("ucsur", "ind", "Ingeniería Industrial"),
    c("ucsur", "sis", "Ingeniería de Sistemas", "informatica"),
    c("ucsur", "mkt", "Marketing"),
    c("ucsur", "med-vet", "Medicina Veterinaria"),
    c("ucsur", "nut", "Nutrición"),
    c("ucsur", "odo", "Odontología"),
  ],

  // UNALM — agraria
  unalm: [
    c("unalm", "agr", "Agronomía", "agronomia agricultura"),
    c("unalm", "zoo", "Zootecnia"),
    c("unalm", "eco", "Economía"),
    c("unalm", "adm", "Administración"),
    c("unalm", "bio", "Biología"),
    c("unalm", "ing-agr", "Ingeniería Agrícola"),
    c("unalm", "ing-ali", "Ingeniería de Alimentos", "alimentos"),
    c("unalm", "ing-for", "Ingeniería Forestal", "forestal"),
    c("unalm", "med-vet", "Medicina Veterinaria"),
    c("unalm", "nut", "Nutrición"),
    c("unalm", "est", "Estadística"),
  ],

  // UNFV
  unfv: remapCommon("unfv", COMMON_UNIVERSITY_CAREERS),

  // ESAN — negocios
  esan: [
    c("esan", "adm", "Administración"),
    c("esan", "con", "Contabilidad"),
    c("esan", "eco", "Economía"),
    c("esan", "fin", "Finanzas"),
    c("esan", "mkt", "Marketing"),
    c("esan", "nie", "Negocios Internacionales"),
  ],

  // UNSA — Arequipa
  unsa: [
    c("unsa", "adm", "Administración"),
    c("unsa", "arq", "Arquitectura"),
    c("unsa", "bio", "Biología"),
    c("unsa", "con", "Contabilidad"),
    c("unsa", "der", "Derecho"),
    c("unsa", "eco", "Economía"),
    c("unsa", "edu", "Educación"),
    c("unsa", "enf", "Enfermería"),
    c("unsa", "civ", "Ingeniería Civil"),
    c("unsa", "ind", "Ingeniería Industrial"),
    c("unsa", "sis", "Ingeniería de Sistemas", "informatica"),
    c("unsa", "med", "Medicina Humana"),
    c("unsa", "odo", "Odontología"),
    c("unsa", "psi", "Psicología"),
    c("unsa", "tur", "Turismo"),
  ],

  // UDEP — Piura
  udep: [
    c("udep", "adm", "Administración"),
    c("udep", "arq", "Arquitectura"),
    c("udep", "com", "Comunicación"),
    c("udep", "con", "Contabilidad"),
    c("udep", "der", "Derecho"),
    c("udep", "eco", "Economía"),
    c("udep", "psi", "Psicología"),
    c("udep", "civ", "Ingeniería Civil"),
    c("udep", "ind", "Ingeniería Industrial"),
    c("udep", "sis", "Ingeniería de Sistemas", "informatica"),
    c("udep", "mkt", "Marketing"),
    c("udep", "med", "Medicina Humana"),
    c("udep", "enf", "Enfermería"),
  ],

  // URP — Ricardo Palma
  urp: [
    c("urp", "adm", "Administración"),
    c("urp", "arq", "Arquitectura"),
    c("urp", "com", "Comunicación"),
    c("urp", "con", "Contabilidad"),
    c("urp", "der", "Derecho"),
    c("urp", "eco", "Economía"),
    c("urp", "psi", "Psicología"),
    c("urp", "civ", "Ingeniería Civil"),
    c("urp", "ind", "Ingeniería Industrial"),
    c("urp", "sis", "Ingeniería de Sistemas", "informatica"),
    c("urp", "mkt", "Marketing"),
    c("urp", "enf", "Enfermería"),
    c("urp", "nut", "Nutrición"),
  ],

  // UCV — César Vallejo
  ucv: remapCommon("ucv", COMMON_UNIVERSITY_CAREERS),

  // UTEC
  utec: [
    c("utec", "arq", "Arquitectura"),
    c("utec", "civ", "Ingeniería Civil"),
    c("utec", "amb", "Ingeniería Ambiental"),
    c("utec", "ind", "Ingeniería Industrial"),
    c("utec", "mec", "Ingeniería Mecatrónica"),
    c("utec", "sis", "Ingeniería de Sistemas", "informatica software"),
    c("utec", "ele", "Ingeniería Eléctrica"),
    c("utec", "qui", "Ingeniería Química"),
    c("utec", "bio", "Ingeniería Biomédica"),
    c("utec", "neg", "Negocios"),
    c("utec", "dis", "Diseño"),
  ],

  // UCAL
  ucal: remapCommon("ucal", COMMON_UNIVERSITY_CAREERS),

  // UPN — Norte
  upn: remapCommon("upn", COMMON_UNIVERSITY_CAREERS),
};

/** Devuelve carreras para una universidad; fallback al catálogo común si no hay entrada. */
export function getCareersByUniversityId(universityId: string): StudentOnboardingOption[] {
  const careers = CAREERS_BY_UNIVERSITY_ID[universityId];
  if (careers?.length) return careers;
  return remapCommon(universityId, COMMON_UNIVERSITY_CAREERS);
}
