import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Workflow } from 'lucide-react';
import { StateView, useAsync } from '../../../design-system';
import { getAutomationService, type Automation } from '../../automations/automationService';
import { SettingsSummaryCard } from './SettingsSummaryCard';

/**
 * Automations settings — a read-only summary over the existing
 * `AutomationService` seam (Step 8). No create/edit/execute UI is built
 * here — that stays exclusively on AutomationsPage; this tab only
 * summarizes and links there (see docs/CORE_SETTINGS_CONTRACT_REQUIRED.md).
 */
export function AutomationsSection() {
  const navigate = useNavigate();
  const service = useMemo(() => getAutomationService(), []);
  const list = useAsync<Automation[]>((signal) => service.getAutomations(signal));

  const enabled = (list.data ?? []).filter((a) => a.enabled).length;
  const paused = (list.data ?? []).filter((a) => !a.enabled).length;

  return (
    <div className="flex flex-col gap-4" data-testid="settings-automations">
      <StateView status={list.status} onRetry={list.reload} compact>
        {list.data && (
          <SettingsSummaryCard
            icon={Workflow}
            title="Automations"
            description="Rules Jarvis runs on your behalf when their triggers fire."
            stats={[
              { label: 'Total', value: list.data.length },
              { label: 'Enabled', value: enabled },
              { label: 'Paused', value: paused },
            ]}
            linkLabel="Open Automations"
            onOpen={() => navigate('/automations')}
            data-testid="settings-automations-summary"
          />
        )}
      </StateView>
    </div>
  );
}
