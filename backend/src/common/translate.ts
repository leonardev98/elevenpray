/**
 * Traduce texto usando la API gratuita MyMemory (sin API key).
 * Uso limitado; en caso de error se devuelve el texto original.
 */
const MYMEMORY_URL = 'https://api.mymemory.translated.net/get';

const cache = new Map<string, string>();
const MAX_CACHE_SIZE = 500;

function getCached(key: string): string | undefined {
  return cache.get(key);
}

function setCached(key: string, value: string): void {
  if (cache.size >= MAX_CACHE_SIZE) {
    const firstKey = cache.keys().next().value;
    if (firstKey !== undefined) cache.delete(firstKey);
  }
  cache.set(key, value);
}

export async function translateToEnglish(text: string | null): Promise<string | null> {
  if (!text || !text.trim()) return text;
  const trimmed = text.trim();
  const cacheKey = `es:en:${trimmed}`;
  const cached = getCached(cacheKey);
  if (cached !== undefined) return cached;
  try {
    const params = new URLSearchParams({ q: trimmed, langpair: 'es|en' });
    const res = await fetch(`${MYMEMORY_URL}?${params.toString()}`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return text;
    const data = (await res.json()) as { responseData?: { translatedText?: string } };
    const translated = data.responseData?.translatedText?.trim();
    if (translated) {
      setCached(cacheKey, translated);
      return translated;
    }
  } catch {
    // ignore
  }
  return text;
}

export async function translateToSpanish(text: string | null): Promise<string | null> {
  if (!text || !text.trim()) return text;
  const trimmed = text.trim();
  const cacheKey = `en:es:${trimmed}`;
  const cached = getCached(cacheKey);
  if (cached !== undefined) return cached;
  try {
    const params = new URLSearchParams({ q: trimmed, langpair: 'en|es' });
    const res = await fetch(`${MYMEMORY_URL}?${params.toString()}`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return text;
    const data = (await res.json()) as { responseData?: { translatedText?: string } };
    const translated = data.responseData?.translatedText?.trim();
    if (translated) {
      setCached(cacheKey, translated);
      return translated;
    }
  } catch {
    // ignore
  }
  return text;
}
