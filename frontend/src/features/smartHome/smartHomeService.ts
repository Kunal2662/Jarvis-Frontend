/**
 * Smart Home Command Center data seam — the transport-agnostic contract the
 * Smart Home UI depends on.
 *
 *   SmartHomePage → room/device/scene state+presentation → SmartHomeService → adapter → (mock | JARVIS Core)
 *
 * Mirrors the Automations/AI Apps/Notes/Tasks/Calendar/Files seams. The UI
 * never talks to a vendor connector (Home Assistant, MQTT, etc.) directly —
 * it only knows this interface, expressed entirely in normalized,
 * vendor-neutral entities (Room, Device, Capability, Command, Scene) per
 * docs/JARVIS_FRONTEND_ARCHITECTURE.md's "do not implement a second
 * smart-home protocol engine" rule. There is no Philips Hue/Tuya/Shelly UI
 * anywhere in this feature, and no raw Home Assistant entity id is ever
 * surfaced as if it were native. Swapping the in-memory mock for a real
 * JARVIS Core Smart Home API later is a matter of implementing a new adapter
 * and selecting it here — no UI changes required. We do NOT invent a Core
 * Smart Home/Home Assistant/MQTT endpoint; see
 * docs/CORE_SMART_HOME_CONTRACT_REQUIRED.md.
 *
 * Scope note: this is the Command Center (roadmap Phase 6, item 13) —
 * overview / rooms / devices / inline controls / scenes — PLUS Device
 * Management (item 14) — per-device rename/room-reassignment, pairing new
 * simulated devices, and read-only health/diagnostics/connector metadata —
 * added additively on this same seam (`DeviceManagementPage.tsx`). Connector
 * configuration (item 15, Home Assistant + MQTT) remains a separate, later
 * step and is intentionally NOT built here — `connector` below is read-only
 * display metadata the frontend never uses to call a connector directly.
 * This feature also does not implement an autonomous scene engine — scenes
 * are pre-defined data the frontend displays and triggers, never authored,
 * edited, or computed client-side.
 */

/** Semantic, vendor-neutral icon hint — mapped to a lucide icon in the UI
 *  layer only. Never a vendor product/room-brand name. */
export type RoomIconKey = 'living-room' | 'bedroom' | 'kitchen' | 'bathroom' | 'entrance' | 'outdoor' | 'generic';

/** A simple, presentational aggregate of a room's power-capable devices —
 *  not a real rules/aggregation engine. */
export type RoomStatus = 'all_off' | 'some_on' | 'all_on';

export interface Room {
  id: string;
  name: string;
  icon?: RoomIconKey;
  /** Derived by the adapter from current device state on every call — never stale. */
  deviceCount: number;
  status: RoomStatus;
}

/** Normalized, vendor-neutral capabilities. Never a vendor-specific concept
 *  (no Hue "scenes", no Tuya "DPs", no raw Home Assistant entity types). */
export type DeviceCapability = 'power' | 'brightness' | 'temperature' | 'fan_speed' | 'lock' | 'media' | 'sensor';

/** Human-facing device kind — a normalized label, never a vendor product name. */
export type DeviceType = 'Light' | 'Thermostat' | 'Fan' | 'Lock' | 'Speaker' | 'Sensor' | 'Switch';

export type FanSpeed = 'low' | 'medium' | 'high';

export interface DeviceState {
  power?: boolean;
  /** 0-100. */
  brightness?: number;
  /** Target temperature, degrees Celsius. */
  temperature?: number;
  fanSpeed?: FanSpeed;
  locked?: boolean;
  /** Read-only sensor readout, e.g. { label: 'Temperature', value: '21.5°C' }. */
  sensorValue?: { label: string; value: string };
}

export type DeviceAvailability = 'online' | 'offline' | 'unavailable';

/** Which mock connector "owns" a device — metadata-only, for display in
 *  Device Management. Never a real integration: the frontend never calls a
 *  connector directly (see docs/CORE_SMART_HOME_CONTRACT_REQUIRED.md), and
 *  there is no connector configuration UI here (that is roadmap item 15). */
export type DeviceConnectorType = 'home_assistant' | 'mqtt' | 'native';

export interface DeviceConnector {
  type: DeviceConnectorType;
  /** Opaque id of the device within that connector — display-only, never
   *  used by the frontend to address the connector. */
  externalId?: string;
}

export interface Device {
  id: string;
  name: string;
  roomId: string;
  type: DeviceType;
  capabilities: DeviceCapability[];
  state: DeviceState;
  availability: DeviceAvailability;
  updatedAt: string;
  /**
   * Health/diagnostics/connector metadata for Device Management (roadmap
   * item 14). All optional and additive to the Command Center's (item 13)
   * `Device` shape — never fabricated when unknown; absent means "not
   * reported", rendered honestly as such rather than guessed.
   */
  /** 0-100. Only meaningful for battery-powered device types (e.g. Lock,
   *  Sensor) — omitted for mains-powered devices. */
  battery?: number;
  /** 0-100 relative signal strength, connector-agnostic. */
  signalStrength?: number;
  firmwareVersion?: string;
  /** ISO timestamp of this device's last heartbeat/check-in — distinct from
   *  `updatedAt`, which only tracks state changes. */
  lastSeenAt?: string;
  connector?: DeviceConnector;
}

