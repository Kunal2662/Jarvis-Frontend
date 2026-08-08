import { describe, expect, it } from 'vitest';
import { modules, secondaryModules, topBarModules } from '../modules';

/**
 * These invariants enforce the single-workspace navigation architecture AND the
 * Core-alignment rules (docs/JARVIS_CORE_FRONTEND_MAPPING.md): the primary strip
 * stays lean and current, and future/placeholder surfaces never masquerade as
 * production-ready.
 */
describe('module registry invariants', () => {
  it('has at most 10 top-bar surfaces', () => {
    expect(topBarModules.length).toBeLessThanOrEqual(10);
  });

  it('every top-bar surface is for everyone, and any non-live one is clearly badged', () => {
    for (const m of topBarModules) {
      expect(m.audience, `${m.label} must be audience 'everyone'`).toBe('everyone');
      if (m.status !== 'live') {
        expect(m.badge, `planned top-bar surface ${m.label} must carry a marker badge`).toBeTruthy();
      }
    }
  });

  it('no top-bar label uses forbidden infrastructure vocabulary', () => {
    const forbidden = [
      'vector', 'embedding', 'knowledge graph', 'prompt', 'mcp',
      'tool registry', 'context window', 'token', 'provider', 'api key',
      'plugin', 'model', 'retrieval', 'recall',
    ];
    for (const m of topBarModules) {
      const label = m.label.toLowerCase();
      for (const term of forbidden) {
        expect(label.includes(term), `${m.label} contains forbidden term "${term}"`).toBe(false);
      }
    }
  });

  it('every module declares an honest capability status', () => {
    for (const m of modules) {
      expect(['live', 'planned'], `${m.label} has an invalid status`).toContain(m.status);
    }
  });

  it('secondary (future) surfaces are placeholders for everyone, never live', () => {
    for (const m of secondaryModules) {
      expect(m.status, `${m.label} is secondary and must be 'planned'`).toBe('planned');
      expect(m.audience, `${m.label} must remain reachable by everyone`).toBe('everyone');
      expect(m.ready, `${m.label} placeholder must not claim a real page`).toBeFalsy();
    }
  });

  it('has no duplicate paths', () => {
    const paths = modules.map((m) => m.path);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it('every redirectFrom is unique and never shadows a real module path (no loops)', () => {
    const paths = new Set(modules.map((m) => m.path));
    const seen = new Set<string>();
    for (const m of modules) {
      for (const from of m.redirectFrom ?? []) {
        expect(paths.has(from), `redirect "${from}" collides with a real path`).toBe(false);
        expect(seen.has(from), `redirect "${from}" declared more than once`).toBe(false);
        seen.add(from);
      }
    }
  });

  it('all canonical routes still resolve to a module (no broken deep links)', () => {
    const canonical = [
      '/', '/chat', '/voice', '/notes', '/calendar', '/tasks',
      '/files', '/apps', '/automations', '/settings', '/design',
    ];
    const paths = new Set(modules.map((m) => m.path));
    for (const p of canonical) {
      expect(paths.has(p), `canonical route "${p}" is missing from the registry`).toBe(true);
    }
  });
});
