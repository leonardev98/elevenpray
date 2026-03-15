import type { Snippet } from "./types";

export const MOCK_SNIPPETS: Snippet[] = [
  {
    id: "s1",
    title: "useDebounce hook",
    language: "typescript",
    description: "Debounce a value with configurable delay",
    content: `function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debouncedValue;
}`,
    tags: ["react", "hooks"],
    favorite: true,
    lastUsed: "2025-03-12T08:15:00Z",
    timesUsed: 12,
  },
  {
    id: "s2",
    title: "retry with backoff",
    language: "typescript",
    description: "Retry async function with exponential backoff",
    content: `async function retry<T>(fn: () => Promise<T>, max = 3): Promise<T> {
  for (let i = 0; i < max; i++) {
    try {
      return await fn();
    } catch (e) {
      if (i === max - 1) throw e;
      await new Promise((r) => setTimeout(r, Math.pow(2, i) * 1000));
    }
  }
  throw new Error("Unreachable");
}`,
    tags: ["async", "util"],
    favorite: true,
    lastUsed: "2025-03-11T14:00:00Z",
    timesUsed: 8,
  },
  {
    id: "s3",
    title: "Next.js API route handler",
    language: "typescript",
    description: "Typed GET handler with error handling",
    content: `export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return Response.json({ error: "Missing id" }, { status: 400 });
    const data = await getData(id);
    return Response.json(data);
  } catch (e) {
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}`,
    tags: ["nextjs", "api"],
    favorite: false,
    lastUsed: "2025-03-10T09:00:00Z",
    timesUsed: 5,
  },
  {
    id: "s4",
    title: "fetch with timeout",
    language: "typescript",
    description: "Fetch with AbortController timeout",
    content: `async function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}`,
    tags: ["fetch", "async", "util"],
    favorite: true,
    lastUsed: "2025-03-13T11:00:00Z",
    timesUsed: 3,
  },
  {
    id: "s5",
    title: "node CLI template",
    language: "javascript",
    description: "Minimal Node.js CLI script template",
    content: `#!/usr/bin/env node
const args = process.argv.slice(2);
const [command, ...rest] = args;
if (!command) {
  console.error('Usage: node script.js <command> [options]');
  process.exit(1);
}
// Your CLI logic here
console.log('Running:', command, rest);
`,
    tags: ["node", "cli"],
    favorite: false,
    timesUsed: 1,
  },
];
