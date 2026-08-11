import { Power, PowerOff } from 'lucide-react';
import { Badge, Button, Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, Spinner } from '../../design-system';
import type { Agent, AgentRun } from './agentService';
import { AgentRunHistoryList } from './AgentRunHistoryList';
import { AGENT_STATUS_BADGE_VARIANT, AGENT_STATUS_LABEL, formatDateTime } from './agentFormat';

export interface AgentDetailDrawerProps {
  agent: Agent | null;
  runs: AgentRun[];
  /** True only while the agent itself is still loading — hides the whole
   *  drawer. Distinct from `runsLoading`, which only affects the activity
   *  section below so already-loaded agent details stay visible. */
  loading?: boolean;
  /** True while this agent's run history is being fetched. */
  runsLoading?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onToggle: (agent: Agent, enabled: boolean) => void;
  toggling?: boolean;
}

/** Read-only agent detail + activity history + an enable/disable toggle —
 *  deliberately no "run"/execute action (see agentService.ts's module
 *  doc: running an agent is a Core-owned consequence Automations already
 *  models, not something this surface hands the user a button to fire). */
export function AgentDetailDrawer({
  agent,
  runs,
  loading,
  runsLoading,
  open,
  onOpenChange,
  onToggle,
  toggling,
}: AgentDetailDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent side="right" className="w-full max-w-lg overflow-y-auto" data-testid="agent-detail-drawer">
        {loading || !agent ? (
          <div className="flex flex-1 items-center justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            <DrawerHeader>
              <div className="flex flex-wrap items-center gap-2">
                <DrawerTitle>{agent.name}</DrawerTitle>
                <Badge variant={AGENT_STATUS_BADGE_VARIANT[agent.status]} size="sm" data-testid="agent-detail-status">
                  {AGENT_STATUS_LABEL[agent.status]}
                </Badge>
              </div>
              <DrawerDescription>{agent.description}</DrawerDescription>
            </DrawerHeader>

            <section className="flex flex-col gap-2">
              <h3 className="text-body-sm font-semibold text-content">Capabilities</h3>
              <div className="flex flex-wrap gap-1.5">
                {agent.capabilities.map((cap) => (
                  <Badge key={cap} variant="outline" size="sm">
                    {cap}
                  </Badge>
                ))}
              </div>
            </section>

            <div className="rounded-lg border border-line-subtle p-3 text-body-sm">
              <div className="text-caption text-content-tertiary">Last activity</div>
              <div className="text-content">{formatDateTime(agent.lastRunAt)}</div>
            </div>

            <section className="flex flex-col gap-2">
              <h3 className="text-body-sm font-semibold text-content">Recent activity</h3>
              <p className="text-caption text-content-tertiary">
                Read-only history — Jarvis decides when this agent role is used during a conversation, not this page.
              </p>
              {runsLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Spinner size="md" />
                </div>
              ) : (
                <AgentRunHistoryList runs={runs} />
              )}
            </section>

            <div className="mt-auto flex items-center border-t border-line-subtle pt-4">
              <Button
                variant={agent.status === 'disabled' ? 'secondary' : 'danger'}
                leftIcon={agent.status === 'disabled' ? <Power className="size-4" /> : <PowerOff className="size-4" />}
                onClick={() => onToggle(agent, agent.status === 'disabled')}
                loading={toggling}
                data-testid="agent-toggle-detail"
              >
                {agent.status === 'disabled' ? 'Enable agent' : 'Disable agent'}
              </Button>
            </div>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}
