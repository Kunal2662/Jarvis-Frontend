import { Fragment } from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '../../lib/cn';

export interface Crumb {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
}

export function Breadcrumb({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center', className)}>
      <ol className="flex items-center gap-1 text-body-sm">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <Fragment key={i}>
              <li className="flex items-center">
                {last ? (
                  <span aria-current="page" className="flex items-center gap-1.5 font-medium text-content">
                    {item.icon}
                    {item.label}
                  </span>
                ) : item.href ? (
                  <a
                    href={item.href}
                    onClick={item.onClick}
                    className="flex items-center gap-1.5 rounded-sm px-1 py-0.5 text-content-secondary transition-colors hover:text-content focus-visible:ring-2 focus-visible:ring-accent-ring"
                  >
                    {item.icon}
                    {item.label}
                  </a>
                ) : (
                  // No href — this crumb navigates via onClick only (e.g. an
                  // in-app folder path). A bare <a> without href isn't
                  // keyboard-focusable, so render a real <button> instead to
                  // stay keyboard accessible.
                  <button
                    type="button"
                    onClick={item.onClick}
                    className="flex items-center gap-1.5 rounded-sm px-1 py-0.5 text-content-secondary transition-colors hover:text-content focus-visible:ring-2 focus-visible:ring-accent-ring"
                  >
                    {item.icon}
                    {item.label}
                  </button>
                )}
              </li>
              {!last && <ChevronRight className="size-3.5 shrink-0 text-content-tertiary" aria-hidden />}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
