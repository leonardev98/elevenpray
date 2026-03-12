import { sileo } from "sileo";

/**
 * Helpers de notificaciones para mejorar la UX.
 * Usa Sileo (toasts con animaciones) para éxito, error, info y avisos.
 */
export const toast = {
  success: (title: string, description?: string) =>
    sileo.success({ title, description }),

  error: (title: string, description?: string) =>
    sileo.error({ title, description }),

  warning: (title: string, description?: string) =>
    sileo.warning({ title, description }),

  info: (title: string, description?: string) =>
    sileo.info({ title, description }),

  /** Para operaciones async: muestra loading → success/error según el resultado */
  promise: sileo.promise,
};
