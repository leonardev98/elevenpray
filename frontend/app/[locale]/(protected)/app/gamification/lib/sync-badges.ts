import type { GamificationData, Insignia } from "@/data/gamification";

/** Sincroniza progreso de insignias de referidos con el contador real */
export function syncReferralBadges(data: GamificationData): GamificationData {
  const activados = data.extras.referidos.activados;
  const insignias: Insignia[] = data.insignias.map((ins) => {
    if (ins.nombre === "Embajador") {
      if (activados >= 1) {
        if (ins.desbloqueada) return ins;
        return {
          id: ins.id,
          nombre: ins.nombre,
          descripcion: ins.descripcion,
          icono: ins.icono,
          desbloqueada: true as const,
          fecha: new Date().toLocaleDateString("es-PE", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
        };
      }
      if (ins.desbloqueada) {
        return {
          id: ins.id,
          nombre: ins.nombre,
          descripcion: ins.descripcion,
          icono: ins.icono,
          desbloqueada: false as const,
          progreso: activados,
          total: 1,
        };
      }
      return { ...ins, progreso: activados, total: 1 };
    }
    if (ins.nombre === "Mentor del campus" && !ins.desbloqueada) {
      if (activados >= 3) {
        return {
          id: ins.id,
          nombre: ins.nombre,
          descripcion: ins.descripcion,
          icono: ins.icono,
          desbloqueada: true as const,
          fecha: new Date().toLocaleDateString("es-PE", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
        };
      }
      return { ...ins, progreso: activados, total: 3 };
    }
    if (ins.nombre === "Fundador Mitsyy" && !ins.desbloqueada) {
      if (activados >= 5) {
        return {
          id: ins.id,
          nombre: ins.nombre,
          descripcion: ins.descripcion,
          icono: ins.icono,
          desbloqueada: true as const,
          fecha: new Date().toLocaleDateString("es-PE", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
        };
      }
      return { ...ins, progreso: activados, total: 5 };
    }
    if (ins.nombre === "Leyenda del campus" && !ins.desbloqueada) {
      if (activados >= 10) {
        return {
          id: ins.id,
          nombre: ins.nombre,
          descripcion: ins.descripcion,
          icono: ins.icono,
          desbloqueada: true as const,
          fecha: new Date().toLocaleDateString("es-PE", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
        };
      }
      return { ...ins, progreso: activados, total: 10 };
    }
    return ins;
  });

  return { ...data, insignias };
}
