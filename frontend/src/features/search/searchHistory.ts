/**
 * Lightweight client-side "recent searches" persistence — last 5 queries,
 * mirroring the existing chatStore.ts / voiceHistory.ts local-persistence
 * pattern (same shape: load/push/clear around a capped localStorage array).
 * This is a small UI convenience only; it is not a Core search-history
 * feature and nothing here is sent anywhere.
 */
const KEY = 'jarvis.search.recent';
const MAX = 5;

export function loadRecentSearches(): string[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function pushRecentSearch(query: string): string[] {
  const trimmed = query.trim();
  if (!trimmed) return loadRecentSearches();
  const next = [
    trimmed,
    ...loadRecentSearches().filter((q) => q.toLowerCase() !== trimmed.toLowerCase()),
  ].slice(0, MAX);
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function clearRecentSearches(): string[] {
  localStorage.removeItem(KEY);
  return [];
}
