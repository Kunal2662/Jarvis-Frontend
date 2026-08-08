import { streamChat } from '../../../lib/chatClient';
import type { ChatSendResult, ChatService, ChatStreamHandlers, ChatTurn } from '../chatService';

/**
 * Development adapter: wraps the existing `/api/chat/stream` SSE endpoint
 * (`lib/chatClient.streamChat`). This is the JARVIS *development* backend, NOT
 * the production Core. It stays as the default fallback until the real Core
 * conversational contract is verified.
 *
 * Adds consistent lifecycle + cancellation handling on top of the raw client:
 * cancellation resolves as `outcome: 'cancelled'` instead of throwing.
 */
export const devChatService: ChatService = {
  id: 'dev',
  label: 'Development (SSE /api/chat/stream)',
  ready: true,

  async sendMessage(
    turns: ChatTurn[],
    handlers: ChatStreamHandlers,
    signal?: AbortSignal,
    sessionId?: string,
  ): Promise<ChatSendResult> {
    let started = false;
    let sid = sessionId;
    let surfacedError: string | undefined;

    handlers.onStatus?.('sending');

    try {
      await streamChat(
        turns,
        {
          onMeta: (id) => {
            sid = id;
            handlers.onMeta?.({ sessionId: id });
          },
          onDelta: (delta) => {
            if (!started) {
              started = true;
              handlers.onStatus?.('streaming');
            }
            handlers.onDelta(delta);
          },
          onError: (message) => {
            surfacedError = message;
            handlers.onError?.(message);
          },
        },
        signal,
        sessionId,
      );
    } catch (err) {
      if (signal?.aborted || (err instanceof DOMException && err.name === 'AbortError')) {
        handlers.onStatus?.('cancelled');
        return { outcome: 'cancelled', sessionId: sid };
      }
      const message = err instanceof Error ? err.message : String(err);
      handlers.onError?.(message);
      handlers.onStatus?.('error');
      return { outcome: 'error', sessionId: sid, error: message };
    }

    if (signal?.aborted) {
      handlers.onStatus?.('cancelled');
      return { outcome: 'cancelled', sessionId: sid };
    }
    if (surfacedError) {
      handlers.onStatus?.('error');
      return { outcome: 'error', sessionId: sid, error: surfacedError };
    }
    handlers.onStatus?.('completed');
    return { outcome: 'completed', sessionId: sid };
  },
};
