import type { Note } from "./types";

export const MOCK_NOTES: Note[] = [
  {
    id: "n1",
    type: "idea",
    title: "Cache prompt results per project",
    content: "Store last AI response per (projectId, promptId) to avoid re-running same prompt.",
    tags: ["feature", "ai"],
    createdAt: "2025-03-12T09:30:00Z",
    projectId: "2",
  },
  {
    id: "n2",
    type: "command",
    title: "DB migration",
    content: "npx prisma migrate dev --name add_vault_table",
    tags: ["prisma", "db"],
    createdAt: "2025-03-11T16:00:00Z",
  },
  {
    id: "n3",
    type: "debugNote",
    title: "Hydration mismatch",
    content: "Date in header was rendering server vs client differently. Fixed with suppressHydrationWarning on time element.",
    tags: ["nextjs", "react"],
    createdAt: "2025-03-10T11:00:00Z",
  },
];
