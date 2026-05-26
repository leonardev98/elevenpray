export type CalloutVariant = "idea" | "warning" | "pin" | "info";

export type BlockTheme = "teoria" | "ejemplo" | "importante" | "examen";

export type BlockThemeConfig = {
  id: BlockTheme;
  label: string;
  /** Variable CSS o color hex usado para el borde izquierdo. */
  colorVar: string;
};

export const BLOCK_THEMES: BlockThemeConfig[] = [
  { id: "teoria", label: "Teoría", colorVar: "var(--course-4-fg)" },
  { id: "ejemplo", label: "Ejemplo", colorVar: "var(--course-2-fg)" },
  { id: "importante", label: "Importante", colorVar: "var(--course-6-fg)" },
  { id: "examen", label: "Examen", colorVar: "var(--accent)" },
];

export const CALLOUT_VARIANTS: Record<CalloutVariant, { label: string; iconName: string }> = {
  idea: { label: "Idea", iconName: "Lightbulb" },
  warning: { label: "Advertencia", iconName: "AlertTriangle" },
  pin: { label: "Anclado", iconName: "Pin" },
  info: { label: "Información", iconName: "Info" },
};
