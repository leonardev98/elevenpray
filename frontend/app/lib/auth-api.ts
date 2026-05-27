import { getBaseUrl, getAuthHeaders } from "./api";

export type UserRole = 'user' | 'platform_admin';

export interface StudentProfilePublic {
  university: string;
  career: string;
  cycle: string;
}

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  /** Present from backend when role column exists; default 'user' on frontend if missing. */
  role?: UserRole;
  /** Profile photo URL (S3). Present when set. */
  avatarUrl?: string | null;
  studentProfile?: StudentProfilePublic | null;
  studentOnboardingCompleted?: boolean;
}

/** Normaliza respuestas del backend (camelCase o snake_case) y valores por defecto. */
export function normalizePublicUser(raw: Record<string, unknown>): PublicUser {
  const studentUniversity =
    (raw.studentProfile as StudentProfilePublic | undefined)?.university ??
    (raw.student_profile as StudentProfilePublic | undefined)?.university ??
    (raw.studentUniversity as string | undefined) ??
    (raw.student_university as string | undefined);
  const studentCareer =
    (raw.studentProfile as StudentProfilePublic | undefined)?.career ??
    (raw.student_profile as StudentProfilePublic | undefined)?.career ??
    (raw.studentCareer as string | undefined) ??
    (raw.student_career as string | undefined);
  const studentCycle =
    (raw.studentProfile as StudentProfilePublic | undefined)?.cycle ??
    (raw.student_profile as StudentProfilePublic | undefined)?.cycle ??
    (raw.studentAcademicCycle as string | undefined) ??
    (raw.student_academic_cycle as string | undefined);

  const hasStudentData =
    typeof studentUniversity === "string" &&
    studentUniversity.length > 0 &&
    typeof studentCareer === "string" &&
    studentCareer.length > 0 &&
    typeof studentCycle === "string" &&
    studentCycle.length > 0;

  const studentOnboardingCompleted = Boolean(
    raw.studentOnboardingCompleted ??
      raw.student_onboarding_completed ??
      raw.studentOnboardingCompletedAt ??
      raw.student_onboarding_completed_at,
  );

  return {
    id: String(raw.id),
    email: String(raw.email),
    name: String(raw.name),
    role: (raw.role as UserRole | undefined) ?? "user",
    avatarUrl: (raw.avatarUrl ?? raw.avatar_url ?? null) as string | null,
    studentProfile: hasStudentData
      ? {
          university: studentUniversity!,
          career: studentCareer!,
          cycle: studentCycle!,
        }
      : null,
    studentOnboardingCompleted,
  };
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
  const data = await res.json();
  return {
    accessToken: data.accessToken,
    user: normalizePublicUser(data.user ?? {}),
  };
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
  const data = await res.json();
  return {
    accessToken: data.accessToken,
    user: normalizePublicUser(data.user ?? {}),
  };
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}

/**
 * Solo lanza AuthError(401|403) cuando el backend confirma que la sesión es
 * inválida. Para cualquier otro caso (5xx, network, CORS, abort, cold start)
 * relanza un Error genérico para que el caller pueda decidir mantener la sesión
 * y reintentar luego, sin echar al usuario por un bache transitorio.
 */
export async function me(token: string): Promise<PublicUser> {
  let res: Response;
  try {
    res = await fetch(`${getBaseUrl()}/auth/me`, {
      headers: getAuthHeaders(token),
      cache: "no-store",
    });
  } catch (err) {
    throw new Error(
      err instanceof Error ? `Network error: ${err.message}` : "Network error",
    );
  }
  if (res.status === 401 || res.status === 403) {
    throw new AuthError("Sesión inválida", res.status);
  }
  if (!res.ok) {
    throw new Error(`Backend error ${res.status}`);
  }
  const data = await res.json();
  return normalizePublicUser(
    typeof data === "object" && data !== null ? (data as Record<string, unknown>) : {},
  );
}

export async function upsertStudentProfile(
  token: string,
  data: { university: string; career: string; cycle: string; name?: string },
): Promise<PublicUser> {
  const res = await fetch(`${getBaseUrl()}/auth/student-profile`, {
    method: "PATCH",
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? "Error al guardar el perfil estudiantil");
  }
  const body = await res.json();
  const user = body.user ?? body;
  return normalizePublicUser(
    typeof user === "object" && user !== null
      ? (user as Record<string, unknown>)
      : {},
  );
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
  const user = body.user ?? body;
  return normalizePublicUser(
    typeof user === "object" && user !== null
      ? (user as Record<string, unknown>)
      : {},
  );
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
