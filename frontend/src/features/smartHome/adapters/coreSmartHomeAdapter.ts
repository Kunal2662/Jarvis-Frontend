import {
  CoreSmartHomeContractUnavailableError,
  type Device,
  type DeviceCommand,
  type DeviceCommandValue,
  type Room,
  type Scene,
  type SmartHomeService,
} from '../smartHomeService';

/**
 * JARVIS Core Smart Home adapter — INTENTIONALLY UNIMPLEMENTED.
 *
 * The real JARVIS Core Smart Home contract (M12 — rooms/areas, normalized
 * devices + capabilities, commands, scenes, realtime state, the Home
 * Assistant/MQTT connector boundary) is not yet available in a verified,
 * documented form. Per project rules we do NOT invent an endpoint. This
 * adapter is the plug point: once the Core Smart Home contract is verified,
 * implement each method here (map Core → Room/Device/Scene types already
 * defined in smartHomeService.ts), set `ready: true`, and select it via
 * `VITE_SMART_HOME_BACKEND=core`. No SmartHomePage/UI change is needed.
 *
 * See docs/CORE_SMART_HOME_CONTRACT_REQUIRED.md for exactly what must be
 * provided.
 */
function unavailable(): never {
  if (import.meta.env.DEV) {
    console.warn(new CoreSmartHomeContractUnavailableError().message);
  }
  throw new CoreSmartHomeContractUnavailableError();
}

export const coreSmartHomeService: SmartHomeService = {
  id: 'core',
  label: 'JARVIS Core (contract pending)',
  ready: false,

  async getRooms(): Promise<Room[]> {
    return unavailable();
  },
  async getRoom(): Promise<Room> {
    return unavailable();
  },
  async getDevices(): Promise<Device[]> {
    return unavailable();
  },
  async getDevice(): Promise<Device> {
    return unavailable();
  },
  async sendCommand(_deviceId: string, _command: DeviceCommand, _value?: DeviceCommandValue): Promise<Device> {
    return unavailable();
  },
  async getScenes(): Promise<Scene[]> {
    return unavailable();
  },
  async triggerScene(): Promise<Device[]> {
    return unavailable();
  },
  /**
   * Never invokes `callback` — there is no real Core event stream to
   * subscribe to yet. Returns a no-op unsubscribe rather than throwing, so a
   * page that unconditionally wires up the realtime seam on mount does not
   * need special-case handling for the not-ready Core adapter.
   */
  subscribeToDeviceState(_deviceId: string, _callback: (device: Device) => void): () => void {
    return () => {};
  },
};
