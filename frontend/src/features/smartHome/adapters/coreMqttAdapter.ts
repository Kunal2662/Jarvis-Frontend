import { CoreConnectorContractUnavailableError, type ConnectorService } from '../smartHomeIntegrationService';

/**
 * Core adapter stub for the MQTT connector. Intentionally unimplemented —
 * `ready: false`. No Core MQTT endpoint has been invented; see
 * docs/CORE_HOME_ASSISTANT_MQTT_CONTRACT_REQUIRED.md. Every method rejects
 * with `CoreConnectorContractUnavailableError` rather than silently
 * returning fake data.
 */
function unavailable(): Promise<never> {
  return Promise.reject(new CoreConnectorContractUnavailableError('MQTT'));
}

export const coreMqttConnectorService: ConnectorService = {
  id: 'core',
  label: 'JARVIS Core (contract pending)',
  ready: false,
  connectorName: 'MQTT',
  getState: unavailable,
  connect: unavailable,
  disconnect: unavailable,
  reconnect: unavailable,
  syncEntities: unavailable,
};
