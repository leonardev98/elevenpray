import { getBaseUrl, getAuthHeaders } from "./api";

export interface LearningArticleApi {
  id: string;
  title: string;
  description: string | null;
  url: string;
  imageUrl: string | null;
  sourceName: string | null;
  tags: string[] | null;
  language: string;
  isFeatured: boolean;
  createdAt: string;
}

export interface LearningVideoApi {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string;
  thumbnailUrl: string | null;
  sourceName: string | null;
  tags: string[] | null;
  language: string;
  createdAt: string;
}

const learningBase = () => `${getBaseUrl()}/learning`;
const adminLearningBase = () => `${getBaseUrl()}/admin/learning`;

export async function getLearningArticles(
  params?: { language?: string; featured?: boolean }
): Promise<LearningArticleApi[]> {
  const search = new URLSearchParams();
  if (params?.language) search.set("language", params.language);
  if (params?.featured !== undefined) search.set("featured", String(params.featured));
  const url = search.toString()
    ? `${learningBase()}/articles?${search}`
    : `${learningBase()}/articles`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Error al cargar artículos");
  return res.json();
}

export async function getLearningVideos(params?: {
  language?: string;
}): Promise<LearningVideoApi[]> {
  const search = new URLSearchParams();
  if (params?.language) search.set("language", params.language);
  const url = search.toString()
    ? `${learningBase()}/videos?${search}`
    : `${learningBase()}/videos`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Error al cargar vídeos");
  return res.json();
}

export interface CreateArticleBody {
  title: string;
  description?: string;
  url: string;
  image_url?: string;
  source_name?: string;
  tags?: string[];
  language?: string;
  is_featured?: boolean;
}

export interface CreateVideoBody {
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  source_name?: string;
  tags?: string[];
  language?: string;
}

export async function createLearningArticle(
  token: string,
  body: CreateArticleBody
): Promise<LearningArticleApi> {
  const res = await fetch(`${adminLearningBase()}/articles`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? "Error al crear artículo");
  }
  return res.json();
}

export async function createLearningVideo(
  token: string,
  body: CreateVideoBody
): Promise<LearningVideoApi> {
  const res = await fetch(`${adminLearningBase()}/videos`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? "Error al crear vídeo");
  }
  return res.json();
}
