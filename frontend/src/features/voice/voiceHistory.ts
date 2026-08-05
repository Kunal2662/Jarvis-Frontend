const KEY = 'jarvis.voice.history';

export function loadVoiceHistory(): string[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function pushVoiceHistory(entry: string): string[] {
  const next = [entry, ...loadVoiceHistory().filter((e) => e !== entry)].slice(0, 20);
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}
