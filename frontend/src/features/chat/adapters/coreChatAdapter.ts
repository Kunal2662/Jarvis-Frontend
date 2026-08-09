import {
  CoreContractUnavailableError,
  type ChatSendResult,
  type ChatService,
  type ChatStreamHandlers,
  type ChatTurn,
} from '../chatService';

/**
 * JARVIS Core adapter — INTENTIONALLY UNIMPLEMENTED.
 *
 * The real JARVIS Core conversational API contract (owned by Claude Code) is not
 * yet available. Per project rules we do NOT invent an endpoint. This adapter is
 * the plug point: once the Core streaming contract is verified, implement
 * `sendMessage` here (map Core events → ChatStreamHandlers), set `ready: true`,
 * and select it via `VITE_CHAT_BACKEND=core`. No ChatPage/UI change is needed.
 *
 * See docs/CORE_CHAT_CONTRACT_REQUIRED.md for exactly what must be provided.
 */
export const coreChatService: ChatService = {
  id: 'core',
  label: 'JARVIS Core (contract pending)',
  ready: false,

  async sendMessage(
    _turns: ChatTurn[],
    handlers: ChatStreamHandlers,
    _signal?: AbortSignal,
    _sessionId?: string,
  ): Promise<ChatSendResult> {
    const message =
      'JARVIS Core chat is not connected yet. Falling back to the development assistant.';
    handlers.onStatus?.('error');
    handlers.onError?.(message);
    // Surface loudly in dev so an accidental switch is obvious.
    if (import.meta.env.DEV) {
      console.warn(new CoreContractUnavailableError().message);
    }
    return { outcome: 'error', error: message };
  },
};
