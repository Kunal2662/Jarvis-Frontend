import { forwardRef } from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';

const avatarVariants = cva('relative flex shrink-0 overflow-hidden rounded-full bg-surface-raised', {
  variants: {
    size: {
      xs: 'size-5 text-[10px]',
      sm: 'size-7 text-caption',
      md: 'size-9 text-body-sm',
      lg: 'size-12 text-body',
      xl: 'size-[72px] text-h3',
    },
  },
  defaultVariants: { size: 'md' },
});

export interface AvatarProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>,
    VariantProps<typeof avatarVariants> {
  src?: string;
  alt?: string;
  fallback?: React.ReactNode;
  status?: 'online' | 'busy' | 'offline';
}

const statusColor = {
  online: 'bg-success',
  busy: 'bg-warning',
  offline: 'bg-content-disabled',
};

export const Avatar = forwardRef<React.ElementRef<typeof AvatarPrimitive.Root>, AvatarProps>(
  ({ className, size, src, alt, fallback, status, ...props }, ref) => (
    <div className="relative inline-flex">
      <AvatarPrimitive.Root ref={ref} className={cn(avatarVariants({ size }), className)} {...props}>
        {src && <AvatarPrimitive.Image src={src} alt={alt} className="size-full object-cover" />}
        <AvatarPrimitive.Fallback className="flex size-full items-center justify-center font-medium text-content-secondary">
          {fallback}
        </AvatarPrimitive.Fallback>
      </AvatarPrimitive.Root>
      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-surface-base',
            statusColor[status],
          )}
        />
      )}
    </div>
  ),
);
Avatar.displayName = 'Avatar';
