import type {
  ConnectorService,
  ConnectorSettingsInput,
  ConnectorState,
  DiscoveredEntity,
} from '../smartHomeIntegrationService';

/**
 * Frontend in-memory mock adapter for the Home Assistant connector (roadmap
 * item 15). All state + mutation logic lives HERE. Simulates realistic
 * network latency so loading/connecting states are exercised, and mutates
 * real in-memory state so the UI is fully interactive.
 *
 * No real Home Assistant instance is ever contacted anywhere in this file.
 * `connect()` never performs a real auth handshake — it validates the form
 * input is non-empty, discards the secret immediately, and records only a
 * display label. `syncEntities()` never discovers real entities — it
 * returns a small, fixed preview list.
 */

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

async function withAbort<T>(signal: AbortSignal | undefined, value: T, ms = 300): Promise<T> {
  const result = await delay(value, ms);
  if (signal?.aborted) throw new DOMException('aborted', 'AbortError');
  return result;
}

const CONNECT_DELAY_MS = 1200;
const SYNC_DELAY_MS = 1500;

let diagSeq = 0;
function nextDiagId(): string {
  diagSeq += 1;
  return `ha-diag-${diagSeq}`;
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
 *  discovered from a real Home Assistant instance. */
const ENTITY_PREVIEW: DiscoveredEntity[] = [
  { id: 'ha-preview-1', name: 'Garage Light', roomName: 'Garage', type: 'Light', capabilities: ['power', 'brightness'] },
  { id: 'ha-preview-2', name: 'Hallway Motion Sensor', roomName: 'Hallway', type: 'Sensor', capabilities: ['sensor'] },
  { id: 'ha-preview-3', name: 'Office Thermostat', roomName: 'Office', type: 'Thermostat', capabilities: ['temperature'] },
];

export const mockHomeAssistantConnectorService: ConnectorService = {
  id: 'mock',
  label: 'Frontend mock (Home Assistant)',
  ready: true,
  connectorName: 'Home Assistant',

  async getState(signal?: AbortSignal): Promise<ConnectorState> {
    return withAbort(signal, { ...state, diagnostics: [...state.diagnostics] });
  },

  async connect(input: ConnectorSettingsInput, signal?: AbortSignal): Promise<ConnectorState> {
    const endpoint = input.endpoint.trim();
    if (!endpoint) throw new Error('Instance URL is required.');
    if (!input.secret.trim()) throw new Error('Long-lived access token is required.');
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
    log('info', `Connected to ${endpoint}.`);
    return withAbort(signal, { ...state, diagnostics: [...state.diagnostics] }, 0);
  },

  async disconnect(signal?: AbortSignal): Promise<ConnectorState> {
    if (state.status !== 'connected' && state.status !== 'error') {
      throw new Error('Home Assistant is not connected.');
    }
    state = { ...state, status: 'disconnected', discoveredEntities: [] };
    log('info', 'Disconnected.');
    return withAbort(signal, { ...state, diagnostics: [...state.diagnostics] });
  },

  async reconnect(signal?: AbortSignal): Promise<ConnectorState> {
    if (state.status !== 'disconnected' && state.status !== 'error') {
      throw new Error('Home Assistant is not in a reconnectable state.');
    }
    state = { ...state, status: 'connecting' };
    await delay(undefined, CONNECT_DELAY_MS);
    if (signal?.aborted) throw new DOMException('aborted', 'AbortError');

    state = { ...state, status: 'connected' };
    log('info', 'Reconnected.');
    return withAbort(signal, { ...state, diagnostics: [...state.diagnostics] }, 0);
  },

  async syncEntities(signal?: AbortSignal): Promise<ConnectorState> {
    if (state.status !== 'connected') throw new Error('Connect to Home Assistant before syncing entities.');

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
