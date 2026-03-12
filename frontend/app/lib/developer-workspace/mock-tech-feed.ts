import type { TechFeedItem } from "./types";

export const MOCK_TECH_FEED: TechFeedItem[] = [
  {
    id: "tf1",
    title: "React 19 use() and Suspense patterns",
    source: "React Blog",
    tag: "frontend",
    time: "2h ago",
  },
  {
    id: "tf2",
    title: "Node.js 22 LTS release",
    source: "Node.js",
    tag: "backend",
    time: "5h ago",
  },
  {
    id: "tf3",
    title: "Claude 3.5 Sonnet API updates",
    source: "Anthropic",
    tag: "ai",
    time: "1d ago",
  },
  {
    id: "tf4",
    title: "Docker Compose v2 best practices",
    source: "Docker Blog",
    tag: "devops",
    time: "3h ago",
  },
  {
    id: "tf5",
    title: "Vercel Edge Config GA",
    source: "Vercel",
    tag: "cloud",
    time: "6h ago",
  },
  {
    id: "tf6",
    title: "shadcn/ui Command component",
    source: "shadcn",
    tag: "design",
    time: "1d ago",
  },
];
