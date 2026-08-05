import { useEffect } from 'react';

type HotkeyHandler = (e: KeyboardEvent) => void;

/**
 * Register a global keyboard shortcut.
 * @param combo e.g. "mod+k", "escape", "mod+shift+p" (mod = ⌘ on mac, Ctrl elsewhere)
 */
export function useHotkey(combo: string, handler: HotkeyHandler, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const parts = combo.toLowerCase().split('+');
    const needMod = parts.includes('mod');
    const needShift = parts.includes('shift');
    const needAlt = parts.includes('alt');
    const key = parts[parts.length - 1];

    const onKeyDown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (needMod && !mod) return;
      if (!needMod && mod) return;
      if (needShift !== e.shiftKey) return;
      if (needAlt !== e.altKey) return;
      if (e.key.toLowerCase() !== key) return;
      handler(e);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [combo, handler, enabled]);
}
