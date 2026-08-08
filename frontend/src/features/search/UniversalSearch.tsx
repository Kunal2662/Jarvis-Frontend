import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, MessageSquare, Search as SearchIcon, Sparkles, Workflow, type LucideIcon } from 'lucide-react';
import { Kbd, SearchOverlay, StateView, type UIStatus } from '../../design-system';
import { moduleByPath } from '../../app/modules';
import { getSearchService, type SearchResult, type SearchResultGroup } from './searchService';
import { clearRecentSearches, loadRecentSearches, pushRecentSearch } from './searchHistory';

export interface UniversalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Opens the live VoiceOverlay — Voice is an overlay, not a route, so a
   *  "Voice" result must trigger this instead of navigating (mirrors
   *  AppLayout's `selectModule` handling of `ModuleDef.action === 'voice'`). */
  onOpenVoice?: () => void;
}

const DEBOUNCE_MS = 250;

function resultIcon(result: SearchResult): LucideIcon {
  if (result.category === 'automation') return Workflow;
  if (result.category === 'chat') return MessageSquare;
  if (result.category === 'knowledge') return BookOpen;
  if (result.category === 'ai-app') return Sparkles;
  return moduleByPath(result.path)?.icon ?? SearchIcon;
}

/**
 * Wires the presentational, design-system `SearchOverlay` (input + children
 * slot) to real search behaviour via `SearchService`. This is the only place
 * that knows about search state machinery, grouping/keyboard nav, and result
 * navigation — `SearchOverlay` itself stays a generic, reusable glass modal
 * shell (see design-system/patterns/SearchOverlay).
 */
