import { ChevronDown } from 'lucide-react';
import { Button, type ButtonProps } from './Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../Dropdown/Dropdown';
import { cn } from '../../lib/cn';

export interface SplitButtonProps extends ButtonProps {
  /** Menu content rendered when the caret is opened. */
  menu: React.ReactNode;
  menuLabel?: string;
}

/** A primary action paired with an attached dropdown of secondary actions. */
export function SplitButton({
  menu,
  menuLabel = 'More actions',
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: SplitButtonProps) {
  return (
    <div className={cn('inline-flex items-stretch', className)}>
      <Button variant={variant} size={size} className="rounded-r-none" {...props}>
        {children}
      </Button>
      <div className="w-px bg-black/20" aria-hidden />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={variant}
            size={size}
            aria-label={menuLabel}
            className="rounded-l-none px-2"
          >
            <ChevronDown className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">{menu}</DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
