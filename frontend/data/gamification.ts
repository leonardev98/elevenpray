import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Check,
  CheckCircle2,
  Crown,
  Flame,
  Gift,
  Heart,
  Medal,
  Shield,
  Sparkles,
  Star,
  Sun,
  Target,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import {
  CYCLE_SHIELDS_PER_CYCLE,
  REFERRAL_MILESTONES,
  referralCodeFromUserId,
} from "./gamification-config";

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
  Crown,
  Gift,
  Shield,
  Medal,
  Target,
  Sparkles,
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

export type InsigniaRareza = "comun" | "raro" | "epico" | "legendario";

export type ReferralTierProgress = {
  activados: number;
  label: string;
  rewards: string[];
  completado: boolean;
};

export type ReferralState = {
  codigo: string;
  activados: number;
  usosEstaSemana: number;
  tiers: ReferralTierProgress[];
  codigoReferidor: string | null;
  puedeAplicarCodigo: boolean;
};

export type CycleShieldState = {
  disponibles: number;
  maxPorCiclo: number;
  usadosEsteCiclo: number;
  cicloLabel: string;
};

export type LeagueTier = "bronce" | "plata" | "oro" | "diamante";

export type LeagueState = {
  tier: LeagueTier;
  posicion: number;
  totalParticipantes: number;
  xpSemana: number;
  carrera: string;
  universidad: string;
  diasRestantes: number;
  enZonaAscenso: boolean;
  enZonaDescenso: boolean;
};

export type Mission = {
  id: string;
  titulo: string;
  descripcion: string;
  xp: number;
  progreso: number;
  total: number;
  tipo: "diaria" | "semanal";
  completada: boolean;
  reclamada: boolean;
};

export type SharedStreakPartner = {
  id: string;
  nombre: string;
  inicial: string;
  racha: number;
  estudioHoy: boolean;
  color: string;
};

export type TreasureReward = {
  id: string;
  tipo: "xp" | "escudo" | "multiplicador";
  label: string;
  valor: number;
};

export type GamificationExtras = {
  referidos: ReferralState;
  escudos: CycleShieldState;
  liga: LeagueState;
  misiones: Mission[];
  rachaCompartida: SharedStreakPartner[];
  multiplicadorActivo: {
    activo: boolean;
    factor: number;
    hasta: string | null;
  };
  rachaSemanalActiva: boolean;
  ultimoCofre: TreasureReward | null;
};

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
    carrera?: string;
    xp: number;
    avatarColor: string;
    esUsuario?: boolean;
  }[];
  extras: GamificationExtras;
};

export function createDefaultExtras(opts?: {
  userId?: string;
  career?: string;
  university?: string;
  cycle?: string;
  referralActivados?: number;
}): GamificationExtras {
  const activados = opts?.referralActivados ?? 0;
  const codigo = opts?.userId ? referralCodeFromUserId(opts.userId) : "MITSYY-CAMPUS";

  return {
    referidos: {
      codigo,
      activados,
      usosEstaSemana: 0,
      codigoReferidor: null,
      puedeAplicarCodigo: true,
      tiers: REFERRAL_MILESTONES.map((t) => ({
        activados: t.activados,
        label: t.label,
        rewards: [...t.rewards],
        completado: activados >= t.activados,
      })),
    },
    escudos: {
      disponibles: CYCLE_SHIELDS_PER_CYCLE,
      maxPorCiclo: CYCLE_SHIELDS_PER_CYCLE,
      usadosEsteCiclo: 0,
      cicloLabel: opts?.cycle ? `Ciclo ${opts.cycle}` : "Ciclo actual",
    },
    liga: {
      tier: "bronce",
      posicion: 0,
      totalParticipantes: 0,
      xpSemana: 0,
      carrera: opts?.career ?? "",
      universidad: opts?.university ?? "",
      diasRestantes: 0,
      enZonaAscenso: false,
      enZonaDescenso: false,
    },
    misiones: [
      {
        id: "flashcards-calc",
        titulo: "3 flashcards de Cálculo",
        descripcion: "Repasa derivadas en menos de 5 min",
        xp: 30,
        progreso: 2,
        total: 3,
        tipo: "diaria",
        completada: false,
        reclamada: false,
      },
      {
        id: "quiz-jueves",
        titulo: "Quiz antes del jueves",
        descripcion: "Completa un quiz de cualquier curso",
        xp: 50,
        progreso: 1,
        total: 1,
        tipo: "semanal",
        completada: true,
        reclamada: false,
      },
      {
        id: "ayuda-comunidad",
        titulo: "Ayuda a un compañero",
        descripcion: "Responde en comunidad y que marquen útil",
        xp: 100,
        progreso: 0,
        total: 1,
        tipo: "semanal",
        completada: false,
        reclamada: false,
      },
    ],
    rachaCompartida: [],
    multiplicadorActivo: { activo: false, factor: 1.5, hasta: null },
    rachaSemanalActiva: false,
    ultimoCofre: null,
  };
}

