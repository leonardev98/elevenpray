import type { StudentOnboardingOption } from "./peru-student-onboarding";

export type UniversityPreviewMeta = {
  id: string;
  name: string;
  shortName: string;
  city: string;
  description: string;
  accentColor: string;
  imageUrl: string;
};

export const FEATURED_UNIVERSITY_PREVIEW: Record<string, UniversityPreviewMeta> = {
  unmsm: {
    id: "unmsm",
    name: "Universidad Nacional Mayor de San Marcos",
    shortName: "UNMSM",
    city: "Lima",
    description: "La universidad decana de América, con enfoque académico e investigación.",
    accentColor: "#8B0000",
    imageUrl:
      "https://elperuano.pe/fotografia/thumbnail/2023/07/24/000258128M.jpg",
  },
  pucp: {
    id: "pucp",
    name: "Pontificia Universidad Católica del Perú",
    shortName: "PUCP",
    city: "Lima",
    description: "Campus integral y una sólida formación profesional multidisciplinaria.",
    accentColor: "#003087",
    imageUrl: "https://picsum.photos/seed/pucp/900/1200",
  },
  udl: {
    id: "udl",
    name: "Universidad de Lima",
    shortName: "UL",
    city: "Lima",
    description: "Reconocida por su propuesta en negocios, derecho, comunicación e ingeniería.",
    accentColor: "#002147",
    imageUrl: "https://picsum.photos/seed/udl/900/1200",
  },
  upch: {
    id: "upch",
    name: "Universidad Peruana Cayetano Heredia",
    shortName: "UPCH",
    city: "Lima",
    description: "Referente nacional en ciencias de la salud y desarrollo científico.",
    accentColor: "#006400",
    imageUrl: "https://picsum.photos/seed/upch/900/1200",
  },
  uni: {
    id: "uni",
    name: "Universidad Nacional de Ingeniería",
    shortName: "UNI",
    city: "Lima",
    description: "Formación técnica y científica de alto nivel en ingeniería.",
    accentColor: "#CC0000",
    imageUrl:
      "https://admision.uni.edu.pe/wp-content/uploads/2022/10/edificio-uni-1-1024x681.png",
  },
  ucsur: {
    id: "ucsur",
    name: "Universidad Científica del Sur",
    shortName: "UCSUR",
    city: "Lima",
    description: "Modelo académico moderno con foco en innovación y empleabilidad.",
    accentColor: "#1B4F72",
    imageUrl:
      "https://elcomercio.pe/resizer/v2/WVTOYBNN4BF6NG6H7UMPC6VJ2M.jpg?auth=35aceb9c2e204d0ff0e55614e76b96f5a8c7bfc690fffc93af1c4272bd69aa6e&width=1200&height=675&quality=75&smart=true",
  },
  upc: {
    id: "upc",
    name: "Universidad Peruana de Ciencias Aplicadas",
    shortName: "UPC",
    city: "Lima",
    description: "Orientada a competencias, internacionalización y experiencia digital.",
    accentColor: "#E63946",
    imageUrl:
      "https://noticias.upc.edu.pe/wp-content/uploads/2020/08/Monterrico6-scaled.jpg",
  },
  usil: {
    id: "usil",
    name: "Universidad San Ignacio de Loyola",
    shortName: "USIL",
    city: "Lima",
    description: "Perfil global con programas ligados a negocios, hotelería y gestión.",
    accentColor: "#F4A300",
    imageUrl: "https://picsum.photos/seed/usil/900/1200",
  },
};

export function getUniversityPreviewMeta(
  university: StudentOnboardingOption | undefined,
): UniversityPreviewMeta | null {
  if (!university) return null;
  return FEATURED_UNIVERSITY_PREVIEW[university.id] ?? null;
}
