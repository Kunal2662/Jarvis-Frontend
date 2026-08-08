import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { CheckCircle2, Plug, Sparkles, Wrench } from 'lucide-react';
import {
  ModulePage,
  Search,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  StatCard,
  useAsync,
  useToast,
  Widget,
} from '../../design-system';
import { getAiAppsService, type AiApp, type AiAppCategory } from './aiAppsService';
import { AiAppCard } from './AiAppCard';
import { AiAppDetailDrawer } from './AiAppDetailDrawer';

type CategoryFilter = AiAppCategory | 'all';

const CATEGORY_FILTER_OPTIONS: { value: CategoryFilter; label: string }[] = [
  { value: 'all', label: 'All apps' },
  { value: 'mcp-tool', label: 'MCP tools' },
  { value: 'connector', label: 'Connectors' },
];

function matches(app: AiApp, term: string): boolean {
  const haystack = `${app.name} ${app.description} ${app.provider}`.toLowerCase();
  return haystack.includes(term);
}

export function AiAppsPage() {
  const service = useMemo(() => getAiAppsService(), []);
  const list = useAsync<AiApp[]>((signal) => service.getApps(signal));
  const location = useLocation();
  const { toast } = useToast();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [filterText, setFilterText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');

  // Local, patchable copy of the list. Mutations update this in place instead
  // of re-fetching, so a connect/disconnect toggle never flashes the whole
  // page back to a full loading spinner (mirrors AutomationsPage.tsx).
  const [apps, setApps] = useState<AiApp[]>([]);
  useEffect(() => {
    if (list.data) setApps(list.data);
  }, [list.data]);

  // Deep-link support (mirrors AutomationsPage/KnowledgePage): Universal
  // Search navigates here with `state: { aiAppId }` when an AI App result is
  // selected, so it can open straight to that app's detail drawer.
  const consumedDeepLink = useRef(false);
  useEffect(() => {
    const aiAppId = (location.state as { aiAppId?: string } | null)?.aiAppId;
    if (!aiAppId || consumedDeepLink.current) return;
    if (apps.some((a) => a.id === aiAppId)) {
      consumedDeepLink.current = true;
      setSelectedId(aiAppId);
      window.history.replaceState({}, '');
    }
  }, [location.state, apps]);

  const selected = selectedId ? apps.find((a) => a.id === selectedId) ?? null : null;

  const pageStatus = !service.ready
    ? 'unavailable'
    : list.status === 'ready' && apps.length === 0
      ? 'empty'
      : list.status;

  const withPending = useCallback((id: string, fn: () => Promise<void>) => {
    setPendingIds((prev) => new Set(prev).add(id));
    return fn().finally(() => {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    });
  }, []);

  const patchApp = (updated: AiApp) => setApps((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));

  const handleToggle = (id: string, connected: boolean) => {
    const app = apps.find((a) => a.id === id);
    void withPending(id, async () => {
      try {
        const updated = await service.setConnected(id, connected);
        patchApp(updated);
        toast({
          title: connected ? 'Connected (local/mock)' : 'Disconnected',
          description: app?.name,
          variant: connected ? 'success' : 'info',
        });
      } catch (err) {
        toast({
          title: 'Could not update connection',
          description: err instanceof Error ? err.message : String(err),
          variant: 'danger',
        });
      }
    });
  };

  const term = filterText.trim().toLowerCase();
  const filtered = apps.filter(
    (a) => (categoryFilter === 'all' || a.category === categoryFilter) && (!term || matches(a, term)),
  );

  const counts = {
    total: apps.length,
    connected: apps.filter((a) => a.connectionStatus === 'connected').length,
    mcpTools: apps.filter((a) => a.category === 'mcp-tool').length,
    connectors: apps.filter((a) => a.category === 'connector').length,
  };

  return (
    <>
      <ModulePage
        title="AI Apps"
        description={
          service.ready
            ? 'Tools Jarvis can call and third-party connectors it can use. Connections shown here are local to this frontend session — no real account is ever linked.'
            : `${service.label} — AI Apps data is not connected yet.`
        }
        status={pageStatus}
        onRetry={list.reload}
        error={list.error}
        stateProps={
          pageStatus === 'empty'
            ? {
                title: 'No AI Apps available',
                description: 'MCP tools and integration connectors will appear here once available.',
              }
            : undefined
        }
      >
        <div className="flex flex-col gap-6 pb-16" data-testid="ai-apps-page">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Total" value={counts.total} icon={<Sparkles />} />
            <StatCard label="Connected" value={counts.connected} icon={<CheckCircle2 />} />
            <StatCard label="MCP tools" value={counts.mcpTools} icon={<Wrench />} />
            <StatCard label="Connectors" value={counts.connectors} icon={<Plug />} />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Search
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              onClear={() => setFilterText('')}
              placeholder="Filter AI Apps…"
              aria-label="Filter AI Apps"
              data-testid="ai-apps-filter-input"
              className="sm:max-w-sm"
            />
            <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as CategoryFilter)}>
              <SelectTrigger aria-label="Filter by category" className="sm:w-[180px]" data-testid="ai-apps-category-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_FILTER_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Widget
            title="Catalog"
            icon={<Sparkles />}
            status={filtered.length === 0 ? 'empty' : 'ready'}
            emptyTitle="No matching AI Apps"
            emptyDescription="Try a different search term or category filter."
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3" data-testid="ai-apps-list">
              {filtered.map((app) => (
                <AiAppCard
                  key={app.id}
                  app={app}
                  onOpen={setSelectedId}
                  onToggle={handleToggle}
                  toggling={pendingIds.has(app.id)}
                />
              ))}
            </div>
          </Widget>
        </div>
      </ModulePage>

      <AiAppDetailDrawer
        app={selected}
        open={selectedId !== null}
        onOpenChange={(open) => !open && setSelectedId(null)}
        onToggle={handleToggle}
        busy={selected ? pendingIds.has(selected.id) : false}
      />
    </>
  );
}
