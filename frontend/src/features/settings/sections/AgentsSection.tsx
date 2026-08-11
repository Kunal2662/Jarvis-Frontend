import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot } from 'lucide-react';
import { StateView, useAsync } from '../../../design-system';
import { getAgentService, type Agent } from '../../agents/agentService';
import { SettingsSummaryCard } from './SettingsSummaryCard';

/**
 * Agents settings — a read-only summary over the existing `AgentService`
 * seam (Step 17). No second agent configuration/orchestration system, and
 * no execute action — enable/disable stays exclusively on AgentsPage; this
 * tab only summarizes and links there (see
 * docs/CORE_SETTINGS_CONTRACT_REQUIRED.md).
 */
export function AgentsSection() {
  const navigate = useNavigate();
  const service = useMemo(() => getAgentService(), []);
  const list = useAsync<Agent[]>((signal) => service.getAgents(signal));

  const active = (list.data ?? []).filter((a) => a.status === 'active').length;
  const disabled = (list.data ?? []).filter((a) => a.status === 'disabled').length;

  return (
    <div className="flex flex-col gap-4" data-testid="settings-agents">
      <StateView status={list.status} onRetry={list.reload} compact>
        {list.data && (
          <SettingsSummaryCard
            icon={Bot}
            title="Agents"
            description="Named roles Jarvis's orchestrator can adopt during a conversation."
            stats={[
              { label: 'Total', value: list.data.length },
              { label: 'Active', value: active },
              { label: 'Disabled', value: disabled },
            ]}
            linkLabel="Open Agents"
            onOpen={() => navigate('/agents')}
            data-testid="settings-agents-summary"
          />
        )}
      </StateView>
    </div>
  );
}
