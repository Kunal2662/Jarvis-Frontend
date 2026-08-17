import { type ReactNode } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Command } from 'cmdk';
import { Search, CornerDownLeft } from 'lucide-react';
import { Kbd } from '../../primitives/Kbd/Kbd';

export interface CommandItem {
  id: string;
  label: string;
  icon?: ReactNode;
  hint?: string;
  shortcut?: string;
  keywords?: string[];
  onSelect: () => void;
}

export interface CommandGroup {
  heading: string;
  items: CommandItem[];
}

export interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groups: CommandGroup[];
  placeholder?: string;
  emptyText?: string;
  /** Optional "Ask Jarvis" branch rendered with the current query. */
  onAskJarvis?: (query: string) => void;
  query?: string;
  onQueryChange?: (q: string) => void;
}

export function CommandPalette({
  open,
  onOpenChange,
  groups,
  placeholder = 'Type a command or search…',
  emptyText = 'No results found.',
  onAskJarvis,
  query = '',
  onQueryChange,
}: CommandPaletteProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-palette bg-black/60 backdrop-blur-md data-[state=open]:animate-fade-in" />
        <DialogPrimitive.Content
          aria-label="Command palette"
          className="glass glass-strong fixed left-1/2 top-1/2 z-palette w-[calc(100%-2rem)] max-w-[640px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl shadow-e4 outline-none data-[state=open]:animate-centered-scale-in"
        >
          <DialogPrimitive.Title className="sr-only">Command palette</DialogPrimitive.Title>
          <Command
            loop
            className="flex flex-col"
            filter={(value, search, keywords) => {
              const haystack = `${value} ${(keywords ?? []).join(' ')}`.toLowerCase();
              return haystack.includes(search.toLowerCase()) ? 1 : 0;
            }}
          >
            <div className="flex items-center gap-3 border-b border-line-subtle px-4">
              <Search className="size-5 shrink-0 text-content-tertiary" />
              <Command.Input
                autoFocus
                value={query}
                onValueChange={onQueryChange}
                placeholder={placeholder}
                className="h-14 w-full bg-transparent text-body-lg text-content placeholder:text-content-tertiary outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
              />
              <Kbd>Esc</Kbd>
            </div>
            <Command.List className="max-h-[min(60vh,420px)] overflow-y-auto p-2">
              <Command.Empty className="py-10 text-center text-body-sm text-content-tertiary">
                {emptyText}
              </Command.Empty>
              {groups.map((group) => (
                <Command.Group
                  key={group.heading}
                  heading={group.heading}
                  className="[&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-overline [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:text-content-tertiary"
                >
                  {group.items.map((item) => (
                    <Command.Item
                      key={item.id}
                      value={`${item.label} ${(item.keywords ?? []).join(' ')}`}
                      onSelect={() => {
                        item.onSelect();
                        onOpenChange(false);
                      }}
                      className="relative flex cursor-pointer select-none items-center gap-3 rounded-md px-2.5 py-2.5 text-body-sm text-content outline-none data-[selected=true]:bg-surface-selected"
                    >
                      {item.icon && (
                        <span className="shrink-0 text-content-tertiary [&_svg]:size-[18px]">{item.icon}</span>
                      )}
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.hint && <span className="text-caption text-content-tertiary">{item.hint}</span>}
                      {item.shortcut && <Kbd>{item.shortcut}</Kbd>}
                    </Command.Item>
                  ))}
                </Command.Group>
              ))}
              {onAskJarvis && query.trim() && (
                <Command.Group
                  heading="Jarvis"
                  className="[&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-overline [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:text-content-tertiary"
                >
                  <Command.Item
                    value={`ask jarvis ${query}`}
                    onSelect={() => {
                      onAskJarvis(query);
                      onOpenChange(false);
                    }}
                    className="flex cursor-pointer select-none items-center gap-3 rounded-md px-2.5 py-2.5 text-body-sm text-content outline-none data-[selected=true]:bg-accent-soft"
                  >
                    <CornerDownLeft className="size-[18px] shrink-0 text-accent-text" />
                    <span className="flex-1 truncate">
                      Ask Jarvis: <span className="text-accent-text">“{query}”</span>
                    </span>
                  </Command.Item>
                </Command.Group>
              )}
            </Command.List>
          </Command>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
