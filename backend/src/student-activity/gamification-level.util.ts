/** XP necesario para pasar de nivel N a N+1 (progresión suave). */
export const XP_PER_LEVEL = 400;

const LEVEL_TITLES = [
  'Novato',
  'Estudiante',
  'Estudiante Activo',
  'Estudiante Constante',
  'Estudiante Avanzado',
  'Estudiante Destacado',
  'Maestro del estudio',
  'Leyenda del campus',
] as const;

export interface LevelProgress {
  nivel: number;
  titulo: string;
  tituloSiguienteNivel: string;
  xpActual: number;
  xpSiguienteNivel: number;
  totalXp: number;
}

export function computeLevelProgress(totalXp: number): LevelProgress {
  const safe = Math.max(0, Math.floor(totalXp));
  const nivel = Math.min(Math.floor(safe / XP_PER_LEVEL) + 1, 50);
  const xpAtLevelStart = (nivel - 1) * XP_PER_LEVEL;
  const xpActual = safe - xpAtLevelStart;
  const titulo = LEVEL_TITLES[Math.min(nivel - 1, LEVEL_TITLES.length - 1)] ?? LEVEL_TITLES[0];
  const tituloSiguienteNivel =
    LEVEL_TITLES[Math.min(nivel, LEVEL_TITLES.length - 1)] ?? 'Leyenda del campus';

  return {
    nivel,
    titulo,
    tituloSiguienteNivel,
    xpActual,
    xpSiguienteNivel: XP_PER_LEVEL,
    totalXp: safe,
  };
}

export function xpForActivityRow(row: {
  checkin: boolean;
  study: boolean;
  tasks: boolean;
}): number {
  let xp = 0;
  if (row.checkin) xp += 20;
  if (row.study) xp += 20;
  if (row.tasks) xp += 20;
  return xp;
}