export function UniversalSearch({ open, onOpenChange, onOpenVoice }: UniversalSearchProps) {
  const navigate = useNavigate();
  const service = useMemo(() => getSearchService(), []);

  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [status, setStatus] = useState<UIStatus>('idle');
  const [groups, setGroups] = useState<SearchResultGroup[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | undefined>();
  const [activeIndex, setActiveIndex] = useState(0);
  const [recents, setRecents] = useState<string[]>([]);
  const controllerRef = useRef<AbortController | null>(null);

  // Reset transient state each time the overlay opens, and load recents fresh.
  useEffect(() => {
    if (!open) return;
    setQuery('');
    setDebounced('');
    setStatus('idle');
    setGroups([]);
    setActiveIndex(0);
    setRecents(loadRecentSearches());
  }, [open]);

  // Debounce keystrokes before triggering the (simulated) search call — the
  // visible input value updates immediately via SearchOverlay's own state.
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    controllerRef.current?.abort();

    if (!service.ready) {
      setStatus('unavailable');
      setGroups([]);
      return;
    }
    if (!debounced) {
      setStatus('idle');
      setGroups([]);
      return;
    }

    const controller = new AbortController();
    controllerRef.current = controller;
    setStatus('loading');

    service.search(debounced, controller.signal).then(
      (result) => {
        if (controller.signal.aborted) return;
        setGroups(result);
        setActiveIndex(0);
        const total = result.reduce((n, g) => n + g.results.length, 0);
        setStatus(total === 0 ? 'empty' : 'ready');
        setRecents(pushRecentSearch(debounced));
      },
      (err: unknown) => {
        if (controller.signal.aborted) return;
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setErrorMsg(err instanceof Error ? err.message : String(err));
        setStatus('error');
      },
    );

    return () => controller.abort();
  }, [debounced, service]);

  const flatResults = useMemo(() => groups.flatMap((g) => g.results), [groups]);

  const selectResult = useCallback(
    (result: SearchResult) => {
      if (result.action === 'voice') {
        onOpenVoice?.();
      } else {
        navigate(result.path, result.navState ? { state: result.navState } : undefined);
      }
      onOpenChange(false);
    },
    [navigate, onOpenChange, onOpenVoice],
  );

  // Arrow-key / Enter navigation over the flattened result list. Kept as a
  // window-level listener (same idea as useHotkey) so the generic
  // SearchOverlay input doesn't need to know about search semantics.
  useEffect(() => {
    if (!open || flatResults.length === 0) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % flatResults.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + flatResults.length) % flatResults.length);
      } else if (e.key === 'Enter') {
        const active = flatResults[activeIndex];
        if (active) {
          e.preventDefault();
          selectResult(active);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, flatResults, activeIndex, selectResult]);

  const activeResult = flatResults[activeIndex];
  const totalCount = flatResults.length;

  return (
    <SearchOverlay
      open={open}
      onOpenChange={onOpenChange}
      value={query}
      onValueChange={setQuery}
      placeholder="Search pages, automations, chat, knowledge, and AI Apps…"
      inputProps={{
        role: 'combobox',
        'aria-expanded': totalCount > 0,
        'aria-controls': 'universal-search-results',
        'aria-autocomplete': 'list',
        'aria-activedescendant': activeResult ? `search-result-${activeResult.id}` : undefined,
      }}
    >
      {/* Screen-reader-only result-count announcement. */}
      <div aria-live="polite" className="sr-only">
        {status === 'ready' && `${totalCount} result${totalCount === 1 ? '' : 's'} found`}
        {status === 'empty' && `No results for ${debounced}`}
      </div>

      <StateView
        status={status}
        compact
        loadingLabel="Searching…"
        title={status === 'empty' ? `No results for "${debounced}"` : undefined}
        description={
          status === 'empty'
            ? 'Try a different search term.'
            : status === 'unavailable'
              ? `${service.label} — real Core search is not connected yet.`
              : status === 'error'
                ? errorMsg
                : undefined
        }
      >
        {status === 'idle' ? (
          <div className="px-2 py-3" data-testid="search-idle-state">
            {recents.length > 0 ? (
              <>
                <div className="flex items-center justify-between px-1 pb-2">
                  <span className="text-overline uppercase text-content-tertiary">Recent searches</span>
                  <button
                    type="button"
                    onClick={() => setRecents(clearRecentSearches())}
                    className="text-caption text-content-tertiary hover:text-content"
                    data-testid="search-clear-recent"
                  >
                    Clear
                  </button>
                </div>
                <ul className="flex flex-col gap-0.5">
                  {recents.map((term) => (
                    <li key={term}>
                      <button
                        type="button"
                        onClick={() => setQuery(term)}
                        className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-body-sm text-content-secondary outline-none hover:bg-surface-hover hover:text-content"
                        data-testid={`search-recent-${term}`}
                      >
                        <Clock className="size-4 shrink-0 text-content-tertiary" />
                        <span className="truncate">{term}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="px-1 py-6 text-center text-body-sm text-content-tertiary">
                Search pages, automations, and your recent chat messages, plus your knowledge base and AI Apps.
              </p>
            )}
          </div>
        ) : (
          <div
            role="listbox"
            id="universal-search-results"
            aria-label={`Search results, ${totalCount} found`}
            className="flex flex-col gap-1 p-1"
            data-testid="search-results-list"
          >
            {groups.map((group) => (
              <div key={group.category}>
                <div className="px-2.5 py-1.5 text-overline uppercase text-content-tertiary">
                  {group.label}
                </div>
                {group.results.map((result) => {
                  const index = flatResults.indexOf(result);
                  const active = index === activeIndex;
                  const Icon = resultIcon(result);
                  return (
                    <div
                      key={result.id}
                      id={`search-result-${result.id}`}
                      role="option"
                      aria-selected={active}
                      tabIndex={-1}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => selectResult(result)}
                      data-testid={`search-result-${result.id}`}
                      className={`flex cursor-pointer select-none items-center gap-3 rounded-md px-2.5 py-2.5 text-body-sm text-content outline-none ${
                        active ? 'bg-surface-selected' : ''
                      }`}
                    >
                      <span className="shrink-0 text-content-tertiary [&_svg]:size-[18px]">
                        <Icon className="size-[18px]" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate">{result.title}</span>
                        {result.description && (
                          <span className="block truncate text-caption text-content-tertiary">
                            {result.description}
                          </span>
                        )}
                      </span>
                      {active && <Kbd>Enter</Kbd>}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </StateView>
    </SearchOverlay>
  );
}
