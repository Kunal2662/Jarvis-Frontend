import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { House, Wrench } from 'lucide-react';
import { StateView, useAsync } from '../../../design-system';
import { getSmartHomeService, type Device, type Room, type Scene } from '../../smartHome/smartHomeService';
import {
  getHomeAssistantConnectorService,
  getMqttConnectorService,
  type ConnectorState,
} from '../../smartHome/smartHomeIntegrationService';
import { ConnectorCard } from '../../smartHome/ConnectorCard';
import { SettingsSummaryCard } from './SettingsSummaryCard';

interface SmartHomeOverview {
  rooms: Room[];
  devices: Device[];
  scenes: Scene[];
  home_assistant: ConnectorState | null;
  mqtt: ConnectorState | null;
}

/**
 * Smart Home settings — a read-only summary over the existing
 * `SmartHomeService` + `ConnectorService` seams (Steps 13-15), reusing the
 * already-built `ConnectorCard`. Connect/disconnect/sync stays exclusively
 * on IntegrationsPage; this tab only summarizes and links there — no
 * second Smart Home or connector system (see
 * docs/CORE_SETTINGS_CONTRACT_REQUIRED.md).
 */
export function SmartHomeSection() {
  const navigate = useNavigate();
  const smartHomeService = useMemo(() => getSmartHomeService(), []);
  const haService = useMemo(() => getHomeAssistantConnectorService(), []);
  const mqttService = useMemo(() => getMqttConnectorService(), []);

  const overview = useAsync<SmartHomeOverview>(async (signal) => {
    const [rooms, devices, scenes, home_assistant, mqtt] = await Promise.all([
      smartHomeService.getRooms(signal),
      smartHomeService.getDevices(undefined, signal),
      smartHomeService.getScenes(signal),
      haService.ready ? haService.getState(signal) : Promise.resolve(null),
      mqttService.ready ? mqttService.getState(signal) : Promise.resolve(null),
    ]);
    return { rooms, devices, scenes, home_assistant, mqtt };
  });

  return (
    <div className="flex flex-col gap-4" data-testid="settings-smart-home">
      <StateView status={overview.status} onRetry={overview.reload} compact>
        {overview.data && (
          <div className="flex flex-col gap-4">
            <SettingsSummaryCard
              icon={House}
              title="Command Center"
              description="Rooms, devices, and scenes — all simulated and local to this browser tab."
              stats={[
                { label: 'Rooms', value: overview.data.rooms.length },
                { label: 'Devices', value: overview.data.devices.length },
                { label: 'Scenes', value: overview.data.scenes.length },
              ]}
              linkLabel="Open Smart Home"
              onOpen={() => navigate('/smart-home')}
              data-testid="settings-smart-home-summary"
            />

            <button
              type="button"
              onClick={() => navigate('/smart-home/devices')}
              className="flex items-center gap-2.5 self-start rounded-lg border border-line px-3.5 py-2 text-body-sm text-content-secondary transition-colors hover:border-line-strong hover:text-content"
              data-testid="settings-smart-home-manage-devices"
            >
              <Wrench className="size-4" aria-hidden="true" />
              Manage devices
            </button>

            <div>
              <span className="mb-2 block text-overline uppercase text-content-tertiary">Connections</span>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <ConnectorCard
                  type="home_assistant"
                  state={overview.data.home_assistant}
                  onOpen={() => navigate('/smart-home/integrations')}
                />
                <ConnectorCard
                  type="mqtt"
                  state={overview.data.mqtt}
                  onOpen={() => navigate('/smart-home/integrations')}
                />
              </div>
            </div>
          </div>
        )}
      </StateView>
    </div>
  );
}
