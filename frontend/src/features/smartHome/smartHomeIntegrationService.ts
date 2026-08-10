import type { DeviceCapability, DeviceType } from './smartHomeService';

/**
 * Home Assistant + MQTT integration data seam (roadmap item 15) — the
 * transport-agnostic contract the Integrations UI depends on.
 *
 *   IntegrationsPage → connector state+presentation → ConnectorService → adapter → (mock | JARVIS Core)
 *
 * Mirrors `smartHomeService.ts`'s seam pattern, but scoped to *connector*
 * status/configuration/diagnostics — never device control. Two independent
 * instances exist, one per connector (`getHomeAssistantConnectorService()`,
 * `getMqttConnectorService()`), each selecting mock vs. Core adapters
 * independently, since Core may ship one connector's real contract before
 * the other's.
 *
 * Per `docs/CORE_SMART_HOME_CONTRACT_REQUIRED.md`'s scoping note for item 15
 * ("the frontend never talks to a connector directly in any adapter, mock or
 * future-Core — only Core would, behind this seam"), and
 * `JARVIS_FRONTEND_ARCHITECTURE.md`'s "do not implement a second integration
 * framework" rule: no adapter here — mock or Core stub — ever performs a
 * real HTTP/WebSocket call to a Home Assistant instance or MQTT broker. We
 * do NOT invent a Core Home Assistant/MQTT endpoint; see
 * docs/CORE_HOME_ASSISTANT_MQTT_CONTRACT_REQUIRED.md.
 *
 * Scope note: this is connector status, configuration, and diagnostics
 * only — connecting/disconnecting, a masked credential state, and a
 * discovered-entities *preview*. It never adds synced entities to the
 * Smart Home Command Center's live device list (`smartHomeService.ts` /
 * `mockSmartHomeAdapter.ts`'s seeded `devices`) — that would mean this step
 * silently mutating Steps 13-14's established dataset, and a real Core
 * integration is the only thing authorized to actually add
 * live-controllable devices. Device *control* stays entirely on
 * `SmartHomeService.sendCommand` — this seam never adds a second command
 * path.
 */

export type ConnectorType = 'home_assistant' | 'mqtt';

/** Never `'connected'` unless a `connect()` call (mock or real) actually
 *  succeeded — this UI never claims a live connection that doesn't exist. */
export type ConnectorStatus = 'not_configured' | 'disconnected' | 'connecting' | 'connected' | 'error';

/** Abstract-only. Never the raw credential value — see the module doc and
 *  docs/CORE_HOME_ASSISTANT_MQTT_CONTRACT_REQUIRED.md. */
export type CredentialState = 'not_configured' | 'configured' | 'invalid' | 'unavailable';

export interface ConnectorDiagnosticEntry {
  id: string;
  /** ISO timestamp. */
  timestamp: string;
  level: 'info' | 'warning' | 'error';
  message: string;
}

/** A single entity a connector *would* expose — a preview, normalized into
 *  this frontend's existing vocabulary, never a raw Home Assistant entity id
 *  or MQTT topic/payload shape. Never merged into the live Smart Home device
 *  list (see module doc). */
export interface DiscoveredEntity {
  id: string;
  name: string;
  /** The room this entity would map into, if the connector reports one. */
  roomName?: string;
  type: DeviceType;
  capabilities: DeviceCapability[];
}

/** Cosmetic, connector-owner-entered display info only — e.g. an instance
 *  URL label or a broker host:port label. Never actually dialed by this
 *  frontend. */
export interface ConnectorInstanceInfo {
  label: string;
  detail?: string;
}

export interface ConnectorState {
  status: ConnectorStatus;
  credentialState: CredentialState;
  instance?: ConnectorInstanceInfo;
  /** ISO timestamp of the last successful `syncEntities()` call. */
  lastSyncedAt?: string;
  discoveredEntities: DiscoveredEntity[];
  /** Newest first, capped to a reasonable length by the adapter. */
  diagnostics: ConnectorDiagnosticEntry[];
}

/** What the mock "connect" form collects. Display-only in the mock — the
 *  `secret` is validated as non-empty and then immediately discarded, never
 *  stored or echoed back. A real adapter would need Core to define how this
 *  is actually submitted without the frontend holding it any longer than
 *  the single request (open question in the contract doc). */
export interface ConnectorSettingsInput {
  /** HA: instance URL label. MQTT: broker host[:port] label. */
  endpoint: string;
  /** HA: long-lived access token. MQTT: broker password. Never persisted. */
  secret: string;
}

/** The contract every connector backend adapter must satisfy — one instance
 *  per connector type (Home Assistant, MQTT). */
export interface ConnectorService {
  readonly id: 'mock' | 'core';
  readonly label: string;
  /** True once this adapter is wired to a real, verified Core contract. */
  readonly ready: boolean;
  /** Human-facing connector name, e.g. "Home Assistant" / "MQTT". */
  readonly connectorName: string;
  getState(signal?: AbortSignal): Promise<ConnectorState>;
  /** Configures + connects in one step, mirroring how a real onboarding flow
   *  would feel (enter details, then it connects) — mock only, never a real
   *  auth handshake. */
  connect(input: ConnectorSettingsInput, signal?: AbortSignal): Promise<ConnectorState>;
  disconnect(signal?: AbortSignal): Promise<ConnectorState>;
  /** Requires the connector to currently be `disconnected` or `error`. */
  reconnect(signal?: AbortSignal): Promise<ConnectorState>;
  /** Requires the connector to currently be `connected`. Refreshes
   *  `discoveredEntities` (a preview — see module doc) and `lastSyncedAt`. */
  syncEntities(signal?: AbortSignal): Promise<ConnectorState>;
}

/** Thrown when a not-yet-implemented Core connector adapter is invoked. */
export class CoreConnectorContractUnavailableError extends Error {
  constructor(connectorName: string) {
    super(`JARVIS Core ${connectorName} contract is not available yet.`);
    this.name = 'CoreConnectorContractUnavailableError';
  }
}

import { mockHomeAssistantConnectorService } from './adapters/mockHomeAssistantAdapter';
import { mockMqttConnectorService } from './adapters/mockMqttAdapter';
import { coreHomeAssistantConnectorService } from './adapters/coreHomeAssistantAdapter';
import { coreMqttConnectorService } from './adapters/coreMqttAdapter';

/** Which backend feeds the Home Assistant connector. Defaults to the
 *  frontend in-memory mock. Set `VITE_HOME_ASSISTANT_BACKEND=core` once
 *  Claude Code has implemented + verified a real Core contract. */
const HOME_ASSISTANT_BACKEND = (import.meta.env.VITE_HOME_ASSISTANT_BACKEND as string | undefined) ?? 'mock';

/** Which backend feeds the MQTT connector — independent of the Home
 *  Assistant selection above, since Core may ship one before the other. Set
 *  `VITE_MQTT_BACKEND=core` once verified. */
const MQTT_BACKEND = (import.meta.env.VITE_MQTT_BACKEND as string | undefined) ?? 'mock';

export function getHomeAssistantConnectorService(): ConnectorService {
  return HOME_ASSISTANT_BACKEND === 'core' ? coreHomeAssistantConnectorService : mockHomeAssistantConnectorService;
}

export function getMqttConnectorService(): ConnectorService {
  return MQTT_BACKEND === 'core' ? coreMqttConnectorService : mockMqttConnectorService;
}
