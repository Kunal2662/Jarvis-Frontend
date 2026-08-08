/**
 * Voice service seam — the transport-agnostic contract the Voice UI depends on.
 *
 *   VoiceOverlay → useVoiceSession → VoiceService → adapter → (local Web Speech | JARVIS Core)
 *
 * Mirrors the Chat seam (Step 4). The UI never talks to a concrete STT/TTS or
 * conversation backend directly. Today the only VERIFIED implementation is the
 * browser Web Speech API (local). Swapping to real JARVIS Core voice later means
 * implementing a new adapter and selecting it here — no VoiceOverlay changes.
 */

export type VoiceLifecycle =
  | 'idle'
  | 'listening'
  | 'processing'
  | 'speaking'
  | 'cancelled'
  | 'error'
  | 'unavailable'
  | 'reconnecting';

export interface VoiceCapabilities {
  /** Speech-to-text (capture user speech → transcript). */
  stt: boolean;
  /** Text-to-speech (spoken assistant replies). */
  tts: boolean;
}

/** The reactive state a voice session exposes to the UI. */
export interface VoiceSessionState {
  supported: boolean;
  listening: boolean;
  transcript: string;
  interim: string;
  error: string | null;
  status: VoiceLifecycle;
}

export interface VoiceSessionControls {
  start: () => void;
  stop: () => void;
  reset: () => void;
  /** Abort the session and discard the in-progress transcript. */
  cancel: () => void;
}

export type VoiceSession = VoiceSessionState & VoiceSessionControls;

/**
 * The contract every voice backend adapter must satisfy. `useSession` is a React
 * hook (must be called unconditionally); the selected adapter is constant for a
 * given build, so hook order is stable.
 */
export interface VoiceService {
  readonly id: 'local' | 'core';
  readonly label: string;
  /** True once wired to a real, verified backend contract. */
  readonly ready: boolean;
  readonly capabilities: VoiceCapabilities;
  useSession(): VoiceSession;
  /** Optional TTS. Local adapter does not implement it (capabilities.tts=false). */
  speak?(text: string): Promise<void>;
}

/** Thrown when a not-yet-implemented voice adapter is invoked. */
export class CoreVoiceContractUnavailableError extends Error {
  constructor(message = 'JARVIS Core voice contract is not available yet.') {
    super(message);
    this.name = 'CoreVoiceContractUnavailableError';
  }
}

import { localVoiceService } from './adapters/localVoiceAdapter';
import { coreVoiceService } from './adapters/coreVoiceAdapter';

/**
 * Which backend the Voice UI uses. Defaults to the local browser Web Speech API
 * (the only VERIFIED implementation today). Set `VITE_VOICE_BACKEND=core` to
 * route to the JARVIS Core adapter once Claude Code has implemented + verified it.
 */
const VOICE_BACKEND = (import.meta.env.VITE_VOICE_BACKEND as string | undefined) ?? 'local';

export function getVoiceService(): VoiceService {
  return VOICE_BACKEND === 'core' ? coreVoiceService : localVoiceService;
}
