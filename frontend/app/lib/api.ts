const baseUrl =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  "http://localhost:8080";

export function getBaseUrl() {
  return baseUrl;
}

export function getAuthHeaders(token: string | null): HeadersInit {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

/** Mensaje claro cuando el API no está levantado (puerto 8080 por defecto). */
export function formatApiConnectionError(err: unknown): string {
  const base = getBaseUrl();
  const hint =
    "Comprueba que el backend esté en marcha: en otra terminal ejecuta `cd backend && npm run start:dev` y espera «Nest application successfully started».";
  if (err instanceof TypeError) {
    const msg = err.message.toLowerCase();
    if (msg.includes("fetch") || msg.includes("network") || msg.includes("failed")) {
      return `No se pudo conectar con el API (${base}). ${hint}`;
    }
  }
  if (err instanceof Error && err.message) return err.message;
  return `Error de red al contactar ${base}. ${hint}`;
}

/** fetch con mensaje útil si el servidor no responde (connection refused). */
export async function apiFetch(
  input: string,
  init?: RequestInit,
): Promise<Response> {
  try {
    return await fetch(input, init);
  } catch (err) {
    throw new Error(formatApiConnectionError(err));
  }
}

export async function fetchHealth(): Promise<{ status: string; message: string }> {
  const res = await apiFetch(`${baseUrl}/health`, { cache: "no-store" });
  if (!res.ok) throw new Error("Error al conectar con el backend");
  return res.json();
}
