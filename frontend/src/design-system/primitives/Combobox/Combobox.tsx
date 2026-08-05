import { useState } from 'react';
import { Command as CommandPrimitive } from 'cmdk';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../Popover/Popover';
import { cn } from '../../lib/cn';

export interface ComboboxOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface ComboboxProps {
  options: ComboboxOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
  disabled?: boolean;
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = 'Select…',
  searchPlaceholder = 'Search…',
  emptyText = 'No results found.',
  className,
  disabled,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'flex h-[var(--control-h)] w-full items-center justify-between gap-2 rounded-md border border-line bg-surface-base px-3 text-body text-content outline-none transition-[border-color,box-shadow] duration-fast focus-visible:border-line-focus focus-visible:ring-2 focus-visible:ring-accent-ring disabled:cursor-not-allowed disabled:opacity-40',
            className,
          )}
        >
          <span className={cn('flex items-center gap-2 truncate', !selected && 'text-content-tertiary')}>
            {selected?.icon}
            {selected ? selected.label : placeholder}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 text-content-tertiary" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <CommandPrimitive className="flex flex-col">
          <div className="flex items-center gap-2 border-b border-line-subtle px-3">
            <Search className="size-4 text-content-tertiary" />
            <CommandPrimitive.Input
              placeholder={searchPlaceholder}
              className="h-10 w-full bg-transparent text-body text-content placeholder:text-content-tertiary outline-none"
            />
          </div>
          <CommandPrimitive.List className="max-h-64 overflow-y-auto p-1.5">
            <CommandPrimitive.Empty className="py-6 text-center text-body-sm text-content-tertiary">
              {emptyText}
            </CommandPrimitive.Empty>
            {options.map((opt) => (
              <CommandPrimitive.Item
                key={opt.value}
                value={opt.label}
                disabled={opt.disabled}
                onSelect={() => {
                  onChange?.(opt.value);
                  setOpen(false);
                }}
                className="relative flex cursor-pointer select-none items-center gap-2 rounded-md py-2 pl-8 pr-2.5 text-body-sm text-content outline-none data-[selected=true]:bg-surface-hover data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-40"
              >
                <span className="absolute left-2.5 flex size-4 items-center justify-center">
                  {opt.value === value && <Check className="size-4 text-accent-text" />}
                </span>
                {opt.icon}
                {opt.label}
              </CommandPrimitive.Item>
            ))}
          </CommandPrimitive.List>
        </CommandPrimitive>
      </PopoverContent>
    </Popover>
  );
}
