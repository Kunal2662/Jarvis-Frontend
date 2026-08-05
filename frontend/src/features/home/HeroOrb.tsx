import { useState } from 'react';
import { Glass, VoiceOrb, cn, type VoiceState } from '../../design-system';
import { Waveform } from './Waveform';

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

export function HeroOrb({ onActivate }: { onActivate?: () => void }) {
  const [state, setState] = useState<VoiceState>('idle');
  const active = state !== 'idle' && state !== 'offline';

  return (
    <Glass className="relative overflow-hidden rounded-2xl p-8">
      {/* ambient depth wash */}
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
          <Waveform className="hidden flex-1 justify-end md:flex" active={active} mirror />
          <VoiceOrb
            state={state}
            size={220}
            premium
            onClick={onActivate}
            label="Activate Jarvis voice"
            className="shrink-0"
          />
          <Waveform className="hidden flex-1 md:flex" active={active} />
        </div>

        <div className="flex flex-col items-center gap-1 text-center">
          <p className="text-body-sm text-content-tertiary">Hello, I'm</p>
          <h2 className="font-display text-display-md tracking-tight text-content">JARVIS</h2>
          <p className="text-body-sm text-content-secondary">Your AI Operating Companion</p>
        </div>

        {/* status pill */}
        <div className="glass glass-thin flex items-center gap-3 rounded-full px-4 py-2">
          <span
            className={cn('size-2 rounded-full', active && 'animate-pulse')}
            style={{ background: state === 'offline' ? 'var(--content-disabled)' : 'var(--ai-aura)' }}
          />
          <span className="text-body-sm text-content">{statusText[state]}</span>
        </div>

        {/* state preview control */}
        <div className="flex flex-wrap justify-center gap-1.5">
          {states.map((s) => (
            <button
              key={s.value}
              onClick={() => setState(s.value)}
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
      </div>
    </Glass>
  );
}
