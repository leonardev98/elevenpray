import type { ProfileCategory } from "./types";

export const MOCK_PROFILE: ProfileCategory[] = [
  {
    id: "frontend",
    name: "Frontend",
    items: ["React", "Next.js", "TypeScript", "Tailwind", "UI systems"],
  },
  {
    id: "backend",
    name: "Backend",
    items: ["Node.js", "NestJS", "Go", "PostgreSQL"],
  },
  {
    id: "infra",
    name: "Infra",
    items: ["Docker", "Kubernetes", "AWS", "CI/CD"],
  },
  {
    id: "ai",
    name: "AI",
    items: ["OpenAI", "LangChain", "RAG", "Agents"],
  },
  {
    id: "databases",
    name: "Databases",
    items: ["PostgreSQL", "MySQL", "Redis"],
  },
];
