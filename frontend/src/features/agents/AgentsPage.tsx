import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AlertTriangle, Bot, CheckCircle2, PauseCircle, PowerOff } from 'lucide-react';
import { ModulePage, StatCard, useAsync, useToast } from '../../design-system';
import { getAgentService, type Agent, type AgentRun } from './agentService';
import { AgentCard } from './AgentCard';
import { AgentDetailDrawer } from './AgentDetailDrawer';

/**
 * Agents (roadmap item 17) — an observability + lightweight state-management
 * surface over the same AgentOrchestrator that already powers Chat/Voice.
 * Per docs/CORE_AGENTS_CONTRACT_REQUIRED.md, this page never executes or
 * simulates an agent run — enabling/disabling is a local state toggle only,
 * and activity history is always already-resolved past activity.
 */
export function AgentsPage() {
  const service = useMemo(() => getAgentService(), []);
  const location = useLocation();
  const { toast } = useToast();

  const list = useAsync<Agent[]>((signal) => service.getAgents(signal));

  // Patchable overrides layered on top of `list.data`, derived synchronously
  // on every render (never a separate `useState` synced via `useEffect`,
  // which would lag list.data by one render — see IntegrationsPage.tsx,
  // Step 15) — a toggle patches just the affected agent without flashing
  // the whole page back to loading.
  const [overrides, setOverrides] = useState<Record<string, Agent>>({});
  const agents = (list.data ?? []).map((a) => overrides[a.id] ?? a);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [toggling, setToggling] = useState<Set<string>>(new Set());
  const [runs, setRuns] = useState<AgentRun[]>([]);
  const [runsLoading, setRunsLoading] = useState(false);

  const selected = selectedId ? (agents.find((a) => a.id === selectedId) ?? null) : null;

  // Fetch this agent's run history whenever the selection changes.
  useEffect(() => {
    if (!selectedId) {
      setRuns([]);
      return;
    }
    let cancelled = false;
    setRunsLoading(true);
    service
      .getRuns(selectedId)
      .then((result) => {
        if (!cancelled) setRuns(result);
      })
      .catch(() => {
        if (!cancelled) setRuns([]);
      })
      .finally(() => {
        if (!cancelled) setRunsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedId, service]);

  // Deep-link support (mirrors AutomationsPage/MemoryPage): Universal Search
  // navigates here with `state: { agentId }`.
  const consumedDeepLink = useRef(false);
  useEffect(() => {
    if (consumedDeepLink.current || !list.data) return;
    const agentId = (location.state as { agentId?: string } | null)?.agentId;
    if (!agentId) return;
    if (agents.some((a) => a.id === agentId)) {
      consumedDeepLink.current = true;
      setSelectedId(agentId);
      window.history.replaceState({}, '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, list.data]);

  const pageStatus = !service.ready
    ? 'unavailable'
    : list.status === 'ready' && agents.length === 0
      ? 'empty'
      : list.status;

  const withToggling = useCallback((id: string, fn: () => Promise<void>) => {
    setToggling((prev) => new Set(prev).add(id));
    return fn().finally(() => {
      setToggling((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    });
  }, []);

  const handleToggle = (id: string, enabled: boolean) => {
    const agent = agents.find((a) => a.id === id);
    void withToggling(id, async () => {
      try {
        const updated = await service.setEnabled(id, enabled);
        setOverrides((prev) => ({ ...prev, [id]: updated }));
        toast({
          title: enabled ? 'Agent enabled' : 'Agent disabled',
          description: agent?.name,
          variant: enabled ? 'success' : 'info',
        });
      } catch (err) {
        toast({
          title: 'Could not update agent',
          description: err instanceof Error ? err.message : String(err),
          variant: 'danger',
        });
      }
    });
  };

  const counts = {
    total: agents.length,
    active: agents.filter((a) => a.status === 'active').length,
    idle: agents.filter((a) => a.status === 'idle').length,
    disabled: agents.filter((a) => a.status === 'disabled').length,
  };

  return (
    <>
      <ModulePage
        title="Agents"
        description={
          service.ready
            ? "Named roles Jarvis's AI orchestrator can adopt during a conversation, and their recent activity. Data shown here is local to this frontend session."
            : `${service.label} — agent data is not connected yet.`
        }
        status={pageStatus}
        onRetry={list.reload}
        error={list.error}
        stateProps={
          pageStatus === 'empty'
            ? { title: 'No agents yet', description: 'Agent roles Jarvis can adopt will appear here once available.' }
            : undefined
        }
      >
        <div className="flex flex-col gap-6 pb-16" data-testid="agents-page">
          <div
            className="flex items-start gap-3 rounded-lg border border-warning/40 bg-warning-soft p-4"
            role="note"
            data-testid="agents-simulation-banner"
          >
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden="true" />
            <div className="flex flex-col gap-0.5">
              <span className="text-body-sm font-semibold text-content">
                Local development data — this page does not run or execute anything
              </span>
              <span className="text-body-sm text-content-secondary">
                Every agent and activity entry here is simulated and local to this browser tab. Enabling or
                disabling an agent is a local preference only — Jarvis's real orchestrator, and when it actually
                uses a given role, remain entirely owned by JARVIS Core.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Total" value={counts.total} icon={<Bot />} />
            <StatCard label="Active" value={counts.active} icon={<CheckCircle2 />} />
            <StatCard label="Idle" value={counts.idle} icon={<PauseCircle />} />
            <StatCard label="Disabled" value={counts.disabled} icon={<PowerOff />} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" data-testid="agents-grid">
            {agents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onOpen={setSelectedId}
                onToggle={handleToggle}
                toggling={toggling.has(agent.id)}
              />
            ))}
          </div>
        </div>
      </ModulePage>

      <AgentDetailDrawer
        agent={selected}
        runs={runs}
        runsLoading={runsLoading}
        open={selectedId !== null}
        onOpenChange={(open) => !open && setSelectedId(null)}
        onToggle={(agent, enabled) => handleToggle(agent.id, enabled)}
        toggling={selected ? toggling.has(selected.id) : false}
      />
    </>
  );
}
