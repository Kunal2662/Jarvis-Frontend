import { CoreConnectorContractUnavailableError, type ConnectorService } from '../smartHomeIntegrationService';

/**
 * Core adapter stub for the Home Assistant connector. Intentionally
 * unimplemented — `ready: false`. No Core Home Assistant endpoint has been
 * invented; see docs/CORE_HOME_ASSISTANT_MQTT_CONTRACT_REQUIRED.md. Every
 * method rejects with `CoreConnectorContractUnavailableError` rather than
 * silently returning fake data.
 */
function unavailable(): Promise<never> {
  return Promise.reject(new CoreConnectorContractUnavailableError('Home Assistant'));
}

export const coreHomeAssistantConnectorService: ConnectorService = {
  id: 'core',
  label: 'JARVIS Core (contract pending)',
  ready: false,
  connectorName: 'Home Assistant',
  getState: unavailable,
  connect: unavailable,
  disconnect: unavailable,
  reconnect: unavailable,
  syncEntities: unavailable,
};
