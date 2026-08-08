import { AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { Badge, EmptyState } from '../../design-system';
import type { AutomationExecution, ExecutionStatus } from './automationService';
import { EXECUTION_STATUS_LABEL, EXECUTION_STATUS_VARIANT, formatDateTime, formatDuration } from './automationFormat';

const EXECUTION_ICON: Record<ExecutionStatus, React.ReactNode> = {
  success: <CheckCircle2 />,
  failed: <AlertTriangle />,
  running: <Loader2 className="animate-spin" />,
};

export interface ExecutionHistoryListProps {
  executions: AutomationExecution[];
  className?: string;
}

export function ExecutionHistoryList({ executions }: ExecutionHistoryListProps) {
  if (executions.length === 0) {
    return (
      <EmptyState
        title="No runs yet"
        description="This automation has not executed. History will appear here after its first run."
      />
    );
  }

  return (
    <ul className="flex flex-col gap-2" data-testid="execution-history-list">
      {executions.map((exec) => (
        <li
          key={exec.id}
          className="flex flex-col gap-1 rounded-lg border border-line-subtle bg-surface-base px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
          data-testid="execution-history-item"
        >
          <div className="flex min-w-0 items-center gap-2">
            <Badge variant={EXECUTION_STATUS_VARIANT[exec.status]} size="sm">
              {EXECUTION_ICON[exec.status]}
              {EXECUTION_STATUS_LABEL[exec.status]}
            </Badge>
            <span className="truncate text-body-sm text-content-secondary">
              {exec.status === 'failed' ? exec.error : exec.result}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-3 text-caption text-content-tertiary">
            <span>{formatDateTime(exec.timestamp)}</span>
            <span>{formatDuration(exec.durationMs)}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
