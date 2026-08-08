import {
  CoreVoiceContractUnavailableError,
  type VoiceService,
  type VoiceSession,
} from '../voiceService';

/**
 * JARVIS Core voice adapter — INTENTIONALLY UNIMPLEMENTED.
 *
 * The real JARVIS Core voice/conversation contract (owned by Claude Code) is not
 * available. Per project rules we do NOT invent an endpoint, WebSocket protocol,
 * audio format, or session model. This adapter is the plug point: once the Core
 * voice contract is verified, implement `useSession` (and optionally `speak`),
 * set `ready: true` + real `capabilities`, and select it via
 * `VITE_VOICE_BACKEND=core`. No VoiceOverlay/UI change is needed.
 *
 * See docs/CORE_VOICE_CONTRACT_REQUIRED.md for exactly what must be provided.
 */
function useCoreVoiceSession(): VoiceSession {
  const noop = () => {
    if (import.meta.env.DEV) {
      console.warn(new CoreVoiceContractUnavailableError().message);
    }
  };
  return {
    supported: false,
    listening: false,
    transcript: '',
    interim: '',
    error: 'JARVIS Core voice is not connected yet.',
    status: 'unavailable',
    start: noop,
    stop: noop,
    reset: noop,
    cancel: noop,
  };
}

export const coreVoiceService: VoiceService = {
  id: 'core',
  label: 'JARVIS Core (contract pending)',
  ready: false,
  capabilities: { stt: false, tts: false },
  useSession: useCoreVoiceSession,
};
