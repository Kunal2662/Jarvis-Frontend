export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

const BACKEND =
  import.meta.env.VITE_BACKEND_URL ||
  (import.meta.env.REACT_APP_BACKEND_URL as string | undefined) ||
  '';

/**
 * Stream a chat completion from the JARVIS backend (SSE over fetch).
 * Calls `onDelta` for each token chunk; resolves when the stream is done.
 */
export async function streamChat(
  messages: ChatTurn[],
  handlers: {
    onDelta: (text: string) => void;
    onError?: (message: string) => void;
    onMeta?: (sessionId: string) => void;
  },
  signal?: AbortSignal,
  sessionId?: string,
): Promise<void> {
  const res = await fetch(`${BACKEND}/api/chat/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, session_id: sessionId }),
    signal,
  });

  if (!res.ok || !res.body) {
    handlers.onError?.(`Request failed (${res.status})`);
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const events = buffer.split('\n\n');
    buffer = events.pop() ?? '';

    for (const raw of events) {
      const lines = raw.split('\n');
      let event = 'message';
      let data = '';
      for (const line of lines) {
        if (line.startsWith('event:')) event = line.slice(6).trim();
        else if (line.startsWith('data:')) data += line.slice(5).trim();
      }
      if (!data) continue;
      try {
        const parsed = JSON.parse(data);
        if (event === 'error') handlers.onError?.(parsed.error ?? 'Unknown error');
        else if (event === 'meta') handlers.onMeta?.(parsed.session_id);
        else if (event === 'done') return;
        else if (parsed.delta) handlers.onDelta(parsed.delta);
      } catch {
        /* ignore malformed chunks */
      }
    }
  }
}
