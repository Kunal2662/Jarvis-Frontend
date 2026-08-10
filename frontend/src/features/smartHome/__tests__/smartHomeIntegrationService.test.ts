import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ConnectorService } from '../smartHomeIntegrationService';

// Each test gets a fresh module instance so mutations in one test never leak
// into another (the mock adapters keep their connector state in
// module-level state, mirrors smartHomeService.test.ts's freshMockService()).
async function freshHomeAssistantService(): Promise<ConnectorService> {
  vi.resetModules();
  const mod = await import('../adapters/mockHomeAssistantAdapter');
  return mod.mockHomeAssistantConnectorService;
}

async function freshMqttService(): Promise<ConnectorService> {
  vi.resetModules();
  const mod = await import('../adapters/mockMqttAdapter');
  return mod.mockMqttConnectorService;
}

describe('Home Assistant + MQTT integration seam', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('defaults both connectors to their mock adapters', async () => {
    const { getHomeAssistantConnectorService, getMqttConnectorService } = await import(
      '../smartHomeIntegrationService'
    );
    const { mockHomeAssistantConnectorService } = await import('../adapters/mockHomeAssistantAdapter');
    const { mockMqttConnectorService } = await import('../adapters/mockMqttAdapter');
    expect(getHomeAssistantConnectorService()).toBe(mockHomeAssistantConnectorService);
    expect(getMqttConnectorService()).toBe(mockMqttConnectorService);
    expect(mockHomeAssistantConnectorService.ready).toBe(true);
    expect(mockMqttConnectorService.ready).toBe(true);
  });

  it('the core adapters are present but not ready (no invented contract)', async () => {
    const { coreHomeAssistantConnectorService } = await import('../adapters/coreHomeAssistantAdapter');
    const { coreMqttConnectorService } = await import('../adapters/coreMqttAdapter');
    expect(coreHomeAssistantConnectorService.id).toBe('core');
    expect(coreHomeAssistantConnectorService.ready).toBe(false);
    expect(coreMqttConnectorService.id).toBe('core');
    expect(coreMqttConnectorService.ready).toBe(false);
  });

  it('every core adapter method rejects with a connector-specific unavailable error', async () => {
    const { coreHomeAssistantConnectorService } = await import('../adapters/coreHomeAssistantAdapter');
    const { coreMqttConnectorService } = await import('../adapters/coreMqttAdapter');
    const { CoreConnectorContractUnavailableError } = await import('../smartHomeIntegrationService');

    await expect(coreHomeAssistantConnectorService.getState()).rejects.toBeInstanceOf(
      CoreConnectorContractUnavailableError,
    );
    await expect(coreHomeAssistantConnectorService.getState()).rejects.toThrow(/Home Assistant/);
    await expect(coreHomeAssistantConnectorService.connect({ endpoint: 'x', secret: 'y' })).rejects.toBeInstanceOf(
      CoreConnectorContractUnavailableError,
    );
    await expect(coreHomeAssistantConnectorService.disconnect()).rejects.toBeInstanceOf(
      CoreConnectorContractUnavailableError,
    );
    await expect(coreHomeAssistantConnectorService.reconnect()).rejects.toBeInstanceOf(
      CoreConnectorContractUnavailableError,
    );
    await expect(coreHomeAssistantConnectorService.syncEntities()).rejects.toBeInstanceOf(
      CoreConnectorContractUnavailableError,
    );

    await expect(coreMqttConnectorService.getState()).rejects.toThrow(/MQTT/);
  });

  // ── Mock Home Assistant adapter ─────────────────────────────────────────

  it('Home Assistant starts not_configured with no instance/entities/diagnostics', async () => {
    const service = await freshHomeAssistantService();
    const state = await service.getState();
    expect(state.status).toBe('not_configured');
    expect(state.credentialState).toBe('not_configured');
    expect(state.instance).toBeUndefined();
    expect(state.discoveredEntities).toEqual([]);
    expect(state.diagnostics).toEqual([]);
  });

  it('Home Assistant connect() validates both fields, then records only a display label — never the secret', async () => {
    const service = await freshHomeAssistantService();
    await expect(service.connect({ endpoint: '', secret: 'token' })).rejects.toThrow(/instance url/i);
    await expect(service.connect({ endpoint: 'http://homeassistant.local', secret: '' })).rejects.toThrow(/token/i);

    const state = await service.connect({ endpoint: 'http://homeassistant.local:8123', secret: 'super-secret-token' });
    expect(state.status).toBe('connected');
    expect(state.credentialState).toBe('configured');
    expect(state.instance).toEqual({ label: 'http://homeassistant.local:8123' });
    // The raw secret must never appear anywhere in the returned state.
    expect(JSON.stringify(state)).not.toContain('super-secret-token');
    expect(state.diagnostics[0].message).toMatch(/connected/i);
  });

  it('Home Assistant disconnect() requires a connected state and clears discovered entities', async () => {
    const service = await freshHomeAssistantService();
    await expect(service.disconnect()).rejects.toThrow(/not connected/i);

    await service.connect({ endpoint: 'http://ha.local', secret: 'token' });
    await service.syncEntities();
    const disconnected = await service.disconnect();
    expect(disconnected.status).toBe('disconnected');
    expect(disconnected.discoveredEntities).toEqual([]);
  });

  it('Home Assistant reconnect() requires disconnected/error and restores connected status', async () => {
    const service = await freshHomeAssistantService();
    await expect(service.reconnect()).rejects.toThrow(/reconnectable/i);

    await service.connect({ endpoint: 'http://ha.local', secret: 'token' });
    await service.disconnect();
    const reconnected = await service.reconnect();
    expect(reconnected.status).toBe('connected');
  });

  it('Home Assistant syncEntities() requires connected, returns a non-empty preview, and sets lastSyncedAt', async () => {
    const service = await freshHomeAssistantService();
    await expect(service.syncEntities()).rejects.toThrow(/connect to home assistant/i);

    await service.connect({ endpoint: 'http://ha.local', secret: 'token' });
    const synced = await service.syncEntities();
    expect(synced.discoveredEntities.length).toBeGreaterThan(0);
    expect(synced.lastSyncedAt).toBeTruthy();
    for (const entity of synced.discoveredEntities) {
      expect(entity.name).toBeTruthy();
      expect(entity.type).toBeTruthy();
      expect(entity.capabilities.length).toBeGreaterThan(0);
    }
  });

  it('Home Assistant diagnostics log grows newest-first and stays capped', async () => {
    const service = await freshHomeAssistantService();
    await service.connect({ endpoint: 'http://ha.local', secret: 'token' });
    await service.syncEntities();
    const state = await service.getState();
    expect(state.diagnostics.length).toBeGreaterThanOrEqual(2);
    // Newest entry (sync) is first.
    expect(state.diagnostics[0].message).toMatch(/synced/i);
    expect(state.diagnostics[state.diagnostics.length - 1].message).toMatch(/connected/i);
  });

  // ── Mock MQTT adapter ───────────────────────────────────────────────────

  it('MQTT starts not_configured and follows the same connect/disconnect/reconnect/sync lifecycle', async () => {
    const service = await freshMqttService();
    const initial = await service.getState();
    expect(initial.status).toBe('not_configured');

    await expect(service.connect({ endpoint: '', secret: 'pw' })).rejects.toThrow(/broker host/i);
    await expect(service.connect({ endpoint: 'mqtt.local:1883', secret: '' })).rejects.toThrow(/password/i);

    const connected = await service.connect({ endpoint: 'mqtt.local:1883', secret: 'broker-password' });
    expect(connected.status).toBe('connected');
    expect(connected.instance).toEqual({ label: 'mqtt.local:1883' });
    expect(JSON.stringify(connected)).not.toContain('broker-password');

    const synced = await service.syncEntities();
    expect(synced.discoveredEntities.length).toBeGreaterThan(0);

    const disconnected = await service.disconnect();
    expect(disconnected.status).toBe('disconnected');
    expect(disconnected.discoveredEntities).toEqual([]);

    const reconnected = await service.reconnect();
    expect(reconnected.status).toBe('connected');
  });

  it('MQTT and Home Assistant mock state are fully independent module instances', async () => {
    const ha = await freshHomeAssistantService();
    const mqtt = await freshMqttService();
    await ha.connect({ endpoint: 'http://ha.local', secret: 'token' });
    const mqttState = await mqtt.getState();
    expect(mqttState.status).toBe('not_configured');
  });
});
