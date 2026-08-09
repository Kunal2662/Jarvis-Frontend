import {
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
  Shield,
  Sofa,
  Speaker,
  Sparkles,
  Thermometer,
  ToggleLeft,
  Trees,
  Fan as FanIcon,
  type LucideIcon,
} from 'lucide-react';
import type { DeviceAvailability, DeviceType, RoomIconKey, RoomStatus, SceneIconKey } from './smartHomeService';

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
