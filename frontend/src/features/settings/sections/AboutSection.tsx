import { Badge, Card } from '../../../design-system';
import { getChatService } from '../../chat/chatService';
import { getVoiceService } from '../../voice/voiceService';
import { getAutomationService } from '../../automations/automationService';
import { getSmartHomeService } from '../../smartHome/smartHomeService';
import { getHomeAssistantConnectorService, getMqttConnectorService } from '../../smartHome/smartHomeIntegrationService';
import { getMemoryService } from '../../memory/memoryService';
import { getAgentService } from '../../agents/agentService';
import { getSettingsService } from '../settingsService';
import pkg from '../../../../package.json';

interface SystemRow {
  name: string;
  id: string;
  label: string;
  ready: boolean;
}

/**
 * About settings — real, non-fabricated version and system-status info.
 * The frontend version comes straight from package.json; every backend row
 * reads a real `id`/`label`/`ready` off that feature's own service seam —
 * never hardcoded strings (see docs/CORE_SETTINGS_CONTRACT_REQUIRED.md).
 */
export function AboutSection() {
  const rows: SystemRow[] = [
    { name: 'Chat / Voice orchestrator', ...pick(getChatService()) },
    { name: 'Voice (speech)', ...pick(getVoiceService()) },
    { name: 'Automations', ...pick(getAutomationService()) },
    { name: 'Smart Home', ...pick(getSmartHomeService()) },
    { name: 'Home Assistant', ...pick(getHomeAssistantConnectorService()) },
    { name: 'MQTT', ...pick(getMqttConnectorService()) },
    { name: 'Memory', ...pick(getMemoryService()) },
    { name: 'Agents', ...pick(getAgentService()) },
    { name: 'Settings', ...pick(getSettingsService()) },
  ];

  return (
    <div className="flex flex-col gap-4" data-testid="settings-about">
      <Card className="flex flex-col gap-1 p-5">
        <span className="text-overline uppercase text-content-tertiary">JARVIS Frontend</span>
        <span className="font-display text-h2 text-content" data-testid="settings-about-version">
          v{pkg.version}
        </span>
        <span className="text-body-sm text-content-secondary">
          Development checkpoint — {import.meta.env.MODE === 'production' ? 'production build' : 'development build'}.
        </span>
      </Card>

      <Card className="flex flex-col gap-3 p-5">
        <span className="text-overline uppercase text-content-tertiary">System status</span>
        <ul className="flex flex-col divide-y divide-line-subtle" data-testid="settings-about-system-status">
          {rows.map((row) => (
            <li key={row.name} className="flex items-center justify-between gap-3 py-2.5">
              <div className="flex flex-col">
                <span className="text-body-sm text-content">{row.name}</span>
                <span className="text-caption text-content-tertiary">{row.label}</span>
              </div>
              <Badge variant={row.ready ? 'success' : 'neutral'} size="sm">
                {row.ready ? 'Ready' : 'Not connected'}
              </Badge>
            </li>
          ))}
        </ul>
        <p className="text-caption text-content-tertiary">
          "Not connected" means that surface is running on local frontend mock data — no JARVIS Core
          endpoint has been invented for it yet. See each feature's own{' '}
          <code className="rounded bg-surface-inset px-1 py-0.5">docs/CORE_*_CONTRACT_REQUIRED.md</code>.
        </p>
      </Card>
    </div>
  );
}

function pick(service: { id: string; label: string; ready: boolean }): { id: string; label: string; ready: boolean } {
  return { id: service.id, label: service.label, ready: service.ready };
}
