import {
  Battery,
  BatteryFull,
  BatteryLow,
  BatteryMedium,
  BatteryWarning,
  Bath,
  Bed,
  ChefHat,
  DoorOpen,
  Film,
  Gauge,
  House,
  Lightbulb,
  Lock,
  Moon,
  Plug,
  Radio,
  Router,
  Shield,
  SignalHigh,
  SignalLow,
  SignalMedium,
  SignalZero,
  Sofa,
  Speaker,
  Sparkles,
  Thermometer,
  ToggleLeft,
  Trees,
  Fan as FanIcon,
  type LucideIcon,
} from 'lucide-react';
import type {
  DeviceAvailability,
  DeviceCapability,
  DeviceConnectorType,
  DeviceType,
  RoomIconKey,
  RoomStatus,
  SceneIconKey,
} from './smartHomeService';

/** Shared, presentation-only formatting helpers for the Smart Home feature —
 *  mirrors automationFormat.ts / aiAppsFormat.ts. All icon mappings here are
 *  semantic (per-room-type / per-device-type / per-scene-type), never a
 *  vendor product icon. */

export function formatDateTime(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

const ROOM_ICON: Record<RoomIconKey, LucideIcon> = {
  'living-room': Sofa,
  bedroom: Bed,
  kitchen: ChefHat,
  bathroom: Bath,
  entrance: DoorOpen,
  outdoor: Trees,
  generic: House,
};

export function roomIcon(key?: RoomIconKey): LucideIcon {
  return ROOM_ICON[key ?? 'generic'];
}

const DEVICE_TYPE_ICON: Record<DeviceType, LucideIcon> = {
  Light: Lightbulb,
  Thermostat: Thermometer,
  Fan: FanIcon,
  Lock: Lock,
  Speaker: Speaker,
  Sensor: Gauge,
  Switch: ToggleLeft,
};

export function deviceTypeIcon(type: DeviceType): LucideIcon {
  return DEVICE_TYPE_ICON[type];
}

const SCENE_ICON: Record<SceneIconKey, LucideIcon> = {
  moon: Moon,
  film: Film,
  shield: Shield,
  generic: Sparkles,
};

export function sceneIcon(key?: SceneIconKey): LucideIcon {
  return SCENE_ICON[key ?? 'generic'];
}

export const ROOM_STATUS_LABEL: Record<RoomStatus, string> = {
  all_off: 'All off',
  some_on: 'Some on',
  all_on: 'All on',
};

export const ROOM_STATUS_BADGE_VARIANT: Record<RoomStatus, 'neutral' | 'accent' | 'success'> = {
  all_off: 'neutral',
  some_on: 'accent',
  all_on: 'success',
};

export const AVAILABILITY_LABEL: Record<DeviceAvailability, string> = {
  online: 'Online',
  offline: 'Offline',
  unavailable: 'Unavailable',
};

export const AVAILABILITY_BADGE_VARIANT: Record<DeviceAvailability, 'success' | 'neutral' | 'danger'> = {
  online: 'success',
  offline: 'neutral',
  unavailable: 'danger',
};

// ── Device Management (item 14) — additive formatting helpers ────────────
// Presentation-only, mirrors the rest of this file. Health/diagnostics
// fields are always shown as "Not reported" rather than fabricated when
// absent, and are always paired with an icon + text — never color alone.

export const CAPABILITY_LABEL: Record<DeviceCapability, string> = {
  power: 'Power',
  brightness: 'Brightness',
  temperature: 'Temperature',
  fan_speed: 'Fan speed',
  lock: 'Lock',
  media: 'Media',
  sensor: 'Sensor reading',
};

/** Sensible default capabilities to pre-select in the "Pair New Device" form
 *  when a device type is chosen — mirrors what the seeded devices of that
 *  type already have. The user can still toggle any capability; this is
 *  only a starting suggestion, never enforced. */
export const DEFAULT_CAPABILITIES_BY_TYPE: Record<DeviceType, DeviceCapability[]> = {
  Light: ['power', 'brightness'],
  Thermostat: ['temperature'],
  Fan: ['power', 'fan_speed'],
  Lock: ['lock'],
  Speaker: ['power', 'media'],
  Sensor: ['sensor'],
  Switch: ['power'],
};

export const CONNECTOR_LABEL: Record<DeviceConnectorType, string> = {
  home_assistant: 'Home Assistant',
  mqtt: 'MQTT',
  native: 'Native',
};

const CONNECTOR_ICON: Record<DeviceConnectorType, LucideIcon> = {
  home_assistant: Router,
  mqtt: Radio,
  native: Plug,
};

export function connectorIcon(type: DeviceConnectorType): LucideIcon {
  return CONNECTOR_ICON[type];
}

export function formatBattery(battery?: number): string {
  return typeof battery === 'number' ? `${battery}%` : 'Not reported';
}

export function batteryIcon(battery?: number): LucideIcon {
  if (typeof battery !== 'number') return Battery;
  if (battery <= 15) return BatteryWarning;
  if (battery <= 40) return BatteryLow;
  if (battery <= 75) return BatteryMedium;
  return BatteryFull;
}

export function formatSignal(signal?: number): string {
  return typeof signal === 'number' ? `${signal}%` : 'Not reported';
}

export function signalIcon(signal?: number): LucideIcon {
  if (typeof signal !== 'number') return SignalZero;
  if (signal <= 25) return SignalLow;
  if (signal <= 60) return SignalMedium;
  return SignalHigh;
}

export function formatFirmware(version?: string): string {
  return version && version.trim() ? version : 'Not reported';
}

export function formatLastSeen(iso?: string): string {
  return iso ? formatDateTime(iso) : 'Not reported';
}
