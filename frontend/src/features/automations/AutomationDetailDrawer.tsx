import { Pause, Pencil, Play, Trash2 } from 'lucide-react';
import {
  Badge,
  Button,
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  Spinner,
} from '../../design-system';
import type { Automation } from './automationService';
import { AutomationStatusBadge } from './AutomationStatusBadge';
import { ExecutionHistoryList } from './ExecutionHistoryList';
import { formatDateTime } from './automationFormat';

export interface AutomationDetailDrawerProps {
  automation: Automation | null;
  loading?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (automation: Automation) => void;
  onDelete: (automation: Automation) => void;
  onPauseResume: (automation: Automation) => void;
  busy?: boolean;
}

export function AutomationDetailDrawer({
  automation,
  loading,
  open,
  onOpenChange,
  onEdit,
  onDelete,
  onPauseResume,
  busy,
}: AutomationDetailDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent side="right" className="w-full max-w-lg overflow-y-auto" data-testid="automation-detail-drawer">
        {loading || !automation ? (
          <div className="flex flex-1 items-center justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            <DrawerHeader>
              <div className="flex items-center gap-2">
                <DrawerTitle>{automation.name}</DrawerTitle>
                <AutomationStatusBadge status={automation.status} />
              </div>
              <DrawerDescription>{automation.description || 'No description provided.'}</DrawerDescription>
            </DrawerHeader>

            <div className="grid grid-cols-2 gap-3 text-body-sm">
              <div className="rounded-lg border border-line-subtle p-3">
                <div className="text-caption text-content-tertiary">Next run</div>
                <div className="text-content">{formatDateTime(automation.nextRun)}</div>
              </div>
              <div className="rounded-lg border border-line-subtle p-3">
                <div className="text-caption text-content-tertiary">Last run</div>
                <div className="text-content">{formatDateTime(automation.lastRun)}</div>
                {automation.lastResult && (
                  <Badge
                    variant={automation.lastResult === 'success' ? 'success' : 'danger'}
                    size="sm"
                    className="mt-1"
                  >
                    {automation.lastResult === 'success' ? 'Success' : 'Failed'}
                  </Badge>
                )}
              </div>
            </div>

            <section className="flex flex-col gap-2">
              <h3 className="text-body-sm font-semibold text-content">Trigger</h3>
              <p className="rounded-lg border border-line-subtle p-3 text-body-sm text-content-secondary">
                {automation.trigger.summary}
              </p>
            </section>

            <section className="flex flex-col gap-2">
              <h3 className="text-body-sm font-semibold text-content">Conditions</h3>
              {automation.conditions.length === 0 ? (
                <p className="text-caption text-content-tertiary">None — always runs on trigger.</p>
              ) : (
                <ul className="flex flex-col gap-1.5">
                  {automation.conditions.map((c) => (
                    <li key={c.id} className="rounded-lg border border-line-subtle p-2.5 text-body-sm text-content-secondary">
                      {c.summary}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="flex flex-col gap-2">
              <h3 className="text-body-sm font-semibold text-content">Actions</h3>
              <ul className="flex flex-col gap-1.5">
                {automation.actions.map((a) => (
                  <li key={a.id} className="rounded-lg border border-line-subtle p-2.5 text-body-sm text-content-secondary">
                    {a.summary}
                  </li>
                ))}
              </ul>
            </section>

            <section className="flex flex-col gap-2">
              <h3 className="text-body-sm font-semibold text-content">Execution history</h3>
              <ExecutionHistoryList executions={automation.executionHistory} />
            </section>

            <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-line-subtle pt-4">
              <Button variant="secondary" leftIcon={<Pencil className="size-4" />} onClick={() => onEdit(automation)}>
                Edit
              </Button>
              <Button
                variant="secondary"
                leftIcon={automation.status === 'paused' ? <Play className="size-4" /> : <Pause className="size-4" />}
                onClick={() => onPauseResume(automation)}
                disabled={busy}
                data-testid="automation-pause-resume"
              >
                {automation.status === 'paused' ? 'Resume' : 'Pause'}
              </Button>
              <Button
                variant="danger"
                leftIcon={<Trash2 className="size-4" />}
                onClick={() => onDelete(automation)}
                className="ml-auto"
                data-testid="automation-delete-trigger"
              >
                Delete
              </Button>
            </div>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}
