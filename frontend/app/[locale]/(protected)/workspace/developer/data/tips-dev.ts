export const TIPS_DEV: string[] = [
  "Use AbortController to cancel fetch requests.",
  "Prefer optional chaining (?.) to avoid long && chains.",
  "Use Object.groupBy (or a polyfill) for grouping arrays by key.",
  "Lazy-load routes with next/dynamic to reduce initial bundle.",
  "Prefer CSS containment (contain: layout paint) for isolated components.",
  "Use requestIdleCallback for non-critical work in the main thread.",
  "Prefer FormData over JSON when uploading files.",
  "Use navigator.clipboard.writeText for copy-to-clipboard with fallback.",
  "Debounce search inputs to reduce API calls.",
  "Use React.useDeferredValue for non-urgent UI updates.",
];

export function getTipOfTheDay(): string {
  const day = new Date().getDate();
  const index = day % TIPS_DEV.length;
  return TIPS_DEV[index];
}
