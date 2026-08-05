import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Card } from './Card';
import { cn } from '../../lib/cn';

export interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  delta?: { value: string; direction: 'up' | 'down' };
  hint?: string;
  className?: string;
}

export function StatCard({ label, value, icon, delta, hint, className }: StatCardProps) {
  const positive = delta?.direction === 'up';
  return (
    <Card className={cn('flex flex-col gap-3 p-5', className)}>
      <div className="flex items-center justify-between">
        <span className="text-overline uppercase text-content-tertiary">{label}</span>
        {icon && <span className="text-content-tertiary [&_svg]:size-4">{icon}</span>}
      </div>
      <div className="flex items-end gap-2">
        <span className="font-display text-display-md tabular-nums text-content">{value}</span>
        {delta && (
          <span
            className={cn(
              'mb-1 inline-flex items-center gap-0.5 text-caption font-medium',
              positive ? 'text-success' : 'text-danger',
            )}
          >
            {positive ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
            {delta.value}
          </span>
        )}
      </div>
      {hint && <span className="text-caption text-content-tertiary">{hint}</span>}
    </Card>
  );
}
