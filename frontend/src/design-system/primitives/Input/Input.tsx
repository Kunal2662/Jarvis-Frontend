import { forwardRef, useState } from 'react';
import { Eye, EyeOff, Search as SearchIcon, X } from 'lucide-react';
import { cn } from '../../lib/cn';

const base =
  'flex h-[var(--control-h)] w-full rounded-md border border-line bg-surface-base px-3 text-body text-content placeholder:text-content-tertiary transition-[border-color,box-shadow] duration-fast outline-none focus-visible:border-line-focus focus-visible:ring-2 focus-visible:ring-accent-ring disabled:cursor-not-allowed disabled:opacity-40';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, leftIcon, rightIcon, ...props }, ref) => {
    if (leftIcon || rightIcon) {
      return (
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="pointer-events-none absolute left-3 text-content-tertiary [&_svg]:size-4">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            aria-invalid={invalid || undefined}
            className={cn(
              base,
              leftIcon && 'pl-9',
              rightIcon && 'pr-9',
              invalid && 'border-danger focus-visible:border-danger focus-visible:ring-danger/40',
              className,
            )}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 text-content-tertiary [&_svg]:size-4">{rightIcon}</span>
          )}
        </div>
      );
    }
    return (
      <input
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          base,
          invalid && 'border-danger focus-visible:border-danger focus-visible:ring-danger/40',
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export const Password = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    const [visible, setVisible] = useState(false);
    return (
      <div className="relative flex items-center">
        <input
          ref={ref}
          type={visible ? 'text' : 'password'}
          className={cn(base, 'pr-10', className)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          className="absolute right-2 flex size-7 items-center justify-center rounded-sm text-content-tertiary hover:text-content"
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    );
  },
);
Password.displayName = 'Password';

export interface SearchProps extends InputProps {
  onClear?: () => void;
}

export const Search = forwardRef<HTMLInputElement, SearchProps>(
  ({ className, value, onClear, ...props }, ref) => (
    <div className="relative flex items-center">
      <SearchIcon className="pointer-events-none absolute left-3 size-4 text-content-tertiary" />
      <input
        ref={ref}
        type="search"
        role="searchbox"
        value={value}
        className={cn(base, 'pl-9 pr-9 [&::-webkit-search-cancel-button]:hidden', className)}
        {...props}
      />
      {value ? (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear search"
          className="absolute right-2 flex size-7 items-center justify-center rounded-sm text-content-tertiary hover:text-content"
        >
          <X className="size-4" />
        </button>
      ) : null}
    </div>
  ),
);
Search.displayName = 'Search';
