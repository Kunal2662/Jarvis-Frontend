import {
  CoreAiAppsContractUnavailableError,
  type AiApp,
  type AiAppsService,
} from '../aiAppsService';

/**
 * JARVIS Core AI Apps / integration adapter — INTENTIONALLY UNIMPLEMENTED.
 *
 * The real JARVIS Core MCP & Integration Platform contract (M10.5 — list
 * available MCP tools/connectors, connect/disconnect a connector, permission
 * scopes, third-party OAuth boundary) is not yet available. Per project
 * rules we do NOT invent an endpoint. This adapter is the plug point: once
 * the Core AI Apps contract is verified, implement each method here (map
 * Core → AiApp types already defined in aiAppsService.ts), set
 * `ready: true`, and select it via `VITE_AI_APPS_BACKEND=core`. No
 * AiAppsPage/UI change is needed.
 *
 * See docs/CORE_AI_APPS_CONTRACT_REQUIRED.md for exactly what must be
 * provided.
 */
function unavailable(): never {
  if (import.meta.env.DEV) {
    console.warn(new CoreAiAppsContractUnavailableError().message);
  }
  throw new CoreAiAppsContractUnavailableError();
}

export const coreAiAppsService: AiAppsService = {
  id: 'core',
  label: 'JARVIS Core (contract pending)',
  ready: false,

  async getApps(): Promise<AiApp[]> {
    return unavailable();
  },
  async getApp(): Promise<AiApp> {
    return unavailable();
  },
  async setConnected(): Promise<AiApp> {
    return unavailable();
  },
};
