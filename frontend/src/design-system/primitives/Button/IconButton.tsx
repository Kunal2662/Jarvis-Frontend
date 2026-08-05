import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';

const iconButtonVariants = cva(
  'press inline-flex items-center justify-center rounded-md text-content-secondary transition-colors duration-fast ease-standard outline-none focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface-canvas disabled:pointer-events-none disabled:opacity-40',
  {
    variants: {
      variant: {
        ghost: 'hover:bg-surface-hover hover:text-content',
        soft: 'bg-surface-raised hover:bg-surface-overlay text-content',
        solid: 'bg-accent text-content-on-accent hover:bg-accent-hover',
      },
      size: {
        sm: 'size-8',
        md: 'size-9',
        lg: 'size-11',
      },
    },
    defaultVariants: { variant: 'ghost', size: 'md' },
  },
);

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
  /** Required accessible label — icon buttons have no visible text. */
  label: string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant, size, label, children, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      title={label}
      className={cn(iconButtonVariants({ variant, size }), className)}
      {...props}
    >
      {children}
    </button>
  ),
);
IconButton.displayName = 'IconButton';
