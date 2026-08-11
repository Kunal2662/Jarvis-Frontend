import { Monitor, Moon, Sparkles, Sun } from 'lucide-react';
import { Card, Label, Switch, cn, useTheme, type ThemeMode } from '../../../design-system';

const themeOptions: { value: ThemeMode; icon: React.ReactNode; label: string }[] = [
  { value: 'light', icon: <Sun className="size-4" />, label: 'Light' },
  { value: 'dark', icon: <Moon className="size-4" />, label: 'Dark' },
  { value: 'system', icon: <Monitor className="size-4" />, label: 'System' },
];

/**
 * Appearance settings — a fuller-page version of the same controls
 * `QuickSettings` already exposes from the topbar, wired to the SAME
 * `ThemeProvider` (`useTheme()`). This is deliberately NOT backed by
 * `SettingsService` — appearance is owned entirely by the existing,
 * already-shipped theme engine, and duplicating it here would be a second
 * theme engine (see docs/CORE_SETTINGS_CONTRACT_REQUIRED.md).
 */
export function AppearanceSection() {
  const { theme, setTheme, density, setDensity, contrast, setContrast, glass, setGlass, glassActive } =
    useTheme();

  return (
    <div className="flex flex-col gap-4" data-testid="settings-appearance">
      <Card className="flex flex-col gap-3 p-5">
        <span className="text-overline uppercase text-content-tertiary">Theme</span>
        <div className="grid max-w-sm grid-cols-3 gap-1 rounded-lg bg-surface-inset p-1">
          {themeOptions.map((opt) => (
            <button
              key={opt.value}
              data-testid={`settings-theme-${opt.value}`}
              onClick={() => setTheme(opt.value)}
              className={cn(
                'flex flex-col items-center gap-1 rounded-md py-2.5 text-caption font-medium transition-colors',
                theme === opt.value
                  ? 'bg-surface-raised text-content shadow-e1'
                  : 'text-content-secondary hover:text-content',
              )}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>
        <p className="text-caption text-content-tertiary">
          "System" follows your OS light/dark preference automatically.
        </p>
      </Card>

      <Card className="flex flex-col gap-3 p-5">
        <span className="text-overline uppercase text-content-tertiary">Density</span>
        <div className="grid max-w-sm grid-cols-2 gap-1 rounded-lg bg-surface-inset p-1">
          {(['comfortable', 'compact'] as const).map((d) => (
            <button
              key={d}
              data-testid={`settings-density-${d}`}
              onClick={() => setDensity(d)}
              className={cn(
                'rounded-md py-2 text-caption font-medium capitalize transition-colors',
                density === d
                  ? 'bg-surface-raised text-content shadow-e1'
                  : 'text-content-secondary hover:text-content',
              )}
            >
              {d}
            </button>
          ))}
        </div>
      </Card>

      <Card className="flex flex-col gap-4 p-5">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <Label htmlFor="settings-glass" className="flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-ai-aura" />
              Liquid Glass
            </Label>
            <span className="text-caption text-content-tertiary">
              Translucent, blurred surfaces. Automatically disabled on low-power devices.
            </span>
          </div>
          <Switch
            id="settings-glass"
            checked={glass === 'on' || (glass === 'auto' && glassActive)}
            onCheckedChange={(v) => setGlass(v ? 'on' : 'off')}
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <Label htmlFor="settings-contrast">High contrast</Label>
            <span className="text-caption text-content-tertiary">Increases text and border contrast.</span>
          </div>
          <Switch
            id="settings-contrast"
            checked={contrast === 'high'}
            onCheckedChange={(v) => setContrast(v ? 'high' : 'normal')}
          />
        </div>
      </Card>
    </div>
  );
}
