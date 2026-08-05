import { Monitor, Moon, Sun, Sparkles } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../../primitives/Popover/Popover';
import { Switch } from '../../primitives/Selection/Switch';
import { Label } from '../../primitives/Label/Label';
import { useTheme, type ThemeMode } from '../../theme/ThemeProvider';
import { cn } from '../../lib/cn';

const themeOptions: { value: ThemeMode; icon: React.ReactNode; label: string }[] = [
  { value: 'light', icon: <Sun className="size-4" />, label: 'Light' },
  { value: 'dark', icon: <Moon className="size-4" />, label: 'Dark' },
  { value: 'system', icon: <Monitor className="size-4" />, label: 'System' },
];

/** Glass quick-settings panel wired to the theme engine. */
export function QuickSettings({ trigger }: { trigger: React.ReactNode }) {
  const { theme, setTheme, density, setDensity, contrast, setContrast, glass, setGlass, glassActive } =
    useTheme();

  return (
    <Popover>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent align="end" className="w-72">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-overline uppercase text-content-tertiary">Appearance</span>
            <div className="grid grid-cols-3 gap-1 rounded-lg bg-surface-inset p-1">
              {themeOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setTheme(opt.value)}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-md py-2 text-caption font-medium transition-colors',
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
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-overline uppercase text-content-tertiary">Density</span>
            <div className="grid grid-cols-2 gap-1 rounded-lg bg-surface-inset p-1">
              {(['comfortable', 'compact'] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDensity(d)}
                  className={cn(
                    'rounded-md py-1.5 text-caption font-medium capitalize transition-colors',
                    density === d
                      ? 'bg-surface-raised text-content shadow-e1'
                      : 'text-content-secondary hover:text-content',
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="qs-glass" className="flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-ai-aura" />
              Liquid Glass
            </Label>
            <Switch
              id="qs-glass"
              checked={glass === 'on' || (glass === 'auto' && glassActive)}
              onCheckedChange={(v) => setGlass(v ? 'on' : 'off')}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="qs-contrast">High contrast</Label>
            <Switch
              id="qs-contrast"
              checked={contrast === 'high'}
              onCheckedChange={(v) => setContrast(v ? 'high' : 'normal')}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
