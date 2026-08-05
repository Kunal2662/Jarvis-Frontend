import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Glass } from '../../primitives/Glass/Glass';
import { SimpleTooltip } from '../../primitives/Tooltip/Tooltip';
import { cn } from '../../lib/cn';

export interface DockItem {
  id: string;
  icon: ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

/** Floating glass dock for quick module access (VisionOS-inspired). */
export function Dock({ items, className }: { items: DockItem[]; className?: string }) {
  return (
    <Glass
      role="toolbar"
      aria-label="Dock"
      className={cn('flex items-center gap-1 rounded-2xl p-1.5 shadow-e3', className)}
    >
      {items.map((item) => (
        <SimpleTooltip key={item.id} label={item.label}>
          <motion.button
            whileHover={{ y: -4, scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 520, damping: 24 }}
            onClick={item.onClick}
            aria-label={item.label}
            aria-pressed={item.active}
            className={cn(
              'relative flex size-11 items-center justify-center rounded-xl text-content-secondary transition-colors [&_svg]:size-5',
              item.active ? 'bg-accent-soft text-accent-text' : 'hover:bg-surface-hover hover:text-content',
            )}
          >
            {item.icon}
            {item.active && (
              <span className="absolute -bottom-0.5 size-1 rounded-full bg-accent" />
            )}
          </motion.button>
        </SimpleTooltip>
      ))}
    </Glass>
  );
}
