/** Configuración estática del sistema de gamificación Mitsyy */

export const REFERRAL_MILESTONES = [
  {
    activados: 1,
    label: "Embajador",
    rewards: ["+500 XP", 'Badge "Embajador"', "7 días Plus gratis"],
    badgeId: "embajador",
  },
  {
    activados: 3,
    label: "Mentor del campus",
    rewards: ["1 mes Plus gratis", 'Badge "Mentor del campus"'],
    badgeId: "mentor-campus",
  },
  {
    activados: 5,
    label: "Fundador Mitsyy",
    rewards: ["2 meses Pro", 'Badge dorado "Fundador Mitsyy"'],
    badgeId: "fundador-mitsyy",
  },
  {
    activados: 10,
    label: "Leyenda del campus",
    rewards: ["Premium vitalicio", "Badge legendario"],
    badgeId: "leyenda-campus",
  },
] as const;

export const REFERRAL_REFEREE_REWARD =
  "Tu invitado recibe 14 días de Plus gratis al activar su cuenta con tu código.";

export const XP_ECONOMY_RULES = [
  { id: "quiz", accion: "Quiz completado", xp: "+50 XP", nota: "+100 XP si sacas 100%" },
  { id: "flashcards", accion: "Sesión de flashcards", xp: "+10 XP", nota: "+30 XP con racha de 5 días" },
  { id: "apunte", accion: "Apunte usado por la comunidad", xp: "+200 XP", nota: "5+ usos" },
  { id: "racha-semanal", accion: "Racha semanal activa", xp: "×1.5 XP", nota: "Multiplicador toda la semana" },
  { id: "comunidad", accion: "Respuesta marcada útil", xp: "+100 XP" },
  { id: "parcial", accion: "Parcial aprobado (reportado)", xp: "+500 XP", nota: "Badge del curso" },
  { id: "referido", accion: "Referido activado", xp: "+500 XP", nota: "Ambos ganan" },
] as const;

export const LEAGUE_TIERS = ["bronce", "plata", "oro", "diamante"] as const;

export const CYCLE_SHIELDS_PER_CYCLE = 3;

export const MISSION_DEFINITIONS = [
  {
    id: "flashcards-daily",
    titulo: "Repasa 3 flashcards",
    descripcion: "Cualquier curso — menos de 5 min",
    xp: 30,
    total: 3,
    tipo: "diaria" as const,
  },
  {
    id: "quiz-semanal",
    titulo: "Completa un quiz",
    descripcion: "Cualquier curso de tu malla",
    xp: 50,
    total: 1,
    tipo: "semanal" as const,
  },
  {
    id: "comunidad-semanal",
    titulo: "Ayuda a un compañero",
    descripcion: "Responde en comunidad y que marquen útil",
    xp: 100,
    total: 1,
    tipo: "semanal" as const,
  },
] as const;

export function referralCodeFromUserId(userId: string): string {
  const slice = userId.replace(/-/g, "").slice(0, 6).toUpperCase();
  return `MITSYY-${slice || "CAMPUS"}`;
}
