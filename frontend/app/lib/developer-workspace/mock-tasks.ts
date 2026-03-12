import type { Task } from "./types";

export const MOCK_TASKS: Task[] = [
  {
    id: "t1",
    title: "Implement Command Palette",
    priority: "high",
    tag: "feature",
    status: "done",
    projectId: "2",
    dueToday: true,
  },
  {
    id: "t2",
    title: "Add Vault section UI",
    priority: "high",
    tag: "feature",
    status: "inProgress",
    projectId: "2",
    dueToday: true,
  },
  {
    id: "t3",
    title: "Fix login redirect on expired token",
    priority: "medium",
    tag: "bug",
    status: "todo",
    projectId: "1",
    dueToday: false,
    dueAt: "2025-03-14",
  },
  {
    id: "t4",
    title: "Write README for Node Toolkit",
    priority: "low",
    status: "todo",
    projectId: "5",
    dueToday: false,
  },
];
