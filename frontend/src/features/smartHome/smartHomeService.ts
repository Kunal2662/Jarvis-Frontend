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
 * Scope note: this is the Command Center only (roadmap Phase 6, item 13) —
 * overview / rooms / devices / inline controls / scenes. Deep per-device
 * settings, pairing and diagnostics (item 14, Device Management) and
 * connector-specific configuration (item 15, Home Assistant + MQTT) are
 * separate, later steps and are intentionally NOT built here. This feature
 * also does not implement an autonomous scene engine — scenes are
 * pre-defined data the frontend displays and triggers, never authored,
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

export interface Device {
  id: string;
  name: string;
  roomId: string;
  type: DeviceType;
  capabilities: DeviceCapability[];
  state: DeviceState;
  availability: DeviceAvailability;
  updatedAt: string;
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
