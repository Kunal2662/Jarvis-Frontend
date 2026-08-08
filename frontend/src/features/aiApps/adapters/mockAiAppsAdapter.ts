import type { AiApp, AiAppsService } from '../aiAppsService';

/**
 * Frontend in-memory mock adapter for AI Apps. All catalog data + mutation
 * logic lives HERE, separated from presentation — mirrors
 * mockAutomationAdapter.ts / mockKnowledgeAdapter.ts. Simulates realistic
 * network latency so loading states are exercised, and `setConnected`
 * mutates real in-memory state so the UI is fully interactive.
 *
 * IMPORTANT: `setConnected` is a LOCAL MOCK TOGGLE ONLY. It never redirects
 * to any external URL and never performs a real OAuth handshake — it just
 * flips `connectionStatus` in this module's in-memory array, same as any
 * other mock adapter mutation. A future Core adapter can replace this
 * wholesale — no UI change required.
 */

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

async function withAbort<T>(signal: AbortSignal | undefined, value: T, ms = 300): Promise<T> {
  const result = await delay(value, ms);
  if (signal?.aborted) throw new DOMException('aborted', 'AbortError');
  return result;
}

let apps: AiApp[] = [
  {
    id: 'web-search',
    name: 'Web Search',
    description: 'Lets Jarvis search the web for current information while responding to you.',
    category: 'mcp-tool',
    provider: 'JARVIS Core',
    capabilities: [
      'Send search queries to a web search provider',
      'Read back page titles, snippets and links',
      'Read-only — cannot post, submit, or modify anything on the web',
    ],
    connectionStatus: 'connected',
    updatedAt: '2026-06-01T09:00:00-04:00',
  },
  {
    id: 'file-access',
    name: 'File Access',
    description: 'Lets Jarvis read and write files in your local workspace when you ask it to.',
    category: 'mcp-tool',
    provider: 'JARVIS Core',
    capabilities: [
      'Read files in the current workspace',
      'Create and edit files in the current workspace',
      'Never deletes a file without explicit confirmation',
    ],
    connectionStatus: 'connected',
    updatedAt: '2026-06-01T09:00:00-04:00',
  },
  {
    id: 'automations-tool',
    name: 'Automations Tool',
    description: 'Lets Jarvis create, enable, and trigger automations on your behalf.',
    category: 'mcp-tool',
    provider: 'JARVIS Core',
    capabilities: [
      'Create and edit automations',
      'Enable and disable existing automations',
      'Trigger an automation run on request',
    ],
    connectionStatus: 'connected',
    updatedAt: '2026-06-01T09:00:00-04:00',
  },
  {
    id: 'code-sandbox',
    name: 'Code Sandbox',
    description: 'Lets Jarvis run and test short code snippets in an isolated sandbox.',
    category: 'mcp-tool',
    provider: 'JARVIS Core',
    capabilities: [
      'Execute short-lived code snippets in an isolated sandbox',
      'No network access from inside the sandbox',
      'No access to files outside the sandbox',
    ],
    connectionStatus: 'not_connected',
    updatedAt: '2026-05-10T09:00:00-04:00',
  },
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Connects your Gmail inbox so Jarvis can read and draft email on your behalf.',
    category: 'connector',
    provider: 'Google',
    capabilities: [
      'Read email subject lines and message content',
      'Draft and send email on your behalf',
      'Requires Google account sign-in — not implemented in this build (mock only)',
    ],
    connectionStatus: 'not_connected',
    updatedAt: '2026-04-18T09:00:00-04:00',
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Connects your Google Calendar so Jarvis can view and manage events.',
    category: 'connector',
    provider: 'Google',
    capabilities: [
      'View upcoming calendar events',
      'Create and update calendar events',
      'Requires Google account sign-in — not implemented in this build (mock only)',
    ],
    connectionStatus: 'connected',
    updatedAt: '2026-07-02T09:00:00-04:00',
  },
  {
    id: 'microsoft-365',
    name: 'Microsoft 365',
    description: 'Connects Outlook, OneDrive and Teams so Jarvis can work across Microsoft 365.',
    category: 'connector',
    provider: 'Microsoft',
    capabilities: [
      'Read Outlook email and calendar',
      'Access files stored in OneDrive',
      'Requires Microsoft account sign-in — not available in this build yet',
    ],
    connectionStatus: 'unavailable',
    updatedAt: '2026-03-01T09:00:00-04:00',
  },
];

function clone(app: AiApp): AiApp {
  return JSON.parse(JSON.stringify(app));
}

function requireApp(id: string): AiApp {
  const found = apps.find((a) => a.id === id);
  if (!found) throw new Error(`AI App "${id}" was not found.`);
  return found;
}

export const mockAiAppsService: AiAppsService = {
  id: 'mock',
  label: 'Frontend mock',
  ready: true,

  async getApps(signal?: AbortSignal): Promise<AiApp[]> {
    return withAbort(signal, apps.map(clone));
  },

  async getApp(id: string, signal?: AbortSignal): Promise<AiApp> {
    const found = requireApp(id);
    return withAbort(signal, clone(found), 200);
  },

  async setConnected(id: string, connected: boolean, signal?: AbortSignal): Promise<AiApp> {
    const existing = requireApp(id);
    if (existing.connectionStatus === 'unavailable') {
      throw new Error(`${existing.name} is not available to connect in this build yet.`);
    }
    const updated: AiApp = {
      ...existing,
      connectionStatus: connected ? 'connected' : 'not_connected',
      updatedAt: new Date().toISOString(),
    };
    apps = apps.map((a) => (a.id === id ? updated : a));
    return withAbort(signal, clone(updated), 250);
  },
};
