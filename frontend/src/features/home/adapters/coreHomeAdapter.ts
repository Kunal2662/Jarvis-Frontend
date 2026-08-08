import {
  CoreHomeContractUnavailableError,
  type HomeService,
  type HomeSnapshot,
} from '../homeService';

/**
 * JARVIS Core home adapter — INTENTIONALLY UNIMPLEMENTED.
 *
 * The real Core aggregation contract (activity, tasks, calendar, automations,
 * smart-home, system) is not available. Per project rules we do NOT invent
 * endpoints. Once Core ships it, implement `getSnapshot` here (map Core → HomeSnapshot),
 * set `ready: true`, and select via `VITE_HOME_BACKEND=core`. No Home changes needed.
 */
export const coreHomeService: HomeService = {
  id: 'core',
  label: 'JARVIS Core (contract pending)',
  ready: false,
  async getSnapshot(): Promise<HomeSnapshot> {
    throw new CoreHomeContractUnavailableError();
  },
};
