import { motion } from 'framer-motion';
import { useReducedMotion } from '../../design-system';

/** Ambient waveform used to flank the hero orb. Purely decorative. */
export function Waveform({
  bars = 28,
  active = true,
  mirror = false,
  className,
}: {
  bars?: number;
  active?: boolean;
  mirror?: boolean;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <div
      aria-hidden
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 3,
        flexDirection: mirror ? 'row-reverse' : 'row',
      }}
    >
      {Array.from({ length: bars }).map((_, i) => {
        const base = 6 + Math.abs(Math.sin(i * 0.6)) * 26;
        return (
          <motion.span
            key={i}
            style={{
              width: 2.5,
              borderRadius: 9999,
              background: 'var(--ai-aura)',
              opacity: 0.35 + (i / bars) * 0.4,
            }}
            initial={{ height: base }}
            animate={
              reduced || !active
                ? { height: base }
                : { height: [base, base * (0.4 + Math.random()), base] }
            }
            transition={{ duration: 1 + (i % 5) * 0.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        );
      })}
    </div>
  );
}
