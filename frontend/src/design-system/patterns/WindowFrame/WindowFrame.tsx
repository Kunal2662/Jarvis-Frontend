import type { ReactNode } from 'react';
import { X, Minus, Square } from 'lucide-react';
import { Glass } from '../../primitives/Glass/Glass';
import { cn } from '../../lib/cn';

export interface WindowFrameProps {
  title?: ReactNode;
  icon?: ReactNode;
  toolbar?: ReactNode;
  children: ReactNode;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  className?: string;
}

/** Floating window container with a glass title bar (visionOS / Fluent feel). */
export function WindowFrame({
  title,
  icon,
  toolbar,
  children,
  onClose,
  onMinimize,
  onMaximize,
  className,
}: WindowFrameProps) {
  return (
    <Glass
      className={cn('flex flex-col overflow-hidden rounded-2xl shadow-e4', className)}
    >
      <div className="flex h-11 items-center gap-2 border-b border-line-subtle px-3">
        <div className="flex items-center gap-1.5">
          <button
            onClick={onClose}
            aria-label="Close window"
            className="group flex size-3 items-center justify-center rounded-full bg-danger/80 hover:bg-danger"
          >
            <X className="size-2 text-black/50 opacity-0 group-hover:opacity-100" />
          </button>
          <button
            onClick={onMinimize}
            aria-label="Minimize window"
            className="group flex size-3 items-center justify-center rounded-full bg-warning/80 hover:bg-warning"
          >
            <Minus className="size-2 text-black/50 opacity-0 group-hover:opacity-100" />
          </button>
          <button
            onClick={onMaximize}
            aria-label="Maximize window"
            className="group flex size-3 items-center justify-center rounded-full bg-success/80 hover:bg-success"
          >
            <Square className="size-1.5 text-black/50 opacity-0 group-hover:opacity-100" />
          </button>
        </div>
        <div className="flex flex-1 items-center justify-center gap-2 text-body-sm font-medium text-content-secondary">
          {icon && <span className="[&_svg]:size-4">{icon}</span>}
          {title}
        </div>
        <div className="flex items-center gap-1">{toolbar}</div>
      </div>
      <div className="flex-1 overflow-auto">{children}</div>
    </Glass>
  );
}
