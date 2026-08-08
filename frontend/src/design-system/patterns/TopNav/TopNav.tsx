import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/cn';

export interface TopNavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  active?: boolean;
  badge?: string;
  onSelect: () => void;
}

export interface TopNavProps {
  items: TopNavItem[];
  className?: string;
}

/**
 * The flat, single-level primary navigation strip that replaces the v1 sidebar.
 * One level only — no dropdowns, no nested menus. Overflow scrolls horizontally;
 * anything not visible is reachable via ⌘K (never a dropdown or hamburger).
 * See docs/architecture/NAVIGATION.md.
 */
export function TopNav({ items, className }: TopNavProps) {
  return (
    <nav
      aria-label="Primary"
      data-testid="top-nav"
      className={cn(
        'flex min-w-0 items-center gap-1 overflow-x-auto scrollbar-none',
        className,
      )}
    >
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            type="button"
            onClick={item.onSelect}
            data-testid={`top-nav-${item.id}`}
            aria-current={item.active ? 'page' : undefined}
            className={cn(
              'group relative flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-body-sm font-medium outline-none transition-colors',
              item.active
                ? 'bg-accent-soft text-content'
                : 'text-content-secondary hover:bg-surface-base hover:text-content',
            )}
          >
            <Icon className={cn('size-4 shrink-0', item.active && 'text-ai-aura')} />
            <span className="whitespace-nowrap">{item.label}</span>
            {item.badge && (
              <span className="rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-semibold uppercase leading-none text-content-on-accent">
                {item.badge}
              </span>
            )}
            {item.active && (
              <span className="absolute inset-x-2 -bottom-[7px] h-0.5 rounded-full bg-ai-aura" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
