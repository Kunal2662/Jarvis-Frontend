import { forwardRef } from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '../../lib/cn';

export const Tabs = TabsPrimitive.Root;

export const TabsList = forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & { variant?: 'line' | 'segmented' }
>(({ className, variant = 'line', ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      'inline-flex items-center',
      variant === 'line' && 'gap-1 border-b border-line-subtle',
      variant === 'segmented' && 'gap-1 rounded-lg bg-surface-inset p-1',
      className,
    )}
    {...props}
  />
));
TabsList.displayName = 'TabsList';

export const TabsTrigger = forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & { variant?: 'line' | 'segmented' }
>(({ className, variant = 'line', ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'inline-flex items-center gap-2 whitespace-nowrap text-body-sm font-medium text-content-secondary outline-none transition-colors duration-fast focus-visible:ring-2 focus-visible:ring-accent-ring disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-4',
      variant === 'line' &&
        'relative -mb-px border-b-2 border-transparent px-3 py-2.5 hover:text-content data-[state=active]:border-accent data-[state=active]:text-content',
      variant === 'segmented' &&
        'rounded-md px-3 py-1.5 hover:text-content data-[state=active]:bg-surface-raised data-[state=active]:text-content data-[state=active]:shadow-e1',
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = 'TabsTrigger';

export const TabsContent = forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn('mt-4 outline-none focus-visible:ring-2 focus-visible:ring-accent-ring', className)}
    {...props}
  />
));
TabsContent.displayName = 'TabsContent';
