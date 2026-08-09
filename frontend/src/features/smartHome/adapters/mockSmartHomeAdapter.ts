import type {
  Device,
  DeviceCapability,
  DeviceCommand,
  DeviceCommandValue,
  Room,
  RoomStatus,
  Scene,
  SmartHomeService,
} from '../smartHomeService';

/**
 * Frontend in-memory mock adapter for the Smart Home Command Center. All
 * seed data + mutation logic lives HERE, separated from presentation.
 * Simulates realistic network latency so loading states are exercised, and
 * mutates real in-memory state so the UI is fully interactive (not static).
 * A future Core adapter can replace this wholesale — no UI change required.
 *
 * These are simulated devices only. No real hardware, Home Assistant
 * instance, or MQTT broker is contacted anywhere in this file.
 */

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

async function withAbort<T>(signal: AbortSignal | undefined, value: T, ms = 300): Promise<T> {
  const result = await delay(value, ms);
  if (signal?.aborted) throw new DOMException('aborted', 'AbortError');
  return result;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

// ── Seed data ────────────────────────────────────────────────────────────

const ROOM_SEEDS: Array<Omit<Room, 'deviceCount' | 'status'>> = [
  { id: 'room-living', name: 'Living Room', icon: 'living-room' },
  { id: 'room-bedroom', name: 'Bedroom', icon: 'bedroom' },
  { id: 'room-kitchen', name: 'Kitchen', icon: 'kitchen' },
  { id: 'room-bathroom', name: 'Bathroom', icon: 'bathroom' },
  { id: 'room-entrance', name: 'Entrance', icon: 'entrance' },
  { id: 'room-outdoor', name: 'Outdoor', icon: 'outdoor' },
];

/** The one seeded device that demonstrates simulated periodic drift via
 *  `subscribeToDeviceState` (a bedroom temperature sensor). */
const DRIFT_DEVICE_ID = 'dev-bedroom-sensor';
const DRIFT_INTERVAL_MS = 4000;

let devices: Device[] = [
  {
    id: 'dev-living-light',
    name: 'Living Room Light',
    roomId: 'room-living',
    type: 'Light',
    capabilities: ['power', 'brightness'],
    state: { power: true, brightness: 70 },
    availability: 'online',
    updatedAt: '2026-08-08T21:00:00-04:00',
  },
  {
    id: 'dev-living-thermostat',
    name: 'Living Room Thermostat',
    roomId: 'room-living',
    type: 'Thermostat',
    capabilities: ['temperature'],
    state: { temperature: 21 },
    availability: 'online',
    updatedAt: '2026-08-08T21:00:00-04:00',
  },
  {
    id: 'dev-living-speaker',
    name: 'Living Room Speaker',
    roomId: 'room-living',
    type: 'Speaker',
    capabilities: ['power', 'media'],
    state: { power: false },
    availability: 'online',
    updatedAt: '2026-08-08T18:30:00-04:00',
  },
  {
    id: 'dev-bedroom-light',
    name: 'Bedroom Light',
    roomId: 'room-bedroom',
    type: 'Light',
    capabilities: ['power', 'brightness'],
    state: { power: true, brightness: 35 },
    availability: 'online',
    updatedAt: '2026-08-08T22:00:00-04:00',
  },
  {
    id: 'dev-bedroom-fan',
    name: 'Bedroom Fan',
    roomId: 'room-bedroom',
    type: 'Fan',
    capabilities: ['power', 'fan_speed'],
    state: { power: true, fanSpeed: 'medium' },
    availability: 'online',
    updatedAt: '2026-08-08T22:00:00-04:00',
  },
  {
    id: DRIFT_DEVICE_ID,
    name: 'Bedroom Temperature Sensor',
    roomId: 'room-bedroom',
    type: 'Sensor',
    capabilities: ['sensor'],
    state: { sensorValue: { label: 'Temperature', value: '21.5°C' } },
    availability: 'online',
    updatedAt: '2026-08-08T22:00:00-04:00',
  },
  {
    id: 'dev-kitchen-light',
    name: 'Kitchen Light',
    roomId: 'room-kitchen',
    type: 'Light',
    capabilities: ['power'],
    state: { power: true },
    availability: 'online',
    updatedAt: '2026-08-08T19:00:00-04:00',
  },
  {
    id: 'dev-kitchen-plug',
    name: 'Kitchen Smart Plug',
    roomId: 'room-kitchen',
    type: 'Switch',
    capabilities: ['power'],
    state: { power: false },
    availability: 'online',
    updatedAt: '2026-08-08T09:00:00-04:00',
  },
  {
    id: 'dev-bathroom-light',
    name: 'Bathroom Light',
    roomId: 'room-bathroom',
    type: 'Light',
    capabilities: ['power'],
    state: { power: false },
    // Exercises the 'offline' availability state end-to-end.
    availability: 'offline',
    updatedAt: '2026-08-07T08:00:00-04:00',
  },
  {
    id: 'dev-entrance-lock',
    name: 'Entrance Door Lock',
    roomId: 'room-entrance',
    type: 'Lock',
    capabilities: ['lock'],
    state: { locked: true },
    availability: 'online',
    updatedAt: '2026-08-08T22:15:00-04:00',
  },
  {
    id: 'dev-entrance-light',
    name: 'Entrance Light',
    roomId: 'room-entrance',
    type: 'Light',
    capabilities: ['power', 'brightness'],
    state: { power: false, brightness: 0 },
    availability: 'online',
    updatedAt: '2026-08-08T22:15:00-04:00',
  },
  {
    id: 'dev-outdoor-light',
    name: 'Outdoor Light',
    roomId: 'room-outdoor',
    type: 'Light',
    capabilities: ['power'],
    state: { power: true },
    availability: 'online',
    updatedAt: '2026-08-08T20:00:00-04:00',
  },
  {
    id: 'dev-outdoor-sensor',
    name: 'Outdoor Motion Sensor',
    roomId: 'room-outdoor',
    type: 'Sensor',
    capabilities: ['sensor'],
    state: { sensorValue: { label: 'Motion', value: 'Clear' } },
    // Exercises the 'unavailable' availability state end-to-end.
    availability: 'unavailable',
    updatedAt: '2026-08-06T12:00:00-04:00',
  },
];

interface SceneEffect {
  deviceId: string;
  command: DeviceCommand;
  value?: DeviceCommandValue;
}

interface SceneSeed extends Scene {
  /** Internal-only mapping from each display action to the actual mock
   *  state change it performs. Not part of the public `Scene` type — Core
   *  would own real scene execution semantics; the frontend never
   *  authors/edits/computes scene logic, it only replays this seed data. */
  effects: SceneEffect[];
}

const scenes: SceneSeed[] = [
  {
    id: 'scene-good-night',
    name: 'Good Night',
    description: 'Dims the bedroom light, turns off the living room, and locks the entrance door.',
    icon: 'moon',
    actions: [
      { deviceId: 'dev-bedroom-light', summary: 'Bedroom Light dimmed to 10%' },
      { deviceId: 'dev-living-light', summary: 'Living Room Light turned off' },
      { deviceId: 'dev-living-speaker', summary: 'Living Room Speaker turned off' },
      { deviceId: 'dev-entrance-lock', summary: 'Entrance Door Lock locked' },
    ],
    effects: [
      { deviceId: 'dev-bedroom-light', command: 'SET_BRIGHTNESS', value: 10 },
      { deviceId: 'dev-living-light', command: 'TURN_OFF' },
      { deviceId: 'dev-living-speaker', command: 'TURN_OFF' },
      { deviceId: 'dev-entrance-lock', command: 'LOCK' },
    ],
  },
  {
    id: 'scene-movie-time',
    name: 'Movie Time',
    description: 'Dims the living room lights and turns on the speaker for movie night.',
    icon: 'film',
    actions: [
      { deviceId: 'dev-living-light', summary: 'Living Room Light dimmed to 15%' },
      { deviceId: 'dev-living-speaker', summary: 'Living Room Speaker turned on' },
      { deviceId: 'dev-kitchen-light', summary: 'Kitchen Light turned off' },
    ],
    effects: [
      { deviceId: 'dev-living-light', command: 'SET_BRIGHTNESS', value: 15 },
      { deviceId: 'dev-living-speaker', command: 'TURN_ON' },
      { deviceId: 'dev-kitchen-light', command: 'TURN_OFF' },
    ],
  },
  {
    id: 'scene-away-mode',
    name: 'Away Mode',
    description: 'Turns off indoor lights, locks the entrance, and lowers the thermostat for energy savings.',
    icon: 'shield',
    actions: [
      { deviceId: 'dev-living-light', summary: 'Living Room Light turned off' },
      { deviceId: 'dev-kitchen-light', summary: 'Kitchen Light turned off' },
      { deviceId: 'dev-entrance-lock', summary: 'Entrance Door Lock locked' },
      { deviceId: 'dev-living-thermostat', summary: 'Living Room Thermostat set to 16°C' },
    ],
    effects: [
      { deviceId: 'dev-living-light', command: 'TURN_OFF' },
      { deviceId: 'dev-kitchen-light', command: 'TURN_OFF' },
      { deviceId: 'dev-entrance-lock', command: 'LOCK' },
      { deviceId: 'dev-living-thermostat', command: 'SET_TEMPERATURE', value: 16 },
    ],
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────

function requireDevice(id: string): Device {
  const found = devices.find((d) => d.id === id);
  if (!found) throw new Error(`Device "${id}" was not found.`);
  return found;
}

function requireScene(id: string): SceneSeed {
  const found = scenes.find((s) => s.id === id);
  if (!found) throw new Error(`Scene "${id}" was not found.`);
  return found;
}

function computeRoomStatus(roomDevices: Device[]): RoomStatus {
  const powerDevices = roomDevices.filter((d) => d.capabilities.includes('power'));
  if (powerDevices.length === 0) return 'all_off';
  const onCount = powerDevices.filter((d) => d.state.power === true).length;
  if (onCount === 0) return 'all_off';
  if (onCount === powerDevices.length) return 'all_on';
  return 'some_on';
}

function roomFromSeed(seed: (typeof ROOM_SEEDS)[number]): Room {
  const roomDevices = devices.filter((d) => d.roomId === seed.id);
  return { ...seed, deviceCount: roomDevices.length, status: computeRoomStatus(roomDevices) };
}

function requireCapability(device: Device, capability: DeviceCapability): void {
  if (!device.capabilities.includes(capability)) {
    throw new Error(`"${device.name}" does not support ${capability}.`);
  }
}

function requireOnline(device: Device): void {
  if (device.availability !== 'online') {
    throw new Error(`Cannot send a command to "${device.name}" — device is ${device.availability}.`);
  }
}

function applyCommand(device: Device, command: DeviceCommand, value?: DeviceCommandValue): Device {
  const next: Device = { ...device, state: { ...device.state }, updatedAt: new Date().toISOString() };
  switch (command) {
    case 'TURN_ON':
      requireCapability(device, 'power');
      next.state.power = true;
      break;
    case 'TURN_OFF':
      requireCapability(device, 'power');
      next.state.power = false;
      break;
    case 'SET_BRIGHTNESS': {
      requireCapability(device, 'brightness');
      const v = Number(value);
      if (!Number.isFinite(v)) throw new Error('SET_BRIGHTNESS requires a numeric value.');
      next.state.brightness = Math.min(100, Math.max(0, Math.round(v)));
      break;
    }
    case 'SET_TEMPERATURE': {
      requireCapability(device, 'temperature');
      const v = Number(value);
      if (!Number.isFinite(v)) throw new Error('SET_TEMPERATURE requires a numeric value.');
      next.state.temperature = Math.min(32, Math.max(10, Math.round(v)));
      break;
    }
    case 'SET_FAN_SPEED':
      requireCapability(device, 'fan_speed');
      if (value !== 'low' && value !== 'medium' && value !== 'high') {
        throw new Error('SET_FAN_SPEED requires "low", "medium", or "high".');
      }
      next.state.fanSpeed = value;
      break;
    case 'LOCK':
      requireCapability(device, 'lock');
      next.state.locked = true;
      break;
    case 'UNLOCK':
      requireCapability(device, 'lock');
      next.state.locked = false;
      break;
    default: {
      const _exhaustive: never = command;
      throw new Error(`Unknown command "${_exhaustive as string}".`);
    }
  }
  return next;
}

// ── Realtime seam (subscribe/notify) ────────────────────────────────────
// A small, honest pub/sub keyed by device id: subscribers are notified
// whenever that device's state genuinely changes via sendCommand/
// triggerScene. Exactly ONE additional setInterval exists in this whole
// adapter — it simulates periodic drift for the single designated sensor
// device above, and only runs while at least one subscriber is listening
// for it. This proves the seam is real without building a full per-device
// polling/pub-sub system.

const subscribers = new Map<string, Set<(device: Device) => void>>();
let driftInterval: ReturnType<typeof setInterval> | null = null;

function notify(deviceId: string, device: Device): void {
  const subs = subscribers.get(deviceId);
  if (!subs || subs.size === 0) return;
  subs.forEach((cb) => cb(clone(device)));
}

function driftTick(): void {
  const device = devices.find((d) => d.id === DRIFT_DEVICE_ID);
  if (!device) return;
  const currentText = device.state.sensorValue?.value ?? '21.5°C';
  const current = Number.parseFloat(currentText);
  const base = Number.isFinite(current) ? current : 21.5;
  const drifted = Math.round((base + (Math.random() * 1 - 0.5)) * 10) / 10;
  const clamped = Math.min(26, Math.max(18, drifted));
  const updated: Device = {
    ...device,
    state: { ...device.state, sensorValue: { label: 'Temperature', value: `${clamped.toFixed(1)}°C` } },
    updatedAt: new Date().toISOString(),
  };
  devices = devices.map((d) => (d.id === DRIFT_DEVICE_ID ? updated : d));
  notify(DRIFT_DEVICE_ID, updated);
}

function ensureDriftInterval(): void {
  if (driftInterval) return;
  driftInterval = setInterval(driftTick, DRIFT_INTERVAL_MS);
}

function maybeStopDriftInterval(): void {
  if (driftInterval && !subscribers.get(DRIFT_DEVICE_ID)?.size) {
    clearInterval(driftInterval);
    driftInterval = null;
  }
}

// ── Service ──────────────────────────────────────────────────────────────

export const mockSmartHomeService: SmartHomeService = {
  id: 'mock',
  label: 'Frontend mock (simulated devices)',
  ready: true,

  async getRooms(signal?: AbortSignal): Promise<Room[]> {
    return withAbort(signal, ROOM_SEEDS.map(roomFromSeed));
  },

  async getRoom(id: string, signal?: AbortSignal): Promise<Room> {
    const seed = ROOM_SEEDS.find((r) => r.id === id);
    if (!seed) throw new Error(`Room "${id}" was not found.`);
    return withAbort(signal, roomFromSeed(seed), 200);
  },

  async getDevices(roomId?: string, signal?: AbortSignal): Promise<Device[]> {
    const list = roomId ? devices.filter((d) => d.roomId === roomId) : devices;
    return withAbort(signal, list.map(clone));
  },

  async getDevice(id: string, signal?: AbortSignal): Promise<Device> {
    const device = requireDevice(id);
    return withAbort(signal, clone(device), 200);
  },

  async sendCommand(
    deviceId: string,
    command: DeviceCommand,
    value?: DeviceCommandValue,
    signal?: AbortSignal,
  ): Promise<Device> {
    const device = requireDevice(deviceId);
    requireOnline(device);
    const updated = applyCommand(device, command, value);
    devices = devices.map((d) => (d.id === deviceId ? updated : d));
    notify(deviceId, updated);
    return withAbort(signal, clone(updated), 300);
  },

  async getScenes(signal?: AbortSignal): Promise<Scene[]> {
    const publicScenes: Scene[] = scenes.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      icon: s.icon,
      actions: s.actions.map((a) => ({ ...a })),
    }));
    return withAbort(signal, publicScenes);
  },

  async triggerScene(id: string, signal?: AbortSignal): Promise<Device[]> {
    const scene = requireScene(id);
    const changed: Device[] = [];
    for (const effect of scene.effects) {
      const device = devices.find((d) => d.id === effect.deviceId);
      // A device that no longer exists or is not online is skipped rather
      // than faked — the returned list only ever contains devices that
      // actually changed state.
      if (!device || device.availability !== 'online') continue;
      const updated = applyCommand(device, effect.command, effect.value);
      devices = devices.map((d) => (d.id === device.id ? updated : d));
      notify(device.id, updated);
      changed.push(updated);
    }
    return withAbort(signal, changed.map(clone), 400);
  },

  subscribeToDeviceState(deviceId: string, callback: (device: Device) => void): () => void {
    let subs = subscribers.get(deviceId);
    if (!subs) {
      subs = new Set();
      subscribers.set(deviceId, subs);
    }
    subs.add(callback);
    if (deviceId === DRIFT_DEVICE_ID) ensureDriftInterval();

    return () => {
      subs?.delete(callback);
      if (deviceId === DRIFT_DEVICE_ID) maybeStopDriftInterval();
    };
  },
};
