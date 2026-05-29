import { computeLevelProgress, XP_PER_LEVEL } from "@/data/gamification-level";
import type { ActivitySummaryDto, HistorialXpDiaDto } from "./api";

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

const EMPTY_WEEK: HistorialXpDiaDto[] = [
  { dia: "Lun", xp: 0 },
  { dia: "Mar", xp: 0 },
  { dia: "Mié", xp: 0 },
  { dia: "Jue", xp: 0 },
  { dia: "Vie", xp: 0 },
  { dia: "Sáb", xp: 0 },
  { dia: "Hoy", xp: 0 },
];

/**
 * Asegura campos de nivel/XP aunque el backend aún no exponga la versión nueva del summary.
 */
export function normalizeActivitySummary(raw: ActivitySummaryDto): ActivitySummaryDto {
  let totalXp = isFiniteNumber(raw.totalXp) ? raw.totalXp : undefined;

  if (totalXp === undefined && isFiniteNumber(raw.nivel) && isFiniteNumber(raw.xpActual)) {
    totalXp = (raw.nivel - 1) * XP_PER_LEVEL + raw.xpActual;
  }

  const level = computeLevelProgress(totalXp ?? 0);

  return {
    ...raw,
    xpHoy: isFiniteNumber(raw.xpHoy) ? raw.xpHoy : 0,
    xpMetaDiaria: isFiniteNumber(raw.xpMetaDiaria) ? raw.xpMetaDiaria : 100,
    xpTareasSemana: isFiniteNumber(raw.xpTareasSemana) ? raw.xpTareasSemana : 0,
    totalXp: level.totalXp,
    nivel: level.nivel,
    titulo: typeof raw.titulo === "string" && raw.titulo ? raw.titulo : level.titulo,
    tituloSiguienteNivel:
      typeof raw.tituloSiguienteNivel === "string" && raw.tituloSiguienteNivel
        ? raw.tituloSiguienteNivel
        : level.tituloSiguienteNivel,
    xpActual: level.xpActual,
    xpSiguienteNivel: level.xpSiguienteNivel,
    historialXP:
      Array.isArray(raw.historialXP) && raw.historialXP.length > 0
        ? raw.historialXP
        : EMPTY_WEEK,
  };
}
