import type { Project } from "./types";

export const MOCK_PROJECTS: Project[] = [
  {
    id: "1",
    name: "Skincare Workspace",
    stack: ["Next.js", "TypeScript", "Tailwind"],
    status: "active",
    lastAccessed: "2025-03-12T09:00:00Z",
    badges: ["Production"],
  },
  {
    id: "2",
    name: "Developer OS",
    stack: ["Next.js", "React", "Framer Motion"],
    status: "active",
    lastAccessed: "2025-03-12T08:30:00Z",
    badges: ["WIP"],
  },
  {
    id: "3",
    name: "Ecommerce Artesanías",
    stack: ["Next.js", "NestJS", "PostgreSQL"],
    status: "active",
    lastAccessed: "2025-03-11T16:00:00Z",
    badges: ["Staging"],
  },
  {
    id: "4",
    name: "Interview Prep",
    stack: ["TypeScript", "LeetCode"],
    status: "paused",
    lastAccessed: "2025-03-08T10:00:00Z",
  },
  {
    id: "5",
    name: "Node Toolkit",
    stack: ["Node.js", "CLI"],
    status: "active",
    lastAccessed: "2025-03-10T14:00:00Z",
    badges: ["Internal"],
  },
];
