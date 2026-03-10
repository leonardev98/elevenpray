import { getBaseUrl, getAuthHeaders } from "./api";

export type UserRole = 'user' | 'platform_admin';

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  /** Present from backend when role column exists; default 'user' on frontend if missing. */
  role?: UserRole;
}

export interface AuthResponse {
  accessToken: string;
  user: PublicUser;
}

export async function login(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const res = await fetch(`${getBaseUrl()}/auth/login`, {
    method: "POST",
    headers: getAuthHeaders(null),
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? "Error al iniciar sesión");
  }
  return res.json();
}

export async function register(
  email: string,
  password: string,
  name: string,
): Promise<AuthResponse> {
  const res = await fetch(`${getBaseUrl()}/auth/register`, {
    method: "POST",
    headers: getAuthHeaders(null),
    body: JSON.stringify({ email, password, name }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? "Error al registrarse");
  }
  return res.json();
}

export async function me(token: string): Promise<PublicUser> {
  const res = await fetch(`${getBaseUrl()}/auth/me`, {
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error("Sesión inválida");
  return res.json();
}
