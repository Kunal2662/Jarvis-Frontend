import { createContext, useContext, type ReactNode } from 'react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Glass } from '../../primitives/Glass/Glass';
import { SimpleTooltip } from '../../primitives/Tooltip/Tooltip';
import { cn } from '../../lib/cn';

interface SidebarCtx {
  collapsed: boolean;
}
const Ctx = createContext<SidebarCtx>({ collapsed: false });

export interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  header?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function Sidebar({ collapsed = false, onToggle, header, footer, children, className }: SidebarProps) {
  return (
    <Ctx.Provider value={{ collapsed }}>
      <Glass
        depth="thick"
        role="complementary"
        aria-label="Sidebar"
        className={cn(
          'z-sidebar flex h-full flex-col rounded-none border-y-0 border-l-0 transition-[width] duration-base ease-standard',
          collapsed ? 'w-[var(--layout-sidebar-collapsed)]' : 'w-[var(--layout-sidebar)]',
          className,
        )}
      >
        <div className="flex h-[var(--layout-topbar)] items-center gap-2 px-3">
          <div className={cn('flex min-w-0 flex-1 items-center gap-2', collapsed && 'justify-center')}>
            {header}
          </div>
          {onToggle && (
            <SimpleTooltip label={collapsed ? 'Expand' : 'Collapse'} side="right">
              <button
                onClick={onToggle}
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                className="flex size-8 shrink-0 items-center justify-center rounded-md text-content-tertiary transition-colors hover:bg-surface-hover hover:text-content"
              >
                {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
              </button>
            </SimpleTooltip>
          )}
        </div>
        <nav className="flex-1 overflow-y-auto px-2.5 py-2" aria-label="Primary">
          {children}
        </nav>
        {footer && <div className="border-t border-line-subtle p-2.5">{footer}</div>}
      </Glass>
    </Ctx.Provider>
  );
}

export function SidebarGroup({ label, children }: { label?: string; children: ReactNode }) {
  const { collapsed } = useContext(Ctx);
  return (
    <div className="mb-3 flex flex-col gap-0.5">
      {label && !collapsed && (
        <span className="px-2.5 pb-1 pt-2 text-overline uppercase text-content-tertiary">{label}</span>
      )}
      {collapsed && label && <div className="mx-2 my-2 h-px bg-line-subtle" />}
      {children}
    </div>
  );
}

export interface SidebarItemProps {
  icon: ReactNode;
  label: string;
  active?: boolean;
  badge?: ReactNode;
  onClick?: () => void;
}

export function SidebarItem({ icon, label, active, badge, onClick }: SidebarItemProps) {
  const { collapsed } = useContext(Ctx);
  const content = (
    <button
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'group relative flex h-9 w-full items-center gap-3 rounded-md px-2.5 text-body-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent-ring',
        active ? 'bg-surface-selected text-content' : 'text-content-secondary hover:bg-surface-hover hover:text-content',
        collapsed && 'justify-center px-0',
      )}
    >
      {active && (
        <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-accent" />
      )}
      <span className={cn('shrink-0 [&_svg]:size-[18px]', active && 'text-accent-text')}>{icon}</span>
      {!collapsed && <span className="flex-1 truncate text-left">{label}</span>}
      {!collapsed && badge}
    </button>
  );

  if (collapsed) {
    return (
      <SimpleTooltip label={label} side="right">
        {content}
      </SimpleTooltip>
    );
  }
  return content;
}
