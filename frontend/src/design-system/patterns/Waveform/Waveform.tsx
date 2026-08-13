import { motion } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { stateColor, type VoiceState } from '../VoiceOrb/VoiceOrb';

/**
 * Per-state motion character — how energetic and fast the waves feel for
 * each `VoiceState`, paired with `VoiceOrb`'s own `stateColor` so the waves
 * always visually agree with the orb they flank (same color; calmer at
 * idle, brighter/quicker while listening, a measured purple churn while
 * thinking, fastest and most energetic while speaking; still while
 * offline) — never a generic ambient loop indifferent to what JARVIS is
 * actually doing (Step 23).
 */
const STATE_MOTION: Record<VoiceState, { amplitude: number; speed: number }> = {
  idle: { amplitude: 0.35, speed: 1.6 },
  listening: { amplitude: 1, speed: 0.75 },
  thinking: { amplitude: 0.6, speed: 1.1 },
  speaking: { amplitude: 1.25, speed: 0.55 },
  processing: { amplitude: 0.8, speed: 0.9 },
  offline: { amplitude: 0, speed: 1 },
};

export interface WaveformProps {
  bars?: number;
  /** Which presence state to reflect — reuses `VoiceOrb`'s own vocabulary. */
  state?: VoiceState;
  mirror?: boolean;
  className?: string;
}

/** Ambient waveform that flanks the JARVIS presence orb (`VoiceOrb`) and
 *  reacts to its `state`: color, amplitude, and speed all follow what the
 *  orb itself is showing, rather than a single indifferent idle loop. */
export function Waveform({ bars = 28, state = 'idle', mirror = false, className }: WaveformProps) {
  const reduced = useReducedMotion();
  const color = stateColor[state];
  const { amplitude, speed } = STATE_MOTION[state];
  const shouldAnimate = !reduced && state !== 'offline';

  return (
    <div
      aria-hidden
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        // Bars span the full container width edge-to-edge — from the
        // viewport-following outer edge continuously up to the orb, never a
        // small cluster huddled at one end with a dead gap on the other.
        width: '100%',
        justifyContent: 'space-between',
        flexDirection: mirror ? 'row-reverse' : 'row',
      }}
    >
      {Array.from({ length: bars }).map((_, i) => {
        const base = 6 + Math.abs(Math.sin(i * 0.6)) * 26;
        const peak = base * (1 + amplitude * (0.3 + Math.random() * 0.7));
        return (
          <motion.span
            key={i}
            style={{
              width: 2.5,
              borderRadius: 9999,
              background: color,
              opacity: state === 'offline' ? 0.2 : 0.35 + (i / bars) * 0.4,
            }}
            initial={{ height: base }}
            animate={shouldAnimate ? { height: [base, peak, base] } : { height: base }}
            transition={{ duration: (1 + (i % 5) * 0.2) * speed, repeat: Infinity, ease: 'easeInOut' }}
          />
        );
      })}
    </div>
  );
}
