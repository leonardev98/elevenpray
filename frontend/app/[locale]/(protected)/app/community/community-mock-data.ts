import type {
  CommunityTemplate,
  TopContributor,
  TrendItem,
} from "./community-types";
import { getAuthorColor } from "./community-constants";

// NOTA: estos mocks se mantienen mientras la sidebar (Tendencias / Top aportes)
// y la tab Plantillas no estén conectados a datos reales.

export const MOCK_TEMPLATES: CommunityTemplate[] = [
  {
    id: "t1",
    name: "Sistema Nervioso Central — mapa completo",
    author: "Ana R.",
    university: "UNI",
    downloads: 234,
    rating: 4.8,
  },
  {
    id: "t2",
    name: "Plantilla de laboratorio de química",
    author: "Luis M.",
    university: "UPC",
    downloads: 189,
    rating: 4.6,
  },
  {
    id: "t3",
    name: "Resumen ejecutivo de casos de negocio",
    author: "Carla S.",
    university: "PUCP",
    downloads: 312,
    rating: 4.9,
  },
  {
    id: "t4",
    name: "Diagrama de flujo algoritmos",
    author: "Diego F.",
    university: "UNMSM",
    downloads: 98,
    rating: 4.3,
  },
];

export const MOCK_TRENDS: TrendItem[] = [
  { id: "tr1", rank: 1, topic: "Integrales por partes", postCount: 48 },
  { id: "tr2", rank: 2, topic: "Cinemática rotacional", postCount: 31 },
  { id: "tr3", rank: 3, topic: "Estructuras de datos", postCount: 27 },
  { id: "tr4", rank: 4, topic: "Termodinámica I", postCount: 19 },
];

export const MOCK_TOP_CONTRIBUTORS: TopContributor[] = [
  {
    id: "tc1",
    name: "Ana R.",
    university: "UNI",
    initial: "A",
    color: getAuthorColor("Ana R."),
    contributions: 32,
  },
  {
    id: "tc2",
    name: "Diego F.",
    university: "UNMSM",
    initial: "D",
    color: getAuthorColor("Diego F."),
    contributions: 28,
  },
  {
    id: "tc3",
    name: "Carla S.",
    university: "PUCP",
    initial: "C",
    color: getAuthorColor("Carla S."),
    contributions: 24,
  },
];

export const FREQUENT_COURSES = ["Matemática", "Física", "Programación", "Comunicación"];

export const UNIVERSITY_FILTERS = ["Todas", "UNI", "UPC", "PUCP", "UNMSM"] as const;

export const USER_UNIVERSITY = {
  code: "UPC",
  fullName: "Universidad Peruana de Ciencias Aplicadas",
};
