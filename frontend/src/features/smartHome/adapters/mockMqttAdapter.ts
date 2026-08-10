import type {
  ConnectorService,
  ConnectorSettingsInput,
  ConnectorState,
  DiscoveredEntity,
} from '../smartHomeIntegrationService';

/**
 * Frontend in-memory mock adapter for the MQTT connector (roadmap item 15).
 * All state + mutation logic lives HERE. Simulates realistic network latency
 * so loading/connecting states are exercised, and mutates real in-memory
 * state so the UI is fully interactive.
 *
 * No real MQTT broker is ever contacted anywhere in this file — this
 * frontend never becomes an MQTT client. `connect()` never dials a real
 * broker — it validates the form input is non-empty, discards the
 * password/secret immediately, and records only a display label.
 * `syncEntities()` never subscribes to real topics — it returns a small,
 * fixed preview list.
 */

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

async function withAbort<T>(signal: AbortSignal | undefined, value: T, ms = 300): Promise<T> {
  const result = await delay(value, ms);
  if (signal?.aborted) throw new DOMException('aborted', 'AbortError');
  return result;
}

const CONNECT_DELAY_MS = 1000;
const SYNC_DELAY_MS = 1500;

let diagSeq = 0;
function nextDiagId(): string {
  diagSeq += 1;
  return `mqtt-diag-${diagSeq}`;
}

let state: ConnectorState = {
  status: 'not_configured',
  credentialState: 'not_configured',
  discoveredEntities: [],
  diagnostics: [],
};

function log(level: 'info' | 'warning' | 'error', message: string): void {
  state = {
    ...state,
    diagnostics: [{ id: nextDiagId(), timestamp: new Date().toISOString(), level, message }, ...state.diagnostics].slice(
      0,
      20,
    ),
  };
}

/** A small, fixed preview — clearly mock data, never something actually
 *  discovered from a real MQTT broker's topics. */
const ENTITY_PREVIEW: DiscoveredEntity[] = [
  { id: 'mqtt-preview-1', name: 'Workshop Plug', roomName: 'Workshop', type: 'Switch', capabilities: ['power'] },
  { id: 'mqtt-preview-2', name: 'Attic Humidity Sensor', roomName: 'Attic', type: 'Sensor', capabilities: ['sensor'] },
];

export const mockMqttConnectorService: ConnectorService = {
  id: 'mock',
  label: 'Frontend mock (MQTT)',
  ready: true,
  connectorName: 'MQTT',

  async getState(signal?: AbortSignal): Promise<ConnectorState> {
    return withAbort(signal, { ...state, diagnostics: [...state.diagnostics] });
  },

  async connect(input: ConnectorSettingsInput, signal?: AbortSignal): Promise<ConnectorState> {
    const endpoint = input.endpoint.trim();
    if (!endpoint) throw new Error('Broker host is required.');
    if (!input.secret.trim()) throw new Error('Broker password is required.');
    // The secret is validated as present, then discarded immediately below —
    // never assigned to `state`, never logged.

    state = { ...state, status: 'connecting' };
    await delay(undefined, CONNECT_DELAY_MS);
    if (signal?.aborted) throw new DOMException('aborted', 'AbortError');

    state = {
      ...state,
      status: 'connected',
      credentialState: 'configured',
      instance: { label: endpoint },
    };
    log('info', `Connected to broker ${endpoint}.`);
    return withAbort(signal, { ...state, diagnostics: [...state.diagnostics] }, 0);
  },

  async disconnect(signal?: AbortSignal): Promise<ConnectorState> {
    if (state.status !== 'connected' && state.status !== 'error') {
      throw new Error('MQTT broker is not connected.');
    }
    state = { ...state, status: 'disconnected', discoveredEntities: [] };
    log('info', 'Disconnected from broker.');
    return withAbort(signal, { ...state, diagnostics: [...state.diagnostics] });
  },

  async reconnect(signal?: AbortSignal): Promise<ConnectorState> {
    if (state.status !== 'disconnected' && state.status !== 'error') {
      throw new Error('MQTT broker is not in a reconnectable state.');
    }
    state = { ...state, status: 'connecting' };
    await delay(undefined, CONNECT_DELAY_MS);
    if (signal?.aborted) throw new DOMException('aborted', 'AbortError');

    state = { ...state, status: 'connected' };
    log('info', 'Reconnected to broker.');
    return withAbort(signal, { ...state, diagnostics: [...state.diagnostics] }, 0);
  },

  async syncEntities(signal?: AbortSignal): Promise<ConnectorState> {
    if (state.status !== 'connected') throw new Error('Connect to the MQTT broker before syncing entities.');

    await delay(undefined, SYNC_DELAY_MS);
    if (signal?.aborted) throw new DOMException('aborted', 'AbortError');

    state = {
      ...state,
      discoveredEntities: ENTITY_PREVIEW.map((e) => ({ ...e })),
      lastSyncedAt: new Date().toISOString(),
    };
    log('info', `Synced ${ENTITY_PREVIEW.length} entities.`);
    return withAbort(signal, { ...state, diagnostics: [...state.diagnostics] }, 0);
  },
};
