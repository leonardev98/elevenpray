import { getBaseUrl, getAuthHeaders } from "./api";

export type UserRole = 'user' | 'platform_admin';

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  /** Present from backend when role column exists; default 'user' on frontend if missing. */
  role?: UserRole;
  /** Profile photo URL (S3). Present when set. */
  avatarUrl?: string | null;
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

export async function updateProfile(
  token: string,
  data: { name?: string; email?: string; avatarUrl?: string | null },
): Promise<PublicUser> {
  const res = await fetch(`${getBaseUrl()}/auth/me`, {
    method: "PATCH",
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? "Error al actualizar el perfil");
  }
  const body = await res.json();
  return body.user;
}

/** Get presigned URL for uploading profile photo. Then use uploadFileToPresignedUrl and updateProfile(avatarUrl). */
export async function getProfilePhotoUploadUrl(
  token: string,
  contentType: string,
): Promise<{ uploadUrl: string; publicUrl: string }> {
  const res = await fetch(`${getBaseUrl()}/auth/profile-photo/upload-url`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify({ contentType }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? "Error al obtener URL de subida");
  }
  return res.json();
}

/** Upload a file to a presigned S3 PUT URL. Content-Type must match what was requested when getting the URL. */
export async function uploadFileToPresignedUrl(
  file: File,
  uploadUrl: string,
): Promise<void> {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
    },
  });
  if (!res.ok) {
    throw new Error("Error al subir el archivo");
  }
}

export async function changePassword(
  token: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const res = await fetch(`${getBaseUrl()}/auth/change-password`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify({
      currentPassword,
      newPassword,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? "Error al cambiar la contraseña");
  }
}
