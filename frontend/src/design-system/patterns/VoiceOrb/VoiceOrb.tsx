import { motion } from 'framer-motion';
import { cn } from '../../lib/cn';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export type VoiceState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'processing' | 'offline';

export interface VoiceOrbProps {
  state?: VoiceState;
  size?: number;
  className?: string;
  onClick?: () => void;
  label?: string;
  /** Adds orbiting particles + a wider aura — used for the hero identity orb. */
  premium?: boolean;
}

const stateColor: Record<VoiceState, string> = {
  idle: 'var(--ai-aura)',
  listening: 'var(--ai-listening)',
  thinking: 'var(--ai-thinking)',
  speaking: 'var(--ai-speaking)',
  processing: 'var(--accent-solid)',
  offline: 'var(--content-disabled)',
};

/**
 * JARVIS presence orb — the visual identity of the product.
 * The sole home of the cyan aura. Ambient loops respect reduced-motion.
 */
export function VoiceOrb({
  state = 'idle',
  size = 96,
  className,
  onClick,
  label = 'Jarvis',
  premium = false,
}: VoiceOrbProps) {
  const reduced = useReducedMotion();
  const color = stateColor[state];
  const offline = state === 'offline';
  const ringing = state === 'listening' || state === 'speaking';
  const animate = !reduced && !offline;

  return (
    <motion.div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      aria-label={onClick ? label : undefined}
      whileTap={onClick ? { scale: 0.96 } : undefined}
      className={cn(
        'relative grid place-items-center rounded-full outline-none',
        onClick && 'cursor-pointer focus-visible:ring-2 focus-visible:ring-accent-ring',
        offline && 'opacity-60 saturate-0',
        className,
      )}
      style={{ width: size, height: size }}
    >
      {/* Ambient halo */}
      <span
        className="absolute inset-0 rounded-full blur-2xl"
        style={{ background: color, opacity: offline ? 0.08 : 0.22 }}
      />

      {/* Concentric rings */}
      {animate &&
        ringing &&
        [0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="absolute inset-0 rounded-full border"
            style={{ borderColor: color }}
            initial={{ opacity: 0.5, scale: 0.7 }}
            animate={{ opacity: 0, scale: 1.9 }}
            transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.55, ease: 'easeOut' }}
          />
        ))}

      {/* Static rings for depth */}
      {[0.9, 0.72].map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full border"
          style={{
            width: `${s * 100}%`,
            height: `${s * 100}%`,
            borderColor: color,
            opacity: offline ? 0.12 : 0.2 + i * 0.08,
          }}
        />
      ))}

      {/* Processing: orbiting arc */}
      {animate && state === 'processing' && (
        <motion.span
          className="absolute rounded-full border-2 border-transparent"
          style={{ width: '86%', height: '86%', borderTopColor: color, borderRightColor: color }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
        />
      )}

      {/* Premium orbiting particles */}
      {animate &&
        premium &&
        [0, 1, 2, 3, 4, 5].map((i) => (
          <motion.span
            key={i}
            className="absolute left-1/2 top-1/2 size-1.5 rounded-full"
            style={{ background: color, boxShadow: `0 0 8px ${color}` }}
            animate={{ rotate: [i * 60, i * 60 + 360] }}
            transition={{ duration: 8 + i, repeat: Infinity, ease: 'linear' }}
            initial={false}
          >
            <span
              className="absolute block size-1.5 rounded-full"
              style={{ transform: `translate(${size * (0.42 + (i % 3) * 0.04)}px, 0)`, background: color }}
            />
          </motion.span>
        ))}

      {/* Core sphere */}
      <motion.span
        className="relative rounded-full"
        style={{
          width: size * 0.5,
          height: size * 0.5,
          background: `radial-gradient(circle at 35% 30%, #fff, ${color} 45%, transparent 72%), radial-gradient(circle at 68% 78%, var(--accent-solid), transparent 70%)`,
          boxShadow: offline
            ? 'none'
            : `0 0 ${size * 0.5}px ${color}55, inset 0 0 ${size * 0.22}px ${color}66`,
        }}
        animate={
          !animate
            ? undefined
            : state === 'thinking'
              ? { rotate: 360 }
              : state === 'idle'
                ? { scale: [1, 1.05, 1], opacity: [0.9, 1, 0.9] }
                : { scale: [1, 1.09, 1] }
        }
        transition={{
          duration: state === 'thinking' ? 7 : 3.2,
          repeat: Infinity,
          ease: state === 'thinking' ? 'linear' : 'easeInOut',
        }}
      />

      {/* Speaking amplitude bars */}
      {animate && state === 'speaking' && (
        <span className="absolute flex items-center gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.span
              key={i}
              className="w-1 rounded-full"
              style={{ background: '#fff' }}
              animate={{ height: [4, size * 0.14, 6, size * 0.18, 4] }}
              transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.1 }}
            />
          ))}
        </span>
      )}
    </motion.div>
  );
}
