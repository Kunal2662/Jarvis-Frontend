import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type ThemeMode = 'dark' | 'light' | 'system';
export type ResolvedTheme = 'dark' | 'light';
export type Density = 'comfortable' | 'compact';
export type Contrast = 'normal' | 'high';
export type GlassPreference = 'auto' | 'on' | 'off';

interface ThemeState {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  density: Density;
  contrast: Contrast;
  glass: GlassPreference;
  glassActive: boolean;
  setTheme: (t: ThemeMode) => void;
  setDensity: (d: Density) => void;
  setContrast: (c: Contrast) => void;
  setGlass: (g: GlassPreference) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeState | null>(null);

const STORAGE_KEY = 'jarvis.theme';

interface Persisted {
  theme: ThemeMode;
  density: Density;
  contrast: Contrast;
  glass: GlassPreference;
}

function read(): Partial<Persisted> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
  } catch {
    return {};
  }
}

/** Detect whether real Liquid Glass (backdrop blur) is worth enabling. */
function detectGlassCapability(): boolean {
  if (typeof window === 'undefined') return false;
  const supports =
    CSS.supports('backdrop-filter', 'blur(1px)') ||
    CSS.supports('-webkit-backdrop-filter', 'blur(1px)');
  if (!supports) return false;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nav = navigator as Navigator & { deviceMemory?: number };
  const lowMemory = typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 2;
  const lowCores =
    typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 2;
  return !reduced && !lowMemory && !lowCores;
}

export function ThemeProvider({
  children,
  defaultTheme = 'dark',
}: {
  children: ReactNode;
  defaultTheme?: ThemeMode;
}) {
  const persisted = read();
  const [theme, setThemeState] = useState<ThemeMode>(persisted.theme ?? defaultTheme);
  const [density, setDensityState] = useState<Density>(persisted.density ?? 'comfortable');
  const [contrast, setContrastState] = useState<Contrast>(persisted.contrast ?? 'normal');
  const [glass, setGlassState] = useState<GlassPreference>(persisted.glass ?? 'auto');
  const [systemDark, setSystemDark] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches,
  );
  const [glassCapable, setGlassCapable] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setSystemDark(mql.matches);
    mql.addEventListener('change', onChange);
    setGlassCapable(detectGlassCapability());
    return () => mql.removeEventListener('change', onChange);
  }, []);

  const resolvedTheme: ResolvedTheme = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;
  const glassActive = glass === 'on' || (glass === 'auto' && glassCapable);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', resolvedTheme);
    root.setAttribute('data-density', density);
    root.setAttribute('data-contrast', contrast === 'high' ? 'high' : 'normal');
    root.setAttribute('data-glass', glassActive ? 'on' : 'off');
  }, [resolvedTheme, density, contrast, glassActive]);

  const persist = useCallback((next: Partial<Persisted>) => {
    const merged = { ...read(), ...next };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  }, []);

  const setTheme = useCallback(
    (t: ThemeMode) => {
      setThemeState(t);
      persist({ theme: t });
    },
    [persist],
  );
  const setDensity = useCallback(
    (d: Density) => {
      setDensityState(d);
      persist({ density: d });
    },
    [persist],
  );
  const setContrast = useCallback(
    (c: Contrast) => {
      setContrastState(c);
      persist({ contrast: c });
    },
    [persist],
  );
  const setGlass = useCallback(
    (g: GlassPreference) => {
      setGlassState(g);
      persist({ glass: g });
    },
    [persist],
  );
  const toggleTheme = useCallback(
    () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark'),
    [resolvedTheme, setTheme],
  );

  const value = useMemo<ThemeState>(
    () => ({
      theme,
      resolvedTheme,
      density,
      contrast,
      glass,
      glassActive,
      setTheme,
      setDensity,
      setContrast,
      setGlass,
      toggleTheme,
    }),
    [
      theme,
      resolvedTheme,
      density,
      contrast,
      glass,
      glassActive,
      setTheme,
      setDensity,
      setContrast,
      setGlass,
      toggleTheme,
    ],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme(): ThemeState {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within <ThemeProvider>');
  return ctx;
}
