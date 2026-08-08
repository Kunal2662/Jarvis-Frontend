/**
 * Chat service seam — the transport-agnostic contract the Chat UI depends on.
 *
 *   ChatPage → chat state/presentation → ChatService → adapter → (dev SSE | JARVIS Core)
 *
 * The UI must NOT know how the AgentOrchestrator works internally. It only knows
 * this interface. Swapping the development endpoint for the real JARVIS Core API
 * later is a matter of implementing a new adapter and selecting it here — no UI
 * changes required.
 */

export type ChatRole = 'user' | 'assistant';

export interface ChatTurn {
  role: ChatRole;
  content: string;
}

/** The full conversational lifecycle a JARVIS chat turn can move through. */
export type ChatLifecycle =
  | 'idle'
  | 'sending'
  | 'streaming'
  | 'completed'
  | 'cancelled'
  | 'error'
  | 'reconnecting';

export interface ChatStreamHandlers {
  /** Lifecycle transitions (sending → streaming → completed | cancelled | error). */
  onStatus?: (status: ChatLifecycle) => void;
  /** A streamed token/chunk of the assistant reply. */
  onDelta: (text: string) => void;
  /** Session/turn metadata surfaced by the backend (e.g. a session id). */
  onMeta?: (meta: { sessionId?: string }) => void;
  /** A surfaced, user-safe error message. */
  onError?: (message: string) => void;
}

export interface ChatSendResult {
  outcome: 'completed' | 'cancelled' | 'error';
  sessionId?: string;
  error?: string;
}

/**
 * The contract every chat backend adapter must satisfy. `signal` MUST cancel an
 * in-flight turn and resolve with `outcome: 'cancelled'` (never throw).
 */
export interface ChatService {
  readonly id: 'dev' | 'core';
  readonly label: string;
  /** True once this adapter is wired to a real, verified backend contract. */
  readonly ready: boolean;
  sendMessage(
    turns: ChatTurn[],
    handlers: ChatStreamHandlers,
    signal?: AbortSignal,
    sessionId?: string,
  ): Promise<ChatSendResult>;
}

/** Thrown when a not-yet-implemented backend adapter is invoked. */
export class CoreContractUnavailableError extends Error {
  constructor(message = 'JARVIS Core chat contract is not available yet.') {
    super(message);
    this.name = 'CoreContractUnavailableError';
  }
}

import { devChatService } from './adapters/devStreamAdapter';
import { coreChatService } from './adapters/coreChatAdapter';

/**
 * Which backend the Chat UI talks to. Defaults to the development SSE endpoint
 * (the only VERIFIED contract today). Set `VITE_CHAT_BACKEND=core` to route to
 * the JARVIS Core adapter once Claude Code has implemented + verified it.
 */
const CHAT_BACKEND = (import.meta.env.VITE_CHAT_BACKEND as string | undefined) ?? 'dev';

export function getChatService(): ChatService {
  return CHAT_BACKEND === 'core' ? coreChatService : devChatService;
}
