import type { Prompt } from "./types";

export const MOCK_PROMPTS: Prompt[] = [
  {
    id: "p1",
    title: "Debug React re-renders",
    description: "Find unnecessary re-renders and suggest memo/useCallback",
    content:
      "Analyze this React component and list all causes of unnecessary re-renders. For each, suggest a fix (React.memo, useCallback, useMemo, or moving state).",
    category: "debugging",
    tags: ["react", "performance"],
    favorite: true,
    createdAt: "2025-03-10T10:00:00Z",
  },
  {
    id: "p2",
    title: "Refactor to hooks",
    description: "Convert class component to function + hooks",
    content:
      "Convert this class component to a function component using React hooks. Preserve all behavior and side effects.",
    category: "refactor",
    tags: ["react", "hooks"],
    favorite: false,
    createdAt: "2025-03-08T14:00:00Z",
  },
  {
    id: "p3",
    title: "Write unit tests",
    description: "Generate Jest/Vitest tests for the given code",
    content:
      "Write unit tests for this module. Use Jest (or Vitest). Cover happy path and main edge cases. Mock external dependencies.",
    category: "testing",
    tags: ["jest", "vitest"],
    favorite: true,
    projectId: "2",
    createdAt: "2025-03-11T09:00:00Z",
  },
  {
    id: "p4",
    title: "API design review",
    description: "Review REST/API design and suggest improvements",
    content:
      "Review this API design (endpoints, status codes, payloads). Suggest improvements for consistency, versioning, and error handling.",
    category: "apiDesign",
    tags: ["api", "rest"],
    favorite: false,
    createdAt: "2025-02-28T16:00:00Z",
  },
];
