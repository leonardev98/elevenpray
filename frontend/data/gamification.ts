import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Check,
  CheckCircle2,
  Flame,
  Heart,
  Star,
  Sun,
  Trophy,
  Users,
  Zap,
} from "lucide-react";

export const LUCIDE_ICON_MAP: Record<string, LucideIcon> = {
  Flame,
  Sun,
  Trophy,
  CheckCircle2,
  BookOpen,
  Zap,
  Users,
  Star,
  Heart,
  Check,
};

export function getLucideIcon(name: string): LucideIcon {
  return LUCIDE_ICON_MAP[name] ?? Star;
}

export type InsigniaDesbloqueada = {
  id: number;
  nombre: string;
  descripcion: string;
  icono: string;
  desbloqueada: true;
  fecha: string;
};

export type InsigniaBloqueada = {
  id: number;
  nombre: string;
  descripcion: string;
  icono: string;
  desbloqueada: false;
  progreso: number;
  total: number;
};

export type Insignia = InsigniaDesbloqueada | InsigniaBloqueada;

export type ActividadHoy = {
  id: string;
  label: string;
  icono: string;
  xp: number;
  completado: boolean;
};

export type GamificationData = {
  user: {
    nombre: string;
    nivel: number;
    titulo: string;
    xpActual: number;
    xpSiguienteNivel: number;
    avatarInicial: string;
  };
  tituloSiguienteNivel: string;
  rachas: {
    estudio: {
      actual: number;
      mejor: number;
      hoy: boolean;
      semana: boolean[];
    };
    tareas: {
      actual: number;
      mejor: number;
      hoy: boolean;
      semana: boolean[];
    };
  };
  xpHoy: number;
  xpMetaDiaria: number;
  actividadesHoy: ActividadHoy[];
  insignias: Insignia[];
  historialXP: { dia: string; xp: number }[];
  historialSemanas: {
    estudio: boolean[][];
    tareas: boolean[][];
  };
  xpTareasSemana: number;
  comparacionSemana: { porcentaje: number };
  ranking: {
    posicion: number;
    nombre: string;
    universidad: string;
    xp: number;
    avatarColor: string;
    esUsuario?: boolean;
  }[];
};

export const gamificationData: GamificationData = {
  user: {
    nombre: "Alejandro",
    nivel: 7,
    titulo: "Estudiante Constante",
    xpActual: 2340,
    xpSiguienteNivel: 3000,
    avatarInicial: "A",
  },
  tituloSiguienteNivel: "Estudiante Avanzado",
  rachas: {
    estudio: {
      actual: 12,
      mejor: 21,
      hoy: true,
      semana: [true, true, true, false, true, true, true],
    },
    tareas: {
      actual: 5,
      mejor: 14,
      hoy: false,
      semana: [true, true, false, false, true, false, false],
    },
  },
  xpHoy: 85,
  xpMetaDiaria: 100,
  actividadesHoy: [
    { id: "pdf", label: "Chat PDF", icono: "BookOpen", xp: 20, completado: true },
    { id: "quiz", label: "Quiz", icono: "Zap", xp: 20, completado: true },
    { id: "checkin", label: "Check-in", icono: "Heart", xp: 20, completado: true },
    { id: "tarea", label: "Tarea", icono: "CheckCircle2", xp: 20, completado: false },
    { id: "comunidad", label: "Comunidad", icono: "Users", xp: 20, completado: false },
  ],
  insignias: [
    {
      id: 1,
      nombre: "Primera semana",
      descripcion: "7 días seguidos de estudio",
      icono: "Flame",
      desbloqueada: true,
      fecha: "12 mayo 2026",
    },
    {
      id: 2,
      nombre: "Madrugador",
      descripcion: "Estudia antes de las 8am por 3 días",
      icono: "Sun",
      desbloqueada: true,
      fecha: "15 mayo 2026",
    },
    {
      id: 3,
      nombre: "Racha de oro",
      descripcion: "21 días seguidos de estudio",
      icono: "Trophy",
      desbloqueada: true,
      fecha: "18 mayo 2026",
    },
    {
      id: 4,
      nombre: "Tarea killer",
      descripcion: "Completa 10 tareas en una semana",
      icono: "CheckCircle2",
      desbloqueada: true,
      fecha: "10 mayo 2026",
    },
    {
      id: 5,
      nombre: "Lector voraz",
      descripcion: "Sube 5 PDFs y chatea con todos",
      icono: "BookOpen",
      desbloqueada: false,
      progreso: 3,
      total: 5,
    },
    {
      id: 6,
      nombre: "Quiz master",
      descripcion: "Completa 20 quizzes",
      icono: "Zap",
      desbloqueada: false,
      progreso: 12,
      total: 20,
    },
    {
      id: 7,
      nombre: "Comunidad activa",
      descripcion: "Publica 5 apuntes en la comunidad",
      icono: "Users",
      desbloqueada: false,
      progreso: 1,
      total: 5,
    },
    {
      id: 8,
      nombre: "Mes perfecto",
      descripcion: "30 días seguidos sin romper racha",
      icono: "Star",
      desbloqueada: false,
      progreso: 12,
      total: 30,
    },
    {
      id: 9,
      nombre: "Bienestar primero",
      descripcion: "Completa 7 check-ins emocionales seguidos",
      icono: "Heart",
      desbloqueada: false,
      progreso: 4,
      total: 7,
    },
  ],
  historialXP: [
    { dia: "Lun", xp: 120 },
    { dia: "Mar", xp: 85 },
    { dia: "Mié", xp: 0 },
    { dia: "Jue", xp: 200 },
    { dia: "Vie", xp: 150 },
    { dia: "Sáb", xp: 90 },
    { dia: "Hoy", xp: 85 },
  ],
  historialSemanas: {
    estudio: [
      [true, true, true, true, true, true, true],
      [true, true, false, true, true, true, true],
      [true, true, true, true, false, true, true],
      [true, true, true, false, true, true, true],
    ],
    tareas: [
      [true, true, true, true, false, true, true],
      [false, true, true, true, true, false, true],
      [true, false, true, false, true, true, false],
      [true, true, false, false, true, false, false],
    ],
  },
  xpTareasSemana: 340,
  comparacionSemana: { porcentaje: 12 },
  ranking: [
    { posicion: 1, nombre: "María C.", universidad: "PUCP", xp: 4200, avatarColor: "#7C3AED" },
    { posicion: 2, nombre: "Carlos R.", universidad: "UNI", xp: 3800, avatarColor: "#059669" },
    {
      posicion: 3,
      nombre: "Tú",
      universidad: "UPC",
      xp: 2340,
      avatarColor: "#2563EB",
      esUsuario: true,
    },
    { posicion: 4, nombre: "Valeria T.", universidad: "UPC", xp: 2100, avatarColor: "#D97706" },
    { posicion: 5, nombre: "Diego F.", universidad: "UNMSM", xp: 1950, avatarColor: "#DC2626" },
  ],
};

/** L=0 … D=6. Mock alineado con martes (índice 1). */
export const MOCK_TODAY_INDEX = 1;

export const DAY_LABELS = ["L", "M", "X", "J", "V", "S", "D"] as const;

export function getTodayWeekIndex(): number {
  const jsDay = new Date().getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
}

export function getTotalXpSemana(historial: { xp: number }[]): number {
  return historial.reduce((sum, d) => sum + d.xp, 0);
}
