export const TOPIC_TYPES = [
  { id: "rutina", label: "Rutina", icon: "📅" },
  { id: "notas", label: "Notas", icon: "📝" },
  { id: "lista", label: "Lista", icon: "✓" },
  { id: "meta", label: "Meta", icon: "🎯" },
  { id: "otro", label: "Otro", icon: "•" },
] as const;

export type TopicTypeId = (typeof TOPIC_TYPES)[number]["id"];

export interface Topic {
  id: string;
  title: string;
  type: TopicTypeId;
  createdAt: number;
}
