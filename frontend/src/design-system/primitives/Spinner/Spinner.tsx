import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/cn';

const sizes = { sm: 'size-4', md: 'size-5', lg: 'size-7' };

export function Spinner({
  size = 'md',
  className,
  label = 'Loading',
}: {
  size?: keyof typeof sizes;
  className?: string;
  label?: string;
}) {
  return (
    <Loader2
      role="status"
      aria-label={label}
      className={cn('animate-spin text-content-tertiary', sizes[size], className)}
    />
  );
}
