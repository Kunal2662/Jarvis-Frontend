import { useId } from 'react';
import { AlertCircle } from 'lucide-react';
import { Label } from '../../primitives/Label/Label';
import { cn } from '../../lib/cn';

export interface FormFieldProps {
  label?: string;
  required?: boolean;
  description?: string;
  error?: string;
  children: (props: { id: string; 'aria-describedby'?: string; 'aria-invalid'?: boolean }) => React.ReactNode;
  className?: string;
}

/** Label + control + helper/error, wired with accessible ids. */
export function FormField({ label, required, description, error, children, className }: FormFieldProps) {
  const id = useId();
  const descId = description ? `${id}-desc` : undefined;
  const errId = error ? `${id}-err` : undefined;
  const describedBy = [descId, errId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <Label htmlFor={id} required={required}>
          {label}
        </Label>
      )}
      {description && !error && (
        <p id={descId} className="text-caption text-content-tertiary">
          {description}
        </p>
      )}
      {children({ id, 'aria-describedby': describedBy, 'aria-invalid': !!error })}
      {error && (
        <p id={errId} className="flex items-center gap-1.5 text-caption text-danger" role="alert">
          <AlertCircle className="size-3.5" />
          {error}
        </p>
      )}
    </div>
  );
}
