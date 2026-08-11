import { Badge, Card, Switch } from '../../design-system';
import type { Agent } from './agentService';
import { AGENT_STATUS_BADGE_VARIANT, AGENT_STATUS_LABEL, formatDateTime } from './agentFormat';

export interface AgentCardProps {
  agent: Agent;
  onOpen: (id: string) => void;
  onToggle: (id: string, enabled: boolean) => void;
  toggling?: boolean;
}

/** A single agent role summary card — mirrors AutomationCard.tsx. Enabling/
 *  disabling is a local state toggle only, never an execution action (see
 *  agentService.ts's module doc). */
export function AgentCard({ agent, onOpen, onToggle, toggling }: AgentCardProps) {
  return (
    <Card
      variant="raised"
      interactive
      role="button"
      tabIndex={0}
      onClick={() => onOpen(agent.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen(agent.id);
        }
      }}
      className="flex flex-col gap-3 p-4"
      data-testid={`agent-card-${agent.id}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="truncate text-body font-semibold text-content">{agent.name}</span>
          <span className="line-clamp-2 text-body-sm text-content-secondary">{agent.description}</span>
        </div>
        <Switch
          checked={agent.status !== 'disabled'}
          disabled={toggling}
          aria-label={agent.status === 'disabled' ? `Enable ${agent.name}` : `Disable ${agent.name}`}
          onClick={(e) => e.stopPropagation()}
          onCheckedChange={(checked) => onToggle(agent.id, checked)}
          data-testid={`agent-toggle-${agent.id}`}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={AGENT_STATUS_BADGE_VARIANT[agent.status]} size="sm" data-testid={`agent-status-${agent.id}`}>
          {AGENT_STATUS_LABEL[agent.status]}
        </Badge>
        {agent.capabilities.map((cap) => (
          <Badge key={cap} variant="outline" size="sm">
            {cap}
          </Badge>
        ))}
      </div>

      <div className="mt-auto border-t border-line-subtle pt-3 text-caption text-content-tertiary">
        Last activity: {formatDateTime(agent.lastRunAt)}
      </div>
    </Card>
  );
}
