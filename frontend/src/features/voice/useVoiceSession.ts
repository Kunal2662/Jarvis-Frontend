import { getVoiceService } from './voiceService';
import type { VoiceSession } from './voiceService';

/**
 * Resolves the active VoiceService adapter and returns its reactive session.
 * The overlay depends only on this — never on a concrete STT/TTS backend.
 */
export function useVoiceSession(): VoiceSession {
  return getVoiceService().useSession();
}
