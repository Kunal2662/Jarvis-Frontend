import { useEffect, useState } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { MicOff, Send, X } from 'lucide-react';
import {
  Button,
  VoiceOrb,
  Waveform,
  type VoiceState,
} from '../../design-system';
import { useVoiceSession } from './useVoiceSession';
import { loadVoiceHistory, pushVoiceHistory } from './voiceHistory';
import { useNavigate } from 'react-router-dom';

export interface VoiceOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Full-screen JARVIS voice session with live transcript (Web Speech API). */
export function VoiceOverlay({ open, onOpenChange }: VoiceOverlayProps) {
  const navigate = useNavigate();
  const { supported, listening, transcript, interim, error, start, stop, reset, status } = useVoiceSession();
  const [history, setHistory] = useState<string[]>(() => loadVoiceHistory());

  const state: VoiceState =
    status === 'listening'
      ? 'listening'
      : status === 'processing'
        ? 'thinking'
        : status === 'speaking'
          ? 'speaking'
          : 'idle';
  const liveText = `${transcript}${interim ? ` ${interim}` : ''}`.trim();

  // Auto-start listening when opened (if supported).
  useEffect(() => {
    if (open && supported) {
      reset();
      const t = setTimeout(start, 300);
      return () => clearTimeout(t);
    }
    if (!open) stop();
  }, [open, supported, start, stop, reset]);

  const commit = () => {
    const text = transcript.trim();
    if (!text) return;
    const next = pushVoiceHistory(text);
    setHistory(next);
  };

  const sendToJarvis = () => {
    const text = transcript.trim();
    if (!text) return;
    commit();
    stop();
    onOpenChange(false);
    navigate('/chat', { state: { prompt: text } });
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-voice bg-black/70 backdrop-blur-xl data-[state=open]:animate-fade-in" />
        <DialogPrimitive.Content
          aria-label="Voice session"
          className="fixed inset-0 z-voice flex flex-col items-center justify-center gap-8 outline-none data-[state=open]:animate-fade-in"
        >
          <DialogPrimitive.Title className="sr-only">Voice session</DialogPrimitive.Title>
          <DialogPrimitive.Close
            aria-label="Close voice session"
            className="absolute right-6 top-6 flex size-10 items-center justify-center rounded-full text-content-tertiary transition-colors hover:bg-surface-hover hover:text-content"
            data-testid="voice-close"
          >
            <X className="size-5" />
          </DialogPrimitive.Close>

          <div className="flex w-full max-w-2xl items-center justify-center gap-4 px-6">
            <Waveform className="hidden flex-1 justify-end md:flex" state={state} mirror />
            <VoiceOrb state={state} size={200} className="shrink-0" />
            <Waveform className="hidden flex-1 md:flex" state={state} />
          </div>

          <div className="flex min-h-[3rem] max-w-2xl flex-col items-center px-6 text-center">
            {!supported ? (
              <p className="flex items-center gap-2 text-body text-warning">
                <MicOff className="size-4" /> Voice input isn't supported in this browser. Try Chrome.
              </p>
            ) : liveText ? (
              <p className="text-body-lg leading-relaxed text-content" data-testid="voice-transcript">
                {transcript}
                {interim && <span className="text-content-tertiary"> {interim}</span>}
              </p>
            ) : (
              <p className="text-body-lg text-content-tertiary">
                {listening ? 'Listening…' : 'Tap the orb or speak to begin.'}
              </p>
            )}
            {error && <p className="mt-2 text-caption text-danger">Mic error: {error}</p>}
          </div>

          <div className="flex items-center gap-3">
            {listening ? (
              <Button variant="secondary" onClick={stop} data-testid="voice-stop">Stop</Button>
            ) : (
              <Button variant="secondary" onClick={start} disabled={!supported}>
                {transcript ? 'Continue' : 'Start listening'}
              </Button>
            )}
            <Button
              variant="ai"
              leftIcon={<Send className="size-4" />}
              onClick={sendToJarvis}
              disabled={!transcript.trim()}
              data-testid="voice-send"
            >
              Send to Jarvis
            </Button>
          </div>

          {history.length > 0 && (
            <div className="absolute bottom-8 left-1/2 w-full max-w-md -translate-x-1/2 px-6">
              <p className="mb-2 text-center text-overline uppercase text-content-tertiary">Recent</p>
              <div className="flex flex-col gap-1">
                {history.slice(0, 3).map((h, i) => (
                  <p key={i} className="truncate rounded-md bg-surface-hover px-3 py-1.5 text-caption text-content-secondary">
                    {h}
                  </p>
                ))}
              </div>
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
