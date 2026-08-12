import { useState } from 'react';
import { Glass, VoiceOrb, Waveform, cn, stateColor, type VoiceState } from '../../design-system';

const states: { value: VoiceState; label: string }[] = [
  { value: 'idle', label: 'Idle' },
  { value: 'listening', label: 'Listening' },
  { value: 'thinking', label: 'Thinking' },
  { value: 'speaking', label: 'Speaking' },
  { value: 'processing', label: 'Processing' },
  { value: 'offline', label: 'Offline' },
];

const statusText: Record<VoiceState, string> = {
  idle: 'Ready when you are',
  listening: 'Listening…',
  thinking: 'Thinking…',
  speaking: 'Speaking…',
  processing: 'Processing…',
  offline: 'Offline',
};

export interface HeroOrbProps {
  onActivate?: () => void;
  /** Controlled presence state. When set, the orb reflects it and the demo picker hides. */
  state?: VoiceState;
  /** Force-show the state picker (defaults to on only in uncontrolled/showcase mode). */
  controls?: boolean;
}

/** JARVIS presence hero — the cinematic identity orb flanked by ambient waveforms. */
export function HeroOrb({ onActivate, state: controlled, controls }: HeroOrbProps) {
  const [internal, setInternal] = useState<VoiceState>('idle');
  const state = controlled ?? internal;
  const showPicker = controls ?? controlled === undefined;
  const active = state !== 'idle' && state !== 'offline';

  return (
    <Glass className="relative overflow-hidden rounded-2xl p-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 90% at 50% 40%, var(--ai-aura-soft), transparent 70%)',
        }}
      />

      <div className="relative flex flex-col items-center gap-6">
        <div className="flex w-full items-center justify-center gap-4">
          <Waveform className="hidden flex-1 justify-end md:flex" state={state} mirror />
          <VoiceOrb
            state={state}
            size={220}
            premium
            onClick={onActivate}
            label="Activate Jarvis voice"
            className="shrink-0"
          />
          <Waveform className="hidden flex-1 md:flex" state={state} />
        </div>

        <div className="flex flex-col items-center gap-1 text-center">
          <p className="text-body-sm text-content-tertiary">Hello, I'm</p>
          <h2 className="font-display text-display-md tracking-tight text-content">JARVIS</h2>
          <p className="text-body-sm text-content-secondary">Your AI Operating Companion</p>
        </div>

        <div className="glass glass-thin flex items-center gap-3 rounded-full px-4 py-2" data-testid="hero-status">
          <span
            className={cn('size-2 rounded-full', active && 'animate-pulse')}
            style={{ background: stateColor[state] }}
          />
          <span className="text-body-sm text-content">{statusText[state]}</span>
        </div>

        {showPicker && (
          <div className="flex flex-wrap justify-center gap-1.5">
            {states.map((s) => (
              <button
                key={s.value}
                onClick={() => setInternal(s.value)}
                data-testid={`orb-state-${s.value}`}
                className={cn(
                  'rounded-full px-3 py-1.5 text-caption font-medium transition-colors',
                  state === s.value
                    ? 'bg-accent-soft text-accent-text'
                    : 'text-content-tertiary hover:bg-surface-hover hover:text-content',
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </Glass>
  );
}
