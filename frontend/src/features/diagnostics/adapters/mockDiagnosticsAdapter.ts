import type { CoreHealthSnapshot, DiagnosticsService, SystemComponentStatus } from '../diagnosticsService';
import { getHomeService } from '../../home/homeService';
import { getChatService } from '../../chat/chatService';
import { getVoiceService } from '../../voice/voiceService';
import { getAutomationService } from '../../automations/automationService';
import { getKnowledgeService } from '../../knowledge/knowledgeService';
import { getIntelligenceService } from '../../intelligence/intelligenceService';
import { getAiAppsService } from '../../aiApps/aiAppsService';
import { getNotesService } from '../../notes/notesService';
import { getTasksService } from '../../tasks/tasksService';
import { getCalendarService } from '../../calendar/calendarService';
import { getFilesService } from '../../files/filesService';
import { getSmartHomeService } from '../../smartHome/smartHomeService';
import { getHomeAssistantConnectorService, getMqttConnectorService } from '../../smartHome/smartHomeIntegrationService';
import { getMemoryService } from '../../memory/memoryService';
import { getAgentService } from '../../agents/agentService';
import { getSettingsService } from '../../settings/settingsService';
import { getSearchService } from '../../search/searchService';

/**
 * Frontend introspection adapter for Diagnostics. This is NOT fabricated
 * mock data the way other features' mock adapters seed fictional
 * content — every row of `getSystemStatus` reads the real `id`/`label`/
 * `ready` off another feature's own service seam (the exact same fields
 * `AboutSection.tsx` already surfaces, extended to every feature seam in
 * this checkpoint, not just Settings' curated subset). `getCoreHealth`
 * honestly reports that Core-side health telemetry is unavailable rather
 * than inventing CPU/memory numbers — see docs/CORE_DIAGNOSTICS_CONTRACT_REQUIRED.md.
 */

function delay<T>(value: T, ms = 250): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

async function withAbort<T>(signal: AbortSignal | undefined, value: T, ms = 250): Promise<T> {
  const result = await delay(value, ms);
  if (signal?.aborted) throw new DOMException('aborted', 'AbortError');
  return result;
}

function row(
  key: string,
  name: string,
  service: { id: string; label: string; ready: boolean },
): SystemComponentStatus {
  return { key, name, backendId: service.id, backendLabel: service.label, ready: service.ready };
}

function collectSystemStatus(): SystemComponentStatus[] {
  return [
    row('home', 'Home / Command Center', getHomeService()),
    row('chat', 'Chat / Voice orchestrator', getChatService()),
    row('voice', 'Voice (speech)', getVoiceService()),
    row('automations', 'Automations', getAutomationService()),
    row('knowledge', 'Knowledge', getKnowledgeService()),
    row('intelligence', 'Intelligence', getIntelligenceService()),
    row('ai-apps', 'AI Apps', getAiAppsService()),
    row('notes', 'Notes', getNotesService()),
    row('tasks', 'Tasks', getTasksService()),
    row('calendar', 'Calendar', getCalendarService()),
    row('files', 'Files', getFilesService()),
    row('smart-home', 'Smart Home', getSmartHomeService()),
    row('home-assistant', 'Home Assistant', getHomeAssistantConnectorService()),
    row('mqtt', 'MQTT', getMqttConnectorService()),
    row('memory', 'Memory', getMemoryService()),
    row('agents', 'Agents', getAgentService()),
    row('settings', 'Settings', getSettingsService()),
    row('search', 'Search', getSearchService()),
  ];
}

export const mockDiagnosticsService: DiagnosticsService = {
  id: 'mock',
  label: 'Frontend introspection (local adapter registry)',
  ready: true,

  async getSystemStatus(signal?: AbortSignal): Promise<SystemComponentStatus[]> {
    return withAbort(signal, collectSystemStatus());
  },

  async getCoreHealth(signal?: AbortSignal): Promise<CoreHealthSnapshot> {
    const snapshot: CoreHealthSnapshot = {
      available: false,
      milestone: 'M13B',
      message:
        "JARVIS Core has not shipped Self-Healing & Observability (M13B) yet, so no Core-reported CPU, memory, uptime, or self-healing telemetry is available. See docs/CORE_DIAGNOSTICS_CONTRACT_REQUIRED.md.",
    };
    return withAbort(signal, snapshot);
  },
};