export const gamificationData: GamificationData = {
  user: {
    nombre: "",
    nivel: 1,
    titulo: "Novato",
    xpActual: 0,
    xpSiguienteNivel: 400,
    avatarInicial: "E",
  },
  tituloSiguienteNivel: "Estudiante",
  rachas: {
    estudio: {
      actual: 0,
      mejor: 0,
      hoy: false,
      semana: [false, false, false, false, false, false, false],
    },
    tareas: {
      actual: 0,
      mejor: 0,
      hoy: false,
      semana: [false, false, false, false, false, false, false],
    },
  },
  xpHoy: 0,
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
      nombre: "Madrugador",
      descripcion: "3 días seguidos estudiando antes de las 8am",
      icono: "Sun",
      desbloqueada: false,
      progreso: 0,
      total: 3,
    },
    {
      id: 2,
      nombre: "El que no falla",
      descripcion: "Racha de 30 días sin romper",
      icono: "Flame",
      desbloqueada: false,
      progreso: 12,
      total: 30,
    },
    {
      id: 3,
      nombre: "Sube sílabos",
      descripcion: "Contribuiste con 5 cursos a la comunidad",
      icono: "BookOpen",
      desbloqueada: false,
      progreso: 2,
      total: 5,
    },
    {
      id: 4,
      nombre: "Parcialero",
      descripcion: "Completaste 10 quizzes pre-examen",
      icono: "Zap",
      desbloqueada: false,
      progreso: 6,
      total: 10,
    },
    {
      id: 5,
      nombre: "Embajador",
      descripcion: "1 referido activado con tu código",
      icono: "Users",
      desbloqueada: false,
      progreso: 0,
      total: 1,
    },
    {
      id: 6,
      nombre: "Mentor del campus",
      descripcion: "3 referidos activados",
      icono: "Medal",
      desbloqueada: false,
      progreso: 2,
      total: 3,
    },
    {
      id: 7,
      nombre: "Fundador Mitsyy",
      descripcion: "5 referidos activados — badge dorado",
      icono: "Crown",
      desbloqueada: false,
      progreso: 2,
      total: 5,
    },
    {
      id: 8,
      nombre: "Leyenda del campus",
      descripcion: "10+ referidos — acceso Premium vitalicio",
      icono: "Sparkles",
      desbloqueada: false,
      progreso: 2,
      total: 10,
    },
    {
      id: 9,
      nombre: "Fundador",
      descripcion: "Usuario de la primera cohorte — permanente",
      icono: "Star",
      desbloqueada: false,
      progreso: 0,
      total: 1,
    },
  ],
  historialXP: [
    { dia: "Lun", xp: 0 },
    { dia: "Mar", xp: 0 },
    { dia: "Mié", xp: 0 },
    { dia: "Jue", xp: 0 },
    { dia: "Vie", xp: 0 },
    { dia: "Sáb", xp: 0 },
    { dia: "Hoy", xp: 0 },
  ],
  historialSemanas: {
    estudio: Array.from({ length: 4 }, () => [false, false, false, false, false, false, false]),
    tareas: Array.from({ length: 4 }, () => [false, false, false, false, false, false, false]),
  },
  xpTareasSemana: 0,
  comparacionSemana: { porcentaje: 0 },
  ranking: [],
  extras: createDefaultExtras(),
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
