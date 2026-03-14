"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "@/i18n/navigation";
import { pageTransition } from "@/lib/animations";

/**
 * Envuelve el contenido de la app y aplica la misma transición de página
 * que en el dashboard (fade + ligero slide) al cambiar de ruta.
 * Así la navegación desde landing → login/register tiene la misma experiencia
 * que entre páginas del área protegida.
 */
export function PageTransitionWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // next-intl puede devolver "" en la ruta raíz; clave estable evita pantalla en blanco al volver
  const stableKey = pathname && pathname !== "" ? pathname : "/";

  return (
    <AnimatePresence mode="sync">
      <motion.div
        key={stableKey}
        className="min-h-screen min-w-full"
        initial={pageTransition.initial}
        animate={pageTransition.animate}
        exit={pageTransition.exit}
        transition={pageTransition.transition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
