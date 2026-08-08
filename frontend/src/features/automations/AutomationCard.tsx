import { Calendar, Zap } from 'lucide-react';
import { Card, Switch } from '../../design-system';
import type { Automation } from './automationService';
import { AutomationStatusBadge } from './AutomationStatusBadge';
import { formatDateTime } from './automationFormat';

export interface AutomationCardProps {
  automation: Automation;
  onOpen: (id: string) => void;
  onToggle: (id: string, enabled: boolean) => void;
  toggling?: boolean;
}

export function AutomationCard({ automation, onOpen, onToggle, toggling }: AutomationCardProps) {
  return (
    <Card
      variant="raised"
      interactive
      role="button"
      tabIndex={0}
      onClick={() => onOpen(automation.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen(automation.id);
        }
      }}
      className="flex flex-col gap-3 p-4"
      data-testid={`automation-card-${automation.id}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="truncate text-body font-semibold text-content">{automation.name}</span>
          <span className="line-clamp-2 text-body-sm text-content-secondary">{automation.description}</span>
        </div>
        <Switch
          checked={automation.enabled}
          disabled={toggling}
          aria-label={automation.enabled ? `Disable ${automation.name}` : `Enable ${automation.name}`}
          onClick={(e) => e.stopPropagation()}
          onCheckedChange={(checked) => onToggle(automation.id, checked)}
          data-testid={`automation-toggle-${automation.id}`}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <AutomationStatusBadge status={automation.status} />
        <span className="inline-flex items-center gap-1 text-caption text-content-tertiary">
          <Zap className="size-3.5" />
          {automation.trigger.summary}
        </span>
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line-subtle pt-3 text-caption text-content-tertiary">
        <span className="inline-flex items-center gap-1">
          <Calendar className="size-3.5" />
          Next: {formatDateTime(automation.nextRun)}
        </span>
        <span>Last: {formatDateTime(automation.lastRun)}</span>
      </div>
    </Card>
  );
}
