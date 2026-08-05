import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export interface GlassProps extends HTMLAttributes<HTMLDivElement> {
  /** Blur depth tier. */
  depth?: 'thin' | 'default' | 'thick';
  /** Use the more opaque substrate for dense floating panels. */
  strong?: boolean;
}

/**
 * Liquid Glass substrate. Real backdrop-blur activates only when the
 * ThemeProvider marks the device capable (html[data-glass="on"]); otherwise
 * it renders a solid opaque surface so readability is never compromised.
 */
export const Glass = forwardRef<HTMLDivElement, GlassProps>(
  ({ className, depth = 'default', strong = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'glass',
        depth === 'thin' && 'glass-thin',
        depth === 'thick' && 'glass-thick',
        strong && 'glass-strong',
        className,
      )}
      {...props}
    />
  ),
);
Glass.displayName = 'Glass';
