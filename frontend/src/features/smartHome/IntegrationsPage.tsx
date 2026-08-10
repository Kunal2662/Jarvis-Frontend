import { useCallback, useMemo, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { ModulePage, useAsync, useToast } from '../../design-system';
import {
  getHomeAssistantConnectorService,
  getMqttConnectorService,
  type ConnectorService,
  type ConnectorSettingsInput,
  type ConnectorState,
  type ConnectorType,
} from './smartHomeIntegrationService';
import { ConnectorCard } from './ConnectorCard';
import { ConnectorDetailDrawer } from './ConnectorDetailDrawer';

interface IntegrationsData {
  home_assistant: ConnectorState | null;
  mqtt: ConnectorState | null;
}

const CONNECTOR_VERB: Record<'connect' | 'disconnect' | 'reconnect' | 'sync', string> = {
  connect: 'connected',
  disconnect: 'disconnected',
  reconnect: 'reconnected',
  sync: 'synced',
};

/**
 * Home Assistant + MQTT integration status/configuration/diagnostics
 * (roadmap item 15) — extends the Smart Home area with a connector layer,
 * never a second Smart Home system. Device control stays entirely on
 * `SmartHomePage`/`SmartHomeService.sendCommand`; this page never sends a
 * device command, and syncing a connector never adds entities to the
 * Command Center's live device list (see smartHomeIntegrationService.ts's
 * module doc + docs/CORE_HOME_ASSISTANT_MQTT_CONTRACT_REQUIRED.md).
 */
export function IntegrationsPage() {
  const haService = useMemo(() => getHomeAssistantConnectorService(), []);
  const mqttService = useMemo(() => getMqttConnectorService(), []);
  const { toast } = useToast();

  const list = useAsync<IntegrationsData>(async (signal) => {
    const [home_assistant, mqtt] = await Promise.all([
      haService.ready ? haService.getState(signal) : Promise.resolve(null),
      mqttService.ready ? mqttService.getState(signal) : Promise.resolve(null),
    ]);
    return { home_assistant, mqtt };
  });

  // Patchable overrides layered on top of `list.data`, derived synchronously
  // on every render (never a separate `useState` synced via `useEffect`,
  // which would lag list.data by one render) — a connect/disconnect/sync
  // patches just the affected connector without flashing the whole page
  // back to loading or a stale pre-load value.
  const [overrides, setOverrides] = useState<Partial<IntegrationsData>>({});
  const connectors: IntegrationsData = {
    home_assistant: overrides.home_assistant ?? list.data?.home_assistant ?? null,
    mqtt: overrides.mqtt ?? list.data?.mqtt ?? null,
  };

  const [selectedType, setSelectedType] = useState<ConnectorType | null>(null);
  const [busy, setBusy] = useState<'connect' | 'disconnect' | 'reconnect' | 'sync' | null>(null);

  const serviceFor = useCallback(
    (type: ConnectorType): ConnectorService => (type === 'home_assistant' ? haService : mqttService),
    [haService, mqttService],
  );
  const connectorLabel = (type: ConnectorType) => (type === 'home_assistant' ? 'Home Assistant' : 'MQTT');

  const runAction = async (
    type: ConnectorType,
    action: 'connect' | 'disconnect' | 'reconnect' | 'sync',
    call: () => Promise<ConnectorState>,
  ) => {
    setBusy(action);
    try {
      const updated = await call();
      setOverrides((prev) => ({ ...prev, [type]: updated }));
      toast({ title: `${connectorLabel(type)} ${CONNECTOR_VERB[action]}`, variant: 'success' });
    } catch (err) {
      toast({
        title: `Could not ${action} ${connectorLabel(type)}`,
        description: err instanceof Error ? err.message : String(err),
        variant: 'danger',
      });
    } finally {
      setBusy(null);
    }
  };

  const handleConnect = (type: ConnectorType, input: ConnectorSettingsInput) =>
    runAction(type, 'connect', () => serviceFor(type).connect(input));
  const handleDisconnect = (type: ConnectorType) => runAction(type, 'disconnect', () => serviceFor(type).disconnect());
  const handleReconnect = (type: ConnectorType) => runAction(type, 'reconnect', () => serviceFor(type).reconnect());
  const handleSync = (type: ConnectorType) => runAction(type, 'sync', () => serviceFor(type).syncEntities());

  const selectedState = selectedType ? connectors[selectedType] : null;
  const selectedNotReady = selectedType ? !serviceFor(selectedType).ready : false;

  return (
    <>
      <ModulePage
        title="Integrations"
        description="Home Assistant and MQTT connector status, configuration, and diagnostics. Everything shown here is simulated and local to this frontend session."
        status={list.status}
        onRetry={list.reload}
        error={list.error}
      >
        <div className="flex flex-col gap-6 pb-16" data-testid="integrations-page">
          <div
            className="flex items-start gap-3 rounded-lg border border-warning/40 bg-warning-soft p-4"
            role="note"
            data-testid="integrations-simulation-banner"
          >
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden="true" />
            <div className="flex flex-col gap-0.5">
              <span className="text-body-sm font-semibold text-content">
                Simulated connectors — no real Home Assistant or MQTT broker is contacted
              </span>
              <span className="text-body-sm text-content-secondary">
                Connecting here never performs a real handshake, and no credential you enter is stored or displayed
                back. Syncing never adds devices to the Smart Home Command Center — this page is status and
                diagnostics only.
              </span>
            </div>
          </div>

          {list.status === 'ready' && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ConnectorCard type="home_assistant" state={connectors.home_assistant} onOpen={setSelectedType} />
              <ConnectorCard type="mqtt" state={connectors.mqtt} onOpen={setSelectedType} />
            </div>
          )}
        </div>
      </ModulePage>

      <ConnectorDetailDrawer
        type={selectedType}
        state={selectedState}
        notReady={selectedNotReady}
        open={selectedType !== null}
        onOpenChange={(open) => !open && setSelectedType(null)}
        onConnect={(input) => {
          if (selectedType) void handleConnect(selectedType, input);
        }}
        onDisconnect={() => {
          if (selectedType) void handleDisconnect(selectedType);
        }}
        onReconnect={() => {
          if (selectedType) void handleReconnect(selectedType);
        }}
        onSync={() => {
          if (selectedType) void handleSync(selectedType);
        }}
        busy={busy}
      />
    </>
  );
}
