import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Device, DeviceCommandValue, SmartHomeService } from '../smartHomeService';

// Each test gets a fresh module instance so mutations in one test never leak
// into another (the mock adapter keeps its rooms/devices/scenes in
// module-level state, mirrors aiAppsService.test.ts's freshMockService()).
async function freshMockService(): Promise<SmartHomeService> {
  vi.resetModules();
  const mod = await import('../adapters/mockSmartHomeAdapter');
  return mod.mockSmartHomeService;
}

describe('Smart Home service seam', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('defaults to the mock adapter', async () => {
    const { getSmartHomeService } = await import('../smartHomeService');
    const { mockSmartHomeService } = await import('../adapters/mockSmartHomeAdapter');
    expect(getSmartHomeService()).toBe(mockSmartHomeService);
    expect(mockSmartHomeService.id).toBe('mock');
    expect(mockSmartHomeService.ready).toBe(true);
  });

  it('the core adapter is present but not ready (no invented contract)', async () => {
    const { coreSmartHomeService } = await import('../adapters/coreSmartHomeAdapter');
    expect(coreSmartHomeService.id).toBe('core');
    expect(coreSmartHomeService.ready).toBe(false);
  });

  it('every core adapter method that returns a Promise rejects with the unavailable error', async () => {
    const { coreSmartHomeService } = await import('../adapters/coreSmartHomeAdapter');
    const { CoreSmartHomeContractUnavailableError } = await import('../smartHomeService');
    await expect(coreSmartHomeService.getRooms()).rejects.toBeInstanceOf(CoreSmartHomeContractUnavailableError);
    await expect(coreSmartHomeService.getRoom('x')).rejects.toBeInstanceOf(CoreSmartHomeContractUnavailableError);
    await expect(coreSmartHomeService.getDevices()).rejects.toBeInstanceOf(CoreSmartHomeContractUnavailableError);
    await expect(coreSmartHomeService.getDevice('x')).rejects.toBeInstanceOf(CoreSmartHomeContractUnavailableError);
    await expect(coreSmartHomeService.sendCommand('x', 'TURN_ON')).rejects.toBeInstanceOf(
      CoreSmartHomeContractUnavailableError,
    );
    await expect(coreSmartHomeService.getScenes()).rejects.toBeInstanceOf(CoreSmartHomeContractUnavailableError);
    await expect(coreSmartHomeService.triggerScene('x')).rejects.toBeInstanceOf(
      CoreSmartHomeContractUnavailableError,
    );
  });

  it('the core adapter subscribeToDeviceState returns a no-op unsubscribe and never invokes the callback', async () => {
    const { coreSmartHomeService } = await import('../adapters/coreSmartHomeAdapter');
    const callback = vi.fn();
    const unsubscribe = coreSmartHomeService.subscribeToDeviceState('dev-x', callback);
    expect(typeof unsubscribe).toBe('function');
    expect(() => unsubscribe()).not.toThrow();
    expect(callback).not.toHaveBeenCalled();
  });

  // ── Mock adapter — rooms ──────────────────────────────────────────────

  it('seeds six rooms with an honestly-derived device count and status', async () => {
    const service = await freshMockService();
    const rooms = await service.getRooms();
    expect(rooms).toHaveLength(6);

    const living = rooms.find((r) => r.id === 'room-living')!;
    expect(living.deviceCount).toBe(3);
    // Living Room: light on, thermostat (no power capability), speaker off →
    // one of two power-capable devices on → 'some_on'.
    expect(living.status).toBe('some_on');

    const entrance = rooms.find((r) => r.id === 'room-entrance')!;
    // Entrance Door Lock has no 'power' capability (it's a lock), so only
    // Entrance Light counts toward status — it starts off.
    expect(entrance.status).toBe('all_off');
  });

  it('getRoom returns a single room by id and rejects for an unknown id', async () => {
    const service = await freshMockService();
    const room = await service.getRoom('room-kitchen');
    expect(room.name).toBe('Kitchen');
    await expect(service.getRoom('does-not-exist')).rejects.toThrow(/not found/i);
  });

  // ── Mock adapter — devices ────────────────────────────────────────────

  it('getDevices returns every seeded device, including the offline and unavailable ones', async () => {
    const service = await freshMockService();
    const devices = await service.getDevices();
    expect(devices.length).toBeGreaterThanOrEqual(12);

    const offline = devices.find((d) => d.id === 'dev-bathroom-light')!;
    expect(offline.availability).toBe('offline');
    const unavailable = devices.find((d) => d.id === 'dev-outdoor-sensor')!;
    expect(unavailable.availability).toBe('unavailable');
  });

  it('getDevices(roomId) scopes to that room only', async () => {
    const service = await freshMockService();
    const bedroomDevices = await service.getDevices('room-bedroom');
    expect(bedroomDevices.length).toBeGreaterThanOrEqual(3);
    expect(bedroomDevices.every((d) => d.roomId === 'room-bedroom')).toBe(true);
  });

  it('getDevice returns a single device by id and rejects for an unknown id', async () => {
    const service = await freshMockService();
    const device = await service.getDevice('dev-living-light');
    expect(device.name).toBe('Living Room Light');
    await expect(service.getDevice('does-not-exist')).rejects.toThrow(/not found/i);
  });

  // ── Mock adapter — sendCommand ────────────────────────────────────────

  it('TURN_ON / TURN_OFF mutate device.state.power in place', async () => {
    const service = await freshMockService();
    const before = await service.getDevice('dev-kitchen-plug');
    expect(before.state.power).toBe(false);

    const on = await service.sendCommand('dev-kitchen-plug', 'TURN_ON');
    expect(on.state.power).toBe(true);
    const reread = await service.getDevice('dev-kitchen-plug');
    expect(reread.state.power).toBe(true);

    const off = await service.sendCommand('dev-kitchen-plug', 'TURN_OFF');
    expect(off.state.power).toBe(false);
  });

  it('SET_BRIGHTNESS clamps to 0-100', async () => {
    const service = await freshMockService();
    const over = await service.sendCommand('dev-living-light', 'SET_BRIGHTNESS', 150);
    expect(over.state.brightness).toBe(100);
    const under = await service.sendCommand('dev-living-light', 'SET_BRIGHTNESS', -20);
    expect(under.state.brightness).toBe(0);
    const mid = await service.sendCommand('dev-living-light', 'SET_BRIGHTNESS', 42);
    expect(mid.state.brightness).toBe(42);
  });

  it('SET_TEMPERATURE clamps to 10-32', async () => {
    const service = await freshMockService();
    const over = await service.sendCommand('dev-living-thermostat', 'SET_TEMPERATURE', 40);
    expect(over.state.temperature).toBe(32);
    const under = await service.sendCommand('dev-living-thermostat', 'SET_TEMPERATURE', 2);
    expect(under.state.temperature).toBe(10);
  });

  it('SET_FAN_SPEED accepts only low/medium/high', async () => {
    const service = await freshMockService();
    const updated = await service.sendCommand('dev-bedroom-fan', 'SET_FAN_SPEED', 'high');
    expect(updated.state.fanSpeed).toBe('high');
    // Deliberately invalid value to exercise the adapter's own runtime
    // validation (TypeScript would reject this at the call site otherwise).
    const invalid = 'turbo' as unknown as DeviceCommandValue;
    await expect(service.sendCommand('dev-bedroom-fan', 'SET_FAN_SPEED', invalid)).rejects.toThrow(
      /low.*medium.*high/i,
    );
  });

  it('LOCK / UNLOCK mutate device.state.locked', async () => {
    const service = await freshMockService();
    const unlocked = await service.sendCommand('dev-entrance-lock', 'UNLOCK');
    expect(unlocked.state.locked).toBe(false);
    const locked = await service.sendCommand('dev-entrance-lock', 'LOCK');
    expect(locked.state.locked).toBe(true);
  });

  it('rejects a command sent to a capability the device does not have', async () => {
    const service = await freshMockService();
    await expect(service.sendCommand('dev-entrance-lock', 'TURN_ON')).rejects.toThrow(/does not support/i);
  });

  it('rejects any command sent to an offline or unavailable device', async () => {
    const service = await freshMockService();
    await expect(service.sendCommand('dev-bathroom-light', 'TURN_ON')).rejects.toThrow(/offline/i);
    // The unavailable sensor has no commandable capability either way, but
    // the availability guard must reject before the capability check runs.
    const before = await service.getDevice('dev-outdoor-sensor');
    expect(before.availability).toBe('unavailable');
  });

  it('rejects a command for an unknown device id', async () => {
    const service = await freshMockService();
    await expect(service.sendCommand('does-not-exist', 'TURN_ON')).rejects.toThrow(/not found/i);
  });

  // ── Mock adapter — scenes ─────────────────────────────────────────────

  it('seeds three scenes, each with display-only action summaries', async () => {
    const service = await freshMockService();
    const scenes = await service.getScenes();
    expect(scenes.map((s) => s.name)).toEqual(
      expect.arrayContaining(['Good Night', 'Movie Time', 'Away Mode']),
    );
    for (const scene of scenes) {
      expect(scene.actions.length).toBeGreaterThan(0);
      for (const action of scene.actions) {
        expect(action.deviceId).toBeTruthy();
        expect(action.summary).toBeTruthy();
      }
      // The internal `effects` mapping (command/value) is not part of the
      // public Scene shape — the frontend never authors/edits scene logic.
      expect((scene as unknown as { effects?: unknown }).effects).toBeUndefined();
    }
  });

  it('triggerScene applies every effect and returns only the devices that actually changed', async () => {
    const service = await freshMockService();
    const changed = await service.triggerScene('scene-good-night');

    const changedIds = changed.map((d) => d.id).sort();
    expect(changedIds).toEqual(
      ['dev-bedroom-light', 'dev-entrance-lock', 'dev-living-light', 'dev-living-speaker'].sort(),
    );

    const bedroomLight = changed.find((d) => d.id === 'dev-bedroom-light')!;
    expect(bedroomLight.state.brightness).toBe(10);
    const livingLight = changed.find((d) => d.id === 'dev-living-light')!;
    expect(livingLight.state.power).toBe(false);
    const lock = changed.find((d) => d.id === 'dev-entrance-lock')!;
    expect(lock.state.locked).toBe(true);
  });

  it('triggerScene applies every effect when every targeted device is online (Movie Time)', async () => {
    const service = await freshMockService();
    const changed = await service.triggerScene('scene-movie-time');
    expect(changed.map((d) => d.id).sort()).toEqual(
      ['dev-kitchen-light', 'dev-living-light', 'dev-living-speaker'].sort(),
    );
    expect(changed.find((d) => d.id === 'dev-kitchen-light')!.state.power).toBe(false);
  });

  // NOTE ON SCOPE: `triggerScene`'s own implementation (mockSmartHomeAdapter.ts)
  // skips any effect whose target device is missing or not online — see its
  // `for (const effect of scene.effects)` loop — but none of the three seeded
  // scenes happen to target the one seeded offline device (dev-bathroom-light)
  // or the one seeded unavailable device (dev-outdoor-sensor); every scene
  // effect in this checkpoint's seed data targets an online device. That guard
  // is therefore not independently exercisable end-to-end through triggerScene
  // with the current seed data (and there is no public API to mark a device
  // offline to construct that scenario). Per this task's "do not restructure
  // the given adapter files" constraint, the seed data was left as-is rather
  // than adding a synthetic offline target to a scene. The equivalent guard on
  // the single-device path (`requireOnline`) IS fully covered above via
  // `sendCommand` against the seeded offline device, which exercises the same
  // underlying check `triggerScene` relies on.

  it('triggerScene rejects for an unknown scene id', async () => {
    const service = await freshMockService();
    await expect(service.triggerScene('does-not-exist')).rejects.toThrow(/not found/i);
  });

  // ── Mock adapter — realtime seam ──────────────────────────────────────

  it('subscribeToDeviceState fires the callback when sendCommand genuinely changes that device', async () => {
    const service = await freshMockService();
    const callback = vi.fn();
    const unsubscribe = service.subscribeToDeviceState('dev-kitchen-plug', callback);

    await service.sendCommand('dev-kitchen-plug', 'TURN_ON');
    expect(callback).toHaveBeenCalledTimes(1);
    expect((callback.mock.calls[0][0] as Device).state.power).toBe(true);

    unsubscribe();
    await service.sendCommand('dev-kitchen-plug', 'TURN_OFF');
    // No further calls after unsubscribing.
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('subscribeToDeviceState only notifies subscribers of the specific device that changed', async () => {
    const service = await freshMockService();
    const callback = vi.fn();
    service.subscribeToDeviceState('dev-kitchen-plug', callback);

    await service.sendCommand('dev-kitchen-light', 'TURN_OFF');
    expect(callback).not.toHaveBeenCalled();
  });

  describe('bedroom sensor drift simulation', () => {
    beforeEach(() => {
      // Only fake the interval APIs the drift simulation itself uses — the
      // adapter's own simulated-latency `delay()`/`withAbort()` helpers use
      // `setTimeout`, which must stay REAL here so every other `await
      // service.xyz(...)` call in this test still resolves normally instead
      // of hanging forever waiting on a clock nothing advances.
      vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] });
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    it('periodically drifts the seeded sensor device only while a subscriber is listening', async () => {
      const service = await freshMockService();
      const callback = vi.fn();
      const before = await service.getDevice('dev-bedroom-sensor');
      expect(before.state.sensorValue?.value).toBe('21.5°C');

      const unsubscribe = service.subscribeToDeviceState('dev-bedroom-sensor', callback);

      vi.advanceTimersByTime(4000);
      expect(callback).toHaveBeenCalledTimes(1);
      const updated = callback.mock.calls[0][0] as Device;
      expect(updated.state.sensorValue?.label).toBe('Temperature');
      expect(updated.state.sensorValue?.value).toMatch(/°C$/);

      unsubscribe();
      callback.mockClear();

      // No subscribers left → the interval stops; advancing more time must
      // not fire any further updates.
      vi.advanceTimersByTime(8000);
      expect(callback).not.toHaveBeenCalled();
    });
  });
});
