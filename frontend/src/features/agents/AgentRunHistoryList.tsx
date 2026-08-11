import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Badge, EmptyState } from '../../design-system';
import type { AgentRun, AgentRunStatus } from './agentService';
import { AGENT_RUN_STATUS_LABEL, AGENT_RUN_STATUS_VARIANT, formatDateTime } from './agentFormat';

const RUN_ICON: Record<AgentRunStatus, React.ReactNode> = {
  completed: <CheckCircle2 />,
  failed: <AlertTriangle />,
};

export interface AgentRunHistoryListProps {
  runs: AgentRun[];
}

/** Read-only activity history — mirrors ExecutionHistoryList.tsx. Always
 *  already-resolved past activity (completed/failed), never a live run
 *  this UI itself initiated (see agentService.ts's module doc). */
export function AgentRunHistoryList({ runs }: AgentRunHistoryListProps) {
  if (runs.length === 0) {
    return <EmptyState title="No activity yet" description="This agent's recent activity will appear here." />;
  }

  return (
    <ul className="flex flex-col gap-2" data-testid="agent-run-history-list">
      {runs.map((run) => (
        <li
          key={run.id}
          className="flex flex-col gap-1 rounded-lg border border-line-subtle bg-surface-base px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
          data-testid="agent-run-history-item"
        >
          <div className="flex min-w-0 items-center gap-2">
            <Badge variant={AGENT_RUN_STATUS_VARIANT[run.status]} size="sm">
              {RUN_ICON[run.status]}
              {AGENT_RUN_STATUS_LABEL[run.status]}
            </Badge>
            <span className="truncate text-body-sm text-content-secondary">{run.summary}</span>
          </div>
          <span className="shrink-0 text-caption text-content-tertiary">{formatDateTime(run.startedAt)}</span>
        </li>
      ))}
    </ul>
  );
}
