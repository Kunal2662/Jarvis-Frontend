import { Search as SearchIcon } from 'lucide-react';
import type { CommandGroup } from '../design-system';
import { sceneIcon } from '../features/smartHome/smartHomeFormat';
import type { Scene } from '../features/smartHome/smartHomeService';

/**
 * Global Command Center (roadmap item 22) — pure command-group builders
 * consumed by AppLayout.tsx's existing Command Palette (⌘K).
 *
 * This is deliberately NOT a new orchestration/execution engine, a second
 * search index, or a new page/route. Per
 * `docs/JARVIS_CORE_FRONTEND_MAPPING.md`'s "do not implement a second
 * search/smart-home engine" rules, this module only *composes* commands
 * that route to (or call) capabilities that already exist:
 *
 * - `buildSearchGroup` — a single bridge item that opens the existing
 *   Universal Search overlay (`⌘⇧K`, `UniversalSearch.tsx`/`searchService.ts`,
 *   Step 9). No second search index, no duplicated category adapters — this
 *   just flips the same `searchOpen` state AppLayout already owns.
 * - `buildSceneControlGroup` — one item per Smart Home scene (Step 13's
 *   `SmartHomeService.getScenes()`/`triggerScene()`), the same finite,
 *   pre-curated, already-safe action set `SmartHomePage.tsx` itself
 *   triggers — never a per-device command (that stays on the Smart Home /
 *   Device Management pages, which have the context to show device state).
 *   Returns `null` when there are no scenes to offer (e.g. the Core adapter
 *   is selected and unavailable) — an honest omission rather than a fake or
 *   broken-looking group, per this step's "show unavailable, don't invent"
 *   rule.
 */

export function buildSearchGroup(onOpenSearch: () => void): CommandGroup {
  return {
    heading: 'Search',
    items: [
      {
        id: 'search-everything',
        label: 'Search everything…',
        icon: <SearchIcon />,
        shortcut: '⌘⇧K',
        onSelect: onOpenSearch,
      },
    ],
  };
}

export function buildSceneControlGroup(scenes: Scene[], onTrigger: (scene: Scene) => void): CommandGroup | null {
  if (scenes.length === 0) return null;
  return {
    heading: 'Control',
    items: scenes.map((scene) => {
      const Icon = sceneIcon(scene.icon);
      return {
        id: `scene-${scene.id}`,
        label: scene.name,
        icon: <Icon />,
        hint: 'scene',
        keywords: [scene.description],
        onSelect: () => onTrigger(scene),
      };
    }),
  };
}
