import { describe, expect, it, vi } from 'vitest';
import { buildSceneControlGroup, buildSearchGroup } from '../commandCenter';
import { mockSmartHomeService } from '../../features/smartHome/adapters/mockSmartHomeAdapter';
import { comingSoonModules, developerModules, liveSecondaryModules, settingsModules, topBarModules } from '../modules';
import type { Scene } from '../../features/smartHome/smartHomeService';

describe('buildSearchGroup', () => {
  it('is a single bridge item into the existing Universal Search overlay — never a second search index', () => {
    const onOpenSearch = vi.fn();
    const group = buildSearchGroup(onOpenSearch);

    expect(group.heading).toBe('Search');
    expect(group.items).toHaveLength(1);
    expect(group.items[0].id).toBe('search-everything');
    expect(group.items[0].shortcut).toBe('⌘⇧K');

    group.items[0].onSelect();
    expect(onOpenSearch).toHaveBeenCalledTimes(1);
  });
});

describe('buildSceneControlGroup', () => {
  const scenes: Scene[] = [
    { id: 'scene-good-night', name: 'Good Night', description: 'Dims things.', icon: 'moon', actions: [] },
    { id: 'scene-movie-time', name: 'Movie Time', description: 'Movie mode.', icon: 'film', actions: [] },
  ];

  it('returns null when there are no scenes — an honest omission, never a fake/broken-looking group', () => {
    expect(buildSceneControlGroup([], vi.fn())).toBeNull();
  });

  it('returns one command per scene, each routing to the shared onTrigger callback with that exact scene', () => {
    const onTrigger = vi.fn();
    const group = buildSceneControlGroup(scenes, onTrigger);

    expect(group).not.toBeNull();
    expect(group?.heading).toBe('Control');
    expect(group?.items.map((i) => i.label)).toEqual(['Good Night', 'Movie Time']);
    expect(group?.items.every((i) => i.hint === 'scene')).toBe(true);

    group?.items[0].onSelect();
    expect(onTrigger).toHaveBeenCalledTimes(1);
    expect(onTrigger).toHaveBeenCalledWith(scenes[0]);
  });

  it('never exposes a per-device command — only the finite, pre-curated scene set', () => {
    const group = buildSceneControlGroup(scenes, vi.fn());
    expect(group?.items).toHaveLength(scenes.length);
  });
});

describe('Command Center registrations never collide with existing commands (no duplicate ids)', () => {
  it('scene/search command ids never collide with a real module path or the static Actions ids', async () => {
    const scenes = await mockSmartHomeService.getScenes();
    const controlGroup = buildSceneControlGroup(scenes, vi.fn());
    const searchGroup = buildSearchGroup(vi.fn());

    const goToIds = [...topBarModules, ...liveSecondaryModules, ...settingsModules, ...developerModules].map(
      (m) => m.path,
    );
    const comingSoonIds = comingSoonModules.map((m) => m.path);
    const actionIds = ['voice', 'chat'];
    const allIds = [
      ...goToIds,
      ...comingSoonIds,
      ...searchGroup.items.map((i) => i.id),
      ...(controlGroup?.items.map((i) => i.id) ?? []),
      ...actionIds,
    ];

    expect(new Set(allIds).size).toBe(allIds.length);
  });
});
