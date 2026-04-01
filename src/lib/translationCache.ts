const CACHE_KEY = "novapay_translations";
type Cache = Record<string, Record<string, string>>;

function getCache(): Cache {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
  } catch {
    return {};
  }
}

export function getCachedTranslation(text: string, locale: string): string | null {
  const cache = getCache();
  return cache[locale]?.[text] || null;
}

export function setCachedTranslations(translations: Record<string, string>, locale: string): void {
  try {
    const cache = getCache();
    if (!cache[locale]) cache[locale] = {};
    Object.assign(cache[locale], translations);
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {}
}
