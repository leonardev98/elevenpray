const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export function getBaseUrl() {
  return baseUrl;
}

export function getAuthHeaders(token: string | null): HeadersInit {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

export async function fetchHealth(): Promise<{ status: string; message: string }> {
  const res = await fetch(`${baseUrl}/`, { cache: "no-store" });
  if (!res.ok) throw new Error("Error al conectar con el backend");
  return res.json();
}
