import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { StateView, useAsync } from '../../../design-system';
import { getAiAppsService, type AiApp } from '../../aiApps/aiAppsService';
import { SettingsSummaryCard } from './SettingsSummaryCard';

/**
 * AI Apps settings — a read-only summary over the existing `AiAppsService`
 * catalog (Step 11). No OAuth, no provider API, no duplicated catalog —
 * this tab only summarizes and links to /apps (see
 * docs/CORE_SETTINGS_CONTRACT_REQUIRED.md).
 */
export function AiAppsSection() {
  const navigate = useNavigate();
  const service = useMemo(() => getAiAppsService(), []);
  const list = useAsync<AiApp[]>((signal) => service.getApps(signal));

  const connected = (list.data ?? []).filter((a) => a.connectionStatus === 'connected').length;

  return (
    <div className="flex flex-col gap-4" data-testid="settings-ai-apps">
      <StateView status={list.status} onRetry={list.reload} compact>
        {list.data && (
          <SettingsSummaryCard
            icon={Sparkles}
            title="AI Apps & Integrations"
            description="MCP-style tools and third-party connectors Jarvis can use in a conversation."
            stats={[
              { label: 'Total', value: list.data.length },
              { label: 'Connected', value: connected },
            ]}
            linkLabel="Open AI Apps"
            onOpen={() => navigate('/apps')}
            data-testid="settings-ai-apps-summary"
          />
        )}
      </StateView>
    </div>
  );
}
