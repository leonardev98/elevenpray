export const POMODORO_FOCUS_SECONDS = 25 * 60;
export const POMODORO_BREAK_SECONDS = 5 * 60;
export const TOTAL_POMODORO_ROUNDS = 4;

/** Presets para la página de bienestar (selección manual). */
export const POMODORO_PRESETS = [
  { id: "study", label: "25 min", seconds: POMODORO_FOCUS_SECONDS },
  { id: "short", label: "15 min", seconds: 15 * 60 },
  { id: "break", label: "5 min", seconds: POMODORO_BREAK_SECONDS },
] as const;

export type StretchTip = {
  id: string;
  title: string;
  description: string;
};

export const STRETCH_BREAK_TIPS: StretchTip[] = [
  {
    id: "neck",
    title: "Cuello y hombros",
    description:
      "Inclina la oreja hacia el hombro 15 s por lado. Luego rueda los hombros hacia atrás 8 veces.",
  },
  {
    id: "wrists",
    title: "Muñecas",
    description:
      "Extiende un brazo con la palma hacia arriba y tira suavemente de los dedos con la otra mano. 20 s cada lado.",
  },
  {
    id: "back",
    title: "Espalda",
    description:
      "Entrelaza los dedos detrás de la cabeza, abre los codos y estira el pecho. Mantén 20 s respirando lento.",
  },
  {
    id: "eyes",
    title: "Vista",
    description:
      "Regla 20-20-20: mira algo a 6 m durante 20 s. Parpadea con calma para hidratar los ojos.",
  },
  {
    id: "legs",
    title: "Piernas",
    description:
      "Levántate, flexiona una rodilla hacia el pecho 15 s y cambia de pierna. Camina 30 s si puedes.",
  },
];
