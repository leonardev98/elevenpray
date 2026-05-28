import { getAuthHeaders, getBaseUrl } from "./api";
import { uploadToS3 } from "./community-api";
import type {
  AcademicTemplateDto,
  CommunityFilters,
  TemplateCareer,
  TopContributorDto,
} from "../[locale]/(protected)/app/community/community-types";

async function parseJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { message?: string }).message ?? `Error ${res.status}`,
    );
  }
  return res.json() as Promise<T>;
}

export async function listTemplates(
  token: string | null,
  filters: Pick<CommunityFilters, "career" | "types" | "universityFirst">,
): Promise<AcademicTemplateDto[]> {
  const params = new URLSearchParams();
  if (filters.career !== "todas") params.set("career", filters.career);
  if (filters.types.length > 0) params.set("types", filters.types.join(","));
  if (filters.universityFirst) params.set("universityFirst", "true");
  const qs = params.toString();
  const res = await fetch(
    `${getBaseUrl()}/community/templates${qs ? `?${qs}` : ""}`,
    { headers: getAuthHeaders(token) },
  );
  return parseJson(res);
}

export async function listMyTemplates(
  token: string | null,
): Promise<AcademicTemplateDto[]> {
  const res = await fetch(`${getBaseUrl()}/community/templates/mine`, {
    headers: getAuthHeaders(token),
  });
  return parseJson(res);
}

export async function listSavedTemplates(
  token: string | null,
): Promise<AcademicTemplateDto[]> {
  const res = await fetch(`${getBaseUrl()}/community/templates/saved`, {
    headers: getAuthHeaders(token),
  });
  return parseJson(res);
}

export async function listTopContributors(
  token: string | null,
): Promise<TopContributorDto[]> {
  const res = await fetch(
    `${getBaseUrl()}/community/templates/contributors/top?limit=3`,
    { headers: getAuthHeaders(token) },
  );
  return parseJson(res);
}

export async function presignTemplateAttachment(
  token: string | null,
  contentType: string,
): Promise<{ uploadUrl: string; publicUrl: string; key: string }> {
  const res = await fetch(
    `${getBaseUrl()}/community/templates/attachments/presign`,
    {
      method: "POST",
      headers: {
        ...getAuthHeaders(token),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ contentType }),
    },
  );
  return parseJson(res);
}

export async function createTemplate(
  token: string | null,
  body: {
    type: string;
    title: string;
    career: TemplateCareer;
    subject: string;
    description: string;
    attachmentUrl: string;
    attachmentName: string;
    attachmentSizeBytes: number;
    attachmentMime: string;
    authorshipConfirmed: boolean;
  },
): Promise<AcademicTemplateDto> {
  const res = await fetch(`${getBaseUrl()}/community/templates`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(token),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return parseJson(res);
}

export async function saveTemplate(
  token: string | null,
  templateId: string,
): Promise<{ saved: boolean; saveCount: number }> {
  const res = await fetch(
    `${getBaseUrl()}/community/templates/${templateId}/save`,
    { method: "POST", headers: getAuthHeaders(token) },
  );
  return parseJson(res);
}

export async function unsaveTemplate(
  token: string | null,
  templateId: string,
): Promise<{ saved: boolean; saveCount: number }> {
  const res = await fetch(
    `${getBaseUrl()}/community/templates/${templateId}/save`,
    { method: "DELETE", headers: getAuthHeaders(token) },
  );
  return parseJson(res);
}

export async function useTemplate(
  token: string | null,
  templateId: string,
): Promise<{ downloadUrl: string; downloadCount: number }> {
  const res = await fetch(
    `${getBaseUrl()}/community/templates/${templateId}/use`,
    { method: "POST", headers: getAuthHeaders(token) },
  );
  return parseJson(res);
}

export { uploadToS3 };
