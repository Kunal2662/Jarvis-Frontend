import { useCallback } from 'react';
import { useSpeechRecognition } from '../../../lib/useSpeechRecognition';
import type { VoiceLifecycle, VoiceService, VoiceSession } from '../voiceService';

/**
 * Local adapter: the existing browser Web Speech API implementation
 * (`useSpeechRecognition`). This is the VERIFIED, working voice backend today
 * and stays the default. It performs STT client-side only — no server calls,
 * no TTS. Behavior is unchanged; this only maps it onto the VoiceService seam
 * and derives a `VoiceLifecycle` status.
 */
function useLocalVoiceSession(): VoiceSession {
  const s = useSpeechRecognition();

  const cancel = useCallback(() => {
    s.stop();
    s.reset();
  }, [s]);

  const status: VoiceLifecycle = !s.supported
    ? 'unavailable'
    : s.error
      ? 'error'
      : s.listening
        ? 'listening'
        : s.transcript
          ? 'speaking'
          : 'idle';

  return {
    supported: s.supported,
    listening: s.listening,
    transcript: s.transcript,
    interim: s.interim,
    error: s.error,
    status,
    start: s.start,
    stop: s.stop,
    reset: s.reset,
    cancel,
  };
}

export const localVoiceService: VoiceService = {
  id: 'local',
  label: 'Local (browser Web Speech API)',
  ready: true,
  capabilities: { stt: true, tts: false },
  useSession: useLocalVoiceSession,
};
