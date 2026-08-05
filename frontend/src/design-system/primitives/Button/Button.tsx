import { forwardRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/cn';

// eslint-disable-next-line react-refresh/only-export-components
export const buttonVariants = cva(
  'press inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium select-none transition-[background-color,color,box-shadow,border-color] duration-fast ease-standard outline-none focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface-canvas disabled:pointer-events-none disabled:opacity-40',
  {
    variants: {
      variant: {
        primary:
          'bg-accent text-content-on-accent hover:bg-accent-hover active:bg-accent-active shadow-e1',
        secondary:
          'bg-surface-raised text-content border border-line hover:bg-surface-overlay hover:border-line-strong',
        ghost: 'bg-transparent text-content-secondary hover:bg-surface-hover hover:text-content',
        outline:
          'bg-transparent text-content border border-line-strong hover:bg-surface-hover',
        danger: 'bg-danger text-white hover:opacity-90 active:opacity-100 shadow-e1',
        ai: 'bg-accent-soft text-accent-text border border-line hover:bg-accent-soft-hover hover:shadow-glow-sm',
      },
      size: {
        sm: 'h-[var(--control-h-sm)] px-3 text-body-sm',
        md: 'h-[var(--control-h)] px-4 text-body',
        lg: 'h-[var(--control-h-lg)] px-5 text-body-lg',
        icon: 'h-[var(--control-h)] w-[var(--control-h)]',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild, loading, leftIcon, rightIcon, children, disabled, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          leftIcon
        )}
        {children}
        {!loading && rightIcon}
      </Comp>
    );
  },
);
Button.displayName = 'Button';
