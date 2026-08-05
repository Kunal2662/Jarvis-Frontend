import { forwardRef } from 'react';
import { cn } from '../../lib/cn';

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, invalid, ...props }, ref) => (
    <textarea
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        'flex min-h-[88px] w-full resize-y rounded-md border border-line bg-surface-base px-3 py-2.5 text-body text-content placeholder:text-content-tertiary transition-[border-color,box-shadow] duration-fast outline-none focus-visible:border-line-focus focus-visible:ring-2 focus-visible:ring-accent-ring disabled:cursor-not-allowed disabled:opacity-40',
        invalid && 'border-danger focus-visible:border-danger focus-visible:ring-danger/40',
        className,
      )}
      {...props}
    />
  ),
);
TextArea.displayName = 'TextArea';
