import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AlertTriangle, Brain, Cpu, Heart, MapPin, Repeat, Signpost } from 'lucide-react';
import {
  Button,
  List,
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
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
import { getMemoryService, type Memory, type MemoryType } from './memoryService';
import { MemoryRow } from './MemoryRow';
import { MemoryDetailDrawer } from './MemoryDetailDrawer';

type TypeFilter = MemoryType | 'all';

const TYPE_FILTER_OPTIONS: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: 'All types' },
  { value: 'Preference', label: 'Preference' },
  { value: 'Context', label: 'Context' },
  { value: 'Device', label: 'Device' },
  { value: 'Routine', label: 'Routine' },
  { value: 'Instruction', label: 'Instruction' },
];

function matches(memory: Memory, term: string): boolean {
  return memory.content.toLowerCase().includes(term);
}

/**
 * Memory — a read-only recall list + detail + forget surface (roadmap item
 * 16). Per docs/CORE_MEMORY_CONTRACT_REQUIRED.md, this is deliberately NOT
 * a place to author or edit a memory's content (a memory represents
 * something JARVIS itself formed from a conversation), and search here is
 * honest local substring filtering — never semantic/vector retrieval. The
 * one write action is Forget, entirely local to this mock.
 */
export function MemoryPage() {
  const service = useMemo(() => getMemoryService(), []);
  const location = useLocation();
  const { toast } = useToast();

  const list = useAsync<Memory[]>((signal) => service.getMemories(signal));

  const [memories, setMemories] = useState<Memory[]>([]);
  useEffect(() => {
    if (list.data) setMemories(list.data);
  }, [list.data]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [forgetTarget, setForgetTarget] = useState<Memory | null>(null);
  const [forgetting, setForgetting] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');

  const selected = selectedId ? (memories.find((m) => m.id === selectedId) ?? null) : null;

  // Deep-link support (mirrors KnowledgePage/DeviceManagementPage): Universal
  // Search navigates here with `state: { memoryId }`.
  const consumedDeepLink = useRef(false);
  useEffect(() => {
    if (consumedDeepLink.current || !list.data) return;
    const memoryId = (location.state as { memoryId?: string } | null)?.memoryId;
    if (!memoryId) return;
    if (memories.some((m) => m.id === memoryId)) {
      consumedDeepLink.current = true;
      setSelectedId(memoryId);
      window.history.replaceState({}, '');
    }
  }, [location.state, list.data, memories]);

  const pageStatus = !service.ready
    ? 'unavailable'
    : list.status === 'ready' && memories.length === 0
      ? 'empty'
      : list.status;

  const term = filterText.trim().toLowerCase();
  const filtered = memories
    .filter((m) => typeFilter === 'all' || m.type === typeFilter)
    .filter((m) => !term || matches(m, term))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const counts = {
    total: memories.length,
    preference: memories.filter((m) => m.type === 'Preference').length,
    routine: memories.filter((m) => m.type === 'Routine').length,
    instruction: memories.filter((m) => m.type === 'Instruction').length,
    context: memories.filter((m) => m.type === 'Context' || m.type === 'Device').length,
  };

  const confirmForget = async () => {
    if (!forgetTarget) return;
    setForgetting(true);
    try {
      await service.forgetMemory(forgetTarget.id);
      setMemories((prev) => prev.filter((m) => m.id !== forgetTarget.id));
      toast({ title: 'Memory forgotten' });
      setForgetTarget(null);
      if (selectedId === forgetTarget.id) setSelectedId(null);
    } catch (err) {
      toast({
        title: 'Could not forget this memory',
        description: err instanceof Error ? err.message : String(err),
        variant: 'danger',
      });
    } finally {
      setForgetting(false);
    }
  };

  return (
    <>
      <ModulePage
        title="Memory"
        description={
          service.ready
            ? 'Things Jarvis remembers about your preferences, routines, and context. Data shown here is local development memory, not real Core-formed memory.'
            : `${service.label} — memory data is not connected yet.`
        }
        status={pageStatus}
        onRetry={list.reload}
        error={list.error}
        stateProps={
          pageStatus === 'empty'
            ? {
                title: 'Nothing remembered yet',
                description: 'Memories Jarvis forms from Chat and Voice conversations will appear here once available.',
              }
            : undefined
        }
      >
        <div className="flex flex-col gap-6 pb-16" data-testid="memory-page">
          <div
            className="flex items-start gap-3 rounded-lg border border-warning/40 bg-warning-soft p-4"
            role="note"
            data-testid="memory-simulation-banner"
          >
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden="true" />
            <div className="flex flex-col gap-0.5">
              <span className="text-body-sm font-semibold text-content">
                Local development memory — not a real Core memory service
              </span>
              <span className="text-body-sm text-content-secondary">
                Every memory shown here is simulated and local to this browser tab. Search is simple local
                filtering, never semantic or vector retrieval. Forgetting a memory removes it from this local
                data only.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <StatCard label="Total" value={counts.total} icon={<Brain />} />
            <StatCard label="Preferences" value={counts.preference} icon={<Heart />} />
            <StatCard label="Routines" value={counts.routine} icon={<Repeat />} />
            <StatCard label="Instructions" value={counts.instruction} icon={<Signpost />} />
            <StatCard label="Context & devices" value={counts.context} icon={<MapPin />} />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Search
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              onClear={() => setFilterText('')}
              placeholder="Search memories…"
              aria-label="Search memories"
              data-testid="memory-filter-input"
              className="sm:max-w-sm"
            />
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as TypeFilter)}>
              <SelectTrigger aria-label="Filter by type" className="sm:w-[180px]" data-testid="memory-type-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPE_FILTER_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Widget
            title="Remembered"
            icon={<Cpu />}
            status={filtered.length === 0 ? 'empty' : 'ready'}
            emptyTitle="No matching memories"
            emptyDescription="Try a different search term or type filter."
          >
            <List className="divide-y divide-line-subtle" data-testid="memory-list">
              {filtered.map((memory) => (
                <MemoryRow key={memory.id} memory={memory} onOpen={setSelectedId} />
              ))}
            </List>
          </Widget>
        </div>
      </ModulePage>

      <MemoryDetailDrawer
        memory={selected}
        open={selectedId !== null}
        onOpenChange={(open) => !open && setSelectedId(null)}
        onForget={(memory) => setForgetTarget(memory)}
      />

      <Modal open={forgetTarget !== null} onOpenChange={(open) => !open && setForgetTarget(null)}>
        <ModalContent size="sm" data-testid="memory-forget-modal">
          <ModalHeader>
            <ModalTitle>Forget this memory?</ModalTitle>
            <ModalDescription>This memory will be removed from local development data.</ModalDescription>
          </ModalHeader>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setForgetTarget(null)}>
              Cancel
            </Button>
            <Button variant="danger" loading={forgetting} onClick={confirmForget} data-testid="memory-forget-confirm">
              Forget
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
