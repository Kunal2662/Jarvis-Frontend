import { forwardRef } from 'react';
import * as DM from '@radix-ui/react-dropdown-menu';
import { Check, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/cn';

export const DropdownMenu = DM.Root;
export const DropdownMenuTrigger = DM.Trigger;
export const DropdownMenuGroup = DM.Group;
export const DropdownMenuSub = DM.Sub;
export const DropdownMenuRadioGroup = DM.RadioGroup;

const contentClasses =
  'glass glass-thin z-dropdown min-w-[12rem] overflow-hidden rounded-lg p-1.5 text-body-sm shadow-e3 data-[state=open]:animate-scale-in origin-[var(--radix-dropdown-menu-content-transform-origin)]';

export const DropdownMenuContent = forwardRef<
  React.ElementRef<typeof DM.Content>,
  React.ComponentPropsWithoutRef<typeof DM.Content>
>(({ className, sideOffset = 8, ...props }, ref) => (
  <DM.Portal>
    <DM.Content ref={ref} sideOffset={sideOffset} className={cn(contentClasses, className)} {...props} />
  </DM.Portal>
));
DropdownMenuContent.displayName = 'DropdownMenuContent';

const itemClasses =
  'relative flex cursor-pointer select-none items-center gap-2 rounded-md px-2.5 py-2 text-content outline-none transition-colors focus:bg-surface-hover data-[disabled]:pointer-events-none data-[disabled]:opacity-40 [&_svg]:size-4 [&_svg]:text-content-tertiary';

export const DropdownMenuItem = forwardRef<
  React.ElementRef<typeof DM.Item>,
  React.ComponentPropsWithoutRef<typeof DM.Item> & { destructive?: boolean }
>(({ className, destructive, ...props }, ref) => (
  <DM.Item
    ref={ref}
    className={cn(itemClasses, destructive && 'text-danger [&_svg]:text-danger focus:bg-danger-soft', className)}
    {...props}
  />
));
DropdownMenuItem.displayName = 'DropdownMenuItem';

export const DropdownMenuCheckboxItem = forwardRef<
  React.ElementRef<typeof DM.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DM.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <DM.CheckboxItem ref={ref} checked={checked} className={cn(itemClasses, 'pl-8', className)} {...props}>
    <span className="absolute left-2.5 flex size-4 items-center justify-center">
      <DM.ItemIndicator>
        <Check className="size-4 text-accent-text" />
      </DM.ItemIndicator>
    </span>
    {children}
  </DM.CheckboxItem>
));
DropdownMenuCheckboxItem.displayName = 'DropdownMenuCheckboxItem';

export const DropdownMenuRadioItem = forwardRef<
  React.ElementRef<typeof DM.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DM.RadioItem>
>(({ className, children, ...props }, ref) => (
  <DM.RadioItem ref={ref} className={cn(itemClasses, 'pl-8', className)} {...props}>
    <span className="absolute left-2.5 flex size-4 items-center justify-center">
      <DM.ItemIndicator>
        <span className="size-1.5 rounded-full bg-accent-text" />
      </DM.ItemIndicator>
    </span>
    {children}
  </DM.RadioItem>
));
DropdownMenuRadioItem.displayName = 'DropdownMenuRadioItem';

export function DropdownMenuLabel({ className, ...props }: React.ComponentProps<typeof DM.Label>) {
  return (
    <DM.Label
      className={cn('px-2.5 py-1.5 text-overline uppercase text-content-tertiary', className)}
      {...props}
    />
  );
}

export function DropdownMenuSeparator({ className, ...props }: React.ComponentProps<typeof DM.Separator>) {
  return <DM.Separator className={cn('my-1 h-px bg-line-subtle', className)} {...props} />;
}

export function DropdownMenuShortcut({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn('ml-auto text-caption text-content-tertiary', className)} {...props} />;
}

export const DropdownMenuSubTrigger = forwardRef<
  React.ElementRef<typeof DM.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DM.SubTrigger>
>(({ className, children, ...props }, ref) => (
  <DM.SubTrigger ref={ref} className={cn(itemClasses, className)} {...props}>
    {children}
    <ChevronRight className="ml-auto size-4" />
  </DM.SubTrigger>
));
DropdownMenuSubTrigger.displayName = 'DropdownMenuSubTrigger';

export const DropdownMenuSubContent = forwardRef<
  React.ElementRef<typeof DM.SubContent>,
  React.ComponentPropsWithoutRef<typeof DM.SubContent>
>(({ className, ...props }, ref) => (
  <DM.Portal>
    <DM.SubContent ref={ref} className={cn(contentClasses, className)} {...props} />
  </DM.Portal>
));
DropdownMenuSubContent.displayName = 'DropdownMenuSubContent';
