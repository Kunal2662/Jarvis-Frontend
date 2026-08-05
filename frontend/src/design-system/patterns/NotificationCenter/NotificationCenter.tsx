import { type ReactNode } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '../../primitives/Drawer/Drawer';
import { EmptyState } from '../../composites/EmptyState/EmptyState';
import { Bell } from 'lucide-react';
import { cn } from '../../lib/cn';

export interface NotificationItem {
  id: string;
  title: string;
  description?: string;
  time: string;
  icon?: ReactNode;
  unread?: boolean;
  onClick?: () => void;
}

export interface NotificationGroup {
  label: string;
  items: NotificationItem[];
}

export interface NotificationCenterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groups: NotificationGroup[];
  onMarkAllRead?: () => void;
}

export function NotificationCenter({ open, onOpenChange, groups, onMarkAllRead }: NotificationCenterProps) {
  const empty = groups.every((g) => g.items.length === 0);
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent side="right" className="p-0">
        <DrawerHeader className="flex-row items-center justify-between border-b border-line-subtle p-4 pr-12">
          <DrawerTitle>Notifications</DrawerTitle>
          {onMarkAllRead && !empty && (
            <button
              onClick={onMarkAllRead}
              className="text-caption font-medium text-accent-text hover:underline"
            >
              Mark all read
            </button>
          )}
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto p-2">
          {empty ? (
            <EmptyState icon={<Bell />} title="You're all caught up" description="New activity from Jarvis and your agents will appear here." />
          ) : (
            groups.map(
              (group) =>
                group.items.length > 0 && (
                  <div key={group.label} className="mb-2">
                    <div className="px-2.5 py-1.5 text-overline uppercase text-content-tertiary">
                      {group.label}
                    </div>
                    {group.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={item.onClick}
                        className="flex w-full items-start gap-3 rounded-lg p-2.5 text-left transition-colors hover:bg-surface-hover"
                      >
                        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-surface-subtle text-content-tertiary [&_svg]:size-4">
                          {item.icon ?? <Bell />}
                        </span>
                        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                          <span className="flex items-center gap-2 text-body-sm font-medium text-content">
                            {item.unread && <span className="size-1.5 shrink-0 rounded-full bg-accent" />}
                            <span className="truncate">{item.title}</span>
                          </span>
                          {item.description && (
                            <span className="text-caption text-content-secondary">{item.description}</span>
                          )}
                          <span className={cn('text-caption text-content-tertiary')}>{item.time}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                ),
            )
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
