import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { DEFAULT_SETTINGS, getSettingsService, type AppSettings, type SettingsService } from './settingsService';

interface SettingsContextValue {
  settings: AppSettings;
  /** True until the first `getSettings()` resolves. */
  loading: boolean;
  service: SettingsService;
  update: (patch: Partial<AppSettings>) => Promise<AppSettings>;
  reset: () => Promise<AppSettings>;
}

/**
 * A real (non-`null`) default value — unlike `ThemeProvider`'s `useTheme`,
 * which throws outside its provider. Settings is read from `AppLayout`
 * (the shared shell every route renders), and dozens of pre-existing
 * feature test files already render the full `<App/>` tree wrapped only in
 * `ThemeProvider`/`TooltipProvider`/`ToastProvider` (see e.g.
 * features/agents/__tests__/routing.test.tsx). Requiring every one of
 * those unrelated test files to also add `<SettingsProvider>` would be a
 * wide, unscoped change for this step. Falling back to
 * `DEFAULT_SETTINGS` (`notificationsEnabled: true`) outside a real
 * provider exactly matches AppLayout's pre-Step-19 unconditional behavior,
 * so nothing regresses.
 */
const defaultService = getSettingsService();
const defaultContextValue: SettingsContextValue = {
  settings: DEFAULT_SETTINGS,
  loading: false,
  service: defaultService,
  update: (patch) => defaultService.updateSettings(patch),
  reset: () => defaultService.resetSettings(),
};

const SettingsContext = createContext<SettingsContextValue>(defaultContextValue);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const service = useMemo(() => getSettingsService(), []);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    service
      .getSettings()
      .then((result) => {
        if (!cancelled) setSettings(result);
      })
      .catch(() => {
        // Core adapter (not ready) or a genuine failure — fall back to
        // documented defaults rather than an indefinite loading state.
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [service]);

  const update = useCallback(
    async (patch: Partial<AppSettings>) => {
      const next = await service.updateSettings(patch);
      setSettings(next);
      return next;
    },
    [service],
  );

  const reset = useCallback(async () => {
    const next = await service.resetSettings();
    setSettings(next);
    return next;
  }, [service]);

  const value = useMemo<SettingsContextValue>(
    () => ({ settings, loading, service, update, reset }),
    [settings, loading, service, update, reset],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSettings(): SettingsContextValue {
  return useContext(SettingsContext);
}
