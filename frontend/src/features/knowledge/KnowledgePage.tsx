import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { BookOpen, FileText, Globe, Library, MessageSquare, StickyNote } from 'lucide-react';
import {
  List,
  ModulePage,
  Search,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  StatCard,
  useAsync,
  Widget,
} from '../../design-system';
import { getKnowledgeService, type KnowledgeItem, type KnowledgeSourceType } from './knowledgeService';
import { KnowledgeItemRow } from './KnowledgeItemRow';
import { KnowledgeDetailDrawer } from './KnowledgeDetailDrawer';

type SourceFilter = KnowledgeSourceType | 'all';

const SOURCE_FILTER_OPTIONS: { value: SourceFilter; label: string }[] = [
  { value: 'all', label: 'All sources' },
  { value: 'chat-memory', label: 'Chat memory' },
  { value: 'file', label: 'File' },
  { value: 'note', label: 'Note' },
  { value: 'web', label: 'Web' },
];

function matches(item: KnowledgeItem, term: string): boolean {
  const haystack = `${item.title} ${item.snippet} ${item.tags.join(' ')}`.toLowerCase();
  return haystack.includes(term);
}

export function KnowledgePage() {
  const service = useMemo(() => getKnowledgeService(), []);
  const list = useAsync<KnowledgeItem[]>((signal) => service.getKnowledgeItems(signal));
  const location = useLocation();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterText, setFilterText] = useState('');
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');

  // Memoized so this stays referentially stable across renders when
  // list.data hasn't changed (list.data ?? [] would otherwise create a new
  // array every render and retrigger the deep-link effect below).
  const items = useMemo(() => list.data ?? [], [list.data]);
  const selected = selectedId ? items.find((i) => i.id === selectedId) ?? null : null;

  // Deep-link support (mirrors AutomationsPage): Universal Search navigates
  // here with `state: { knowledgeId }` when a knowledge result is selected,
  // so it can open straight to that item's detail drawer.
  const consumedDeepLink = useRef(false);
  useEffect(() => {
    const knowledgeId = (location.state as { knowledgeId?: string } | null)?.knowledgeId;
    if (!knowledgeId || consumedDeepLink.current) return;
    if (items.some((i) => i.id === knowledgeId)) {
      consumedDeepLink.current = true;
      setSelectedId(knowledgeId);
      window.history.replaceState({}, '');
    }
  }, [location.state, items]);

  const pageStatus = !service.ready
    ? 'unavailable'
    : list.status === 'ready' && items.length === 0
      ? 'empty'
      : list.status;

  const term = filterText.trim().toLowerCase();
  const filtered = items.filter(
    (i) => (sourceFilter === 'all' || i.sourceType === sourceFilter) && (!term || matches(i, term)),
  );

  const counts = {
    total: items.length,
    file: items.filter((i) => i.sourceType === 'file').length,
    note: items.filter((i) => i.sourceType === 'note').length,
    web: items.filter((i) => i.sourceType === 'web').length,
    chatMemory: items.filter((i) => i.sourceType === 'chat-memory').length,
  };

  return (
    <>
      <ModulePage
        title="Knowledge"
        description={
          service.ready
            ? 'Browse documents Jarvis has ingested. Data shown here is local to this frontend session.'
            : `${service.label} — knowledge data is not connected yet.`
        }
        status={pageStatus}
        onRetry={list.reload}
        error={list.error}
        stateProps={
          pageStatus === 'empty'
            ? {
                title: 'No knowledge documents yet',
                description: 'Ingested chat memory, files, notes, and web sources will appear here once available.',
              }
            : undefined
        }
      >
        <div className="flex flex-col gap-6 pb-16" data-testid="knowledge-page">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <StatCard label="Total" value={counts.total} icon={<Library />} />
            <StatCard label="Files" value={counts.file} icon={<FileText />} />
            <StatCard label="Notes" value={counts.note} icon={<StickyNote />} />
            <StatCard label="Web" value={counts.web} icon={<Globe />} />
            <StatCard label="Chat memory" value={counts.chatMemory} icon={<MessageSquare />} />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Search
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              onClear={() => setFilterText('')}
              placeholder="Filter knowledge documents…"
              aria-label="Filter knowledge documents"
              data-testid="knowledge-filter-input"
              className="sm:max-w-sm"
            />
            <Select value={sourceFilter} onValueChange={(v) => setSourceFilter(v as SourceFilter)}>
              <SelectTrigger aria-label="Filter by source" className="sm:w-[180px]" data-testid="knowledge-source-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SOURCE_FILTER_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Widget
            title="Documents"
            icon={<BookOpen />}
            status={filtered.length === 0 ? 'empty' : 'ready'}
            emptyTitle="No matching documents"
            emptyDescription="Try a different search term or source filter."
          >
            <List className="divide-y divide-line-subtle" data-testid="knowledge-list">
              {filtered.map((item) => (
                <KnowledgeItemRow key={item.id} item={item} onOpen={setSelectedId} />
              ))}
            </List>
          </Widget>
        </div>
      </ModulePage>

      <KnowledgeDetailDrawer
        item={selected}
        open={selectedId !== null}
        onOpenChange={(open) => !open && setSelectedId(null)}
      />
    </>
  );
}