/** Rename and/or room-reassignment input for `updateDevice` — configuration,
 *  never a state/command change (that stays on `sendCommand`). */
export interface UpdateDeviceInput {
  name?: string;
  roomId?: string;
}

/** Input for `pairDevice` — the Device Management "Pair New Device" flow. */
export interface PairDeviceInput {
  name: string;
  roomId: string;
  type: DeviceType;
  capabilities: DeviceCapability[];
}

export interface SceneAction {
  deviceId: string;
  /** Human-readable, display-only summary, e.g. "Living Room Light turned
   *  off" — never an executable DSL. The frontend does not run scene logic
   *  beyond applying the corresponding mock state change. */
  summary: string;
}

/** Semantic, vendor-neutral icon hint for a scene card. */
export type SceneIconKey = 'moon' | 'film' | 'shield' | 'generic';

export interface Scene {
  id: string;
  name: string;
  description: string;
  icon?: SceneIconKey;
  actions: SceneAction[];
}

export type DeviceCommand =
  | 'TURN_ON'
  | 'TURN_OFF'
  | 'SET_BRIGHTNESS'
  | 'SET_TEMPERATURE'
  | 'SET_FAN_SPEED'
  | 'LOCK'
  | 'UNLOCK';

export type DeviceCommandValue = number | FanSpeed;

/**
 * The contract every Smart Home backend adapter must satisfy.
 */
export interface SmartHomeService {
  readonly id: 'mock' | 'core';
  readonly label: string;
  /** True once this adapter is wired to a real, verified Core contract. */
  readonly ready: boolean;
  getRooms(signal?: AbortSignal): Promise<Room[]>;
  getRoom(id: string, signal?: AbortSignal): Promise<Room>;
  /** All devices, or only those in `roomId` when provided. */
  getDevices(roomId?: string, signal?: AbortSignal): Promise<Device[]>;
  getDevice(id: string, signal?: AbortSignal): Promise<Device>;
  sendCommand(
    deviceId: string,
    command: DeviceCommand,
    value?: DeviceCommandValue,
    signal?: AbortSignal,
  ): Promise<Device>;
  getScenes(signal?: AbortSignal): Promise<Scene[]>;
  /** Applies a scene's pre-defined mock state changes and returns the
   *  devices that actually changed (never a fake success list). */
  triggerScene(id: string, signal?: AbortSignal): Promise<Device[]>;
  /**
   * Device Management (roadmap item 14): rename and/or reassign a device to
   * a different room. Configuration only — never touches `state`/
   * `availability`, which stay owned by `sendCommand`.
   */
  updateDevice(id: string, input: UpdateDeviceInput, signal?: AbortSignal): Promise<Device>;
  /**
   * Device Management (roadmap item 14): unpair/remove a device permanently.
   */
  removeDevice(id: string, signal?: AbortSignal): Promise<void>;
  /**
   * Device Management (roadmap item 14): pair/onboard a new simulated
   * device. A pure UI-feel simulation — no real Bluetooth/Zigbee/WiFi/Home
   * Assistant/MQTT discovery protocol runs anywhere in this frontend. The
   * mock adapter simulates a brief "discovering device…" delay noticeably
   * longer than its normal ~300ms latency before the device is actually
   * added to the in-memory store.
   */
  pairDevice(input: PairDeviceInput, signal?: AbortSignal): Promise<Device>;
  /**
   * Optional light realtime seam. Registers `callback` for state updates to
   * one device and returns an unsubscribe function. The mock adapter fires
   * this whenever a device's state genuinely changes (via `sendCommand` /
   * `triggerScene`), and additionally simulates occasional drift for ONE
   * seeded sensor device via a single interval, to prove the seam is real
   * rather than decorative. This is not a general per-device pub/sub system
   * — it is the lightest honest version of a realtime seam proportional to
   * this step.
   */
  subscribeToDeviceState(deviceId: string, callback: (device: Device) => void): () => void;
}

/** Thrown when a not-yet-implemented backend adapter is invoked. */
export class CoreSmartHomeContractUnavailableError extends Error {
  constructor(message = 'JARVIS Core Smart Home contract is not available yet.') {
    super(message);
    this.name = 'CoreSmartHomeContractUnavailableError';
  }
}

import { mockSmartHomeService } from './adapters/mockSmartHomeAdapter';
import { coreSmartHomeService } from './adapters/coreSmartHomeAdapter';

/**
 * Which backend feeds the Smart Home Command Center. Defaults to the
 * frontend in-memory mock (Core APIs are not required for this step). Set
 * `VITE_SMART_HOME_BACKEND=core` once Claude Code has implemented + verified
 * a real Core Smart Home adapter.
 */
const SMART_HOME_BACKEND = (import.meta.env.VITE_SMART_HOME_BACKEND as string | undefined) ?? 'mock';

export function getSmartHomeService(): SmartHomeService {
  return SMART_HOME_BACKEND === 'core' ? coreSmartHomeService : mockSmartHomeService;
}
