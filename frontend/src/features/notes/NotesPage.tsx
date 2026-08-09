import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Pin, Plus, StickyNote, Tags } from 'lucide-react';
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
import { getNotesService, type Note, type NoteInput } from './notesService';
import { NoteRow } from './NoteRow';
import { NoteDetailDrawer } from './NoteDetailDrawer';
import { NoteForm } from './NoteForm';

type FormMode = { mode: 'create' } | { mode: 'edit'; note: Note } | null;
type TagFilter = string | 'all';

function matches(note: Note, term: string): boolean {
  const haystack = `${note.title} ${note.content} ${note.tags.join(' ')}`.toLowerCase();
  return haystack.includes(term);
}

/** Pinned notes first, then most recently updated. */
function sortNotes(a: Note, b: Note): number {
  if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
  return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
}

export function NotesPage() {
  const service = useMemo(() => getNotesService(), []);
  const list = useAsync<Note[]>((signal) => service.getNotes(signal));
  const location = useLocation();
  const { toast } = useToast();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [formState, setFormState] = useState<FormMode>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Note | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [tagFilter, setTagFilter] = useState<TagFilter>('all');

  // Local, patchable copy of the list — mirrors AutomationsPage/AiAppsPage so
  // a pin/create/edit/delete never flashes the whole page back to a loading
  // spinner.
  const [notes, setNotes] = useState<Note[]>([]);
  useEffect(() => {
    if (list.data) setNotes(list.data);
  }, [list.data]);

  // Deep-link support (mirrors AutomationsPage/KnowledgePage/AiAppsPage):
  // Universal Search navigates here with `state: { noteId }` when a note
  // result is selected, so it can open straight to that note's drawer.
  const consumedDeepLink = useRef(false);
  useEffect(() => {
    const noteId = (location.state as { noteId?: string } | null)?.noteId;
    if (!noteId || consumedDeepLink.current) return;
    if (notes.some((n) => n.id === noteId)) {
      consumedDeepLink.current = true;
      setSelectedId(noteId);
      window.history.replaceState({}, '');
    }
  }, [location.state, notes]);

  const selected = selectedId ? notes.find((n) => n.id === selectedId) ?? null : null;

  const pageStatus = !service.ready
    ? 'unavailable'
    : list.status === 'ready' && notes.length === 0
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

  const patchNote = (updated: Note) => setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));

  const handleTogglePin = (id: string, pinned: boolean) => {
    const note = notes.find((n) => n.id === id);
    void withPending(id, async () => {
      try {
        const updated = await service.setPinned(id, pinned);
        patchNote(updated);
        toast({
          title: pinned ? 'Note pinned' : 'Note unpinned',
          description: note?.title,
        });
      } catch (err) {
        toast({
          title: 'Could not update note',
          description: err instanceof Error ? err.message : String(err),
          variant: 'danger',
        });
      }
    });
  };

  const handleCreate = () => setFormState({ mode: 'create' });
  const handleEdit = (note: Note) => setFormState({ mode: 'edit', note });

  const handleFormSubmit = async (input: NoteInput) => {
    setFormSubmitting(true);
    try {
      if (formState?.mode === 'edit') {
        const updated = await service.updateNote(formState.note.id, input);
        patchNote(updated);
        toast({ title: 'Note updated', description: input.title, variant: 'success' });
      } else {
        const created = await service.createNote(input);
        setNotes((prev) => [created, ...prev]);
        toast({ title: 'Note created', description: input.title, variant: 'success' });
      }
      setFormState(null);
    } catch (err) {
      toast({
        title: 'Could not save note',
        description: err instanceof Error ? err.message : String(err),
        variant: 'danger',
      });
    } finally {
      setFormSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await service.deleteNote(deleteTarget.id);
      setNotes((prev) => prev.filter((n) => n.id !== deleteTarget.id));
      toast({ title: 'Note deleted', description: deleteTarget.title });
      setDeleteTarget(null);
      if (selectedId === deleteTarget.id) setSelectedId(null);
    } catch (err) {
      toast({
        title: 'Could not delete note',
        description: err instanceof Error ? err.message : String(err),
        variant: 'danger',
      });
    } finally {
      setDeleting(false);
    }
  };

  const allTags = useMemo(
    () => Array.from(new Set(notes.flatMap((n) => n.tags))).sort((a, b) => a.localeCompare(b)),
    [notes],
  );

  const term = filterText.trim().toLowerCase();
  const filtered = notes
    .filter((n) => (tagFilter === 'all' || n.tags.includes(tagFilter)) && (!term || matches(n, term)))
    .sort(sortNotes);

  const counts = {
    total: notes.length,
    pinned: notes.filter((n) => n.pinned).length,
    tags: allTags.length,
  };

  return (
    <>
      <ModulePage
        title="Notes"
        description={
          service.ready
            ? 'Quick personal notes. Data shown here is local to this frontend session.'
            : `${service.label} — note data is not connected yet.`
        }
        actions={
          <Button leftIcon={<Plus className="size-4" />} onClick={handleCreate} data-testid="note-create">
            New note
          </Button>
        }
        status={pageStatus}
        onRetry={list.reload}
        error={list.error}
        stateProps={
          pageStatus === 'empty'
            ? {
                title: 'No notes yet',
                description: 'Create your first note to start capturing ideas.',
                action: (
                  <Button leftIcon={<Plus className="size-4" />} onClick={handleCreate} data-testid="note-create-empty">
                    New note
                  </Button>
                ),
              }
            : undefined
        }
      >
        <div className="flex flex-col gap-6 pb-16" data-testid="notes-page">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <StatCard label="Total" value={counts.total} icon={<StickyNote />} />
            <StatCard label="Pinned" value={counts.pinned} icon={<Pin />} />
            <StatCard label="Tags" value={counts.tags} icon={<Tags />} />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Search
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              onClear={() => setFilterText('')}
              placeholder="Filter notes…"
              aria-label="Filter notes"
              data-testid="notes-filter-input"
              className="sm:max-w-sm"
            />
            <Select value={tagFilter} onValueChange={(v) => setTagFilter(v)}>
              <SelectTrigger aria-label="Filter by tag" className="sm:w-[180px]" data-testid="notes-tag-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All tags</SelectItem>
                {allTags.map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Widget
            title="Notes"
            icon={<StickyNote />}
            status={filtered.length === 0 ? 'empty' : 'ready'}
            emptyTitle="No matching notes"
            emptyDescription="Try a different search term or tag filter."
          >
            <List className="divide-y divide-line-subtle" data-testid="notes-list">
              {filtered.map((note) => (
                <NoteRow
                  key={note.id}
                  note={note}
                  onOpen={setSelectedId}
                  onTogglePin={handleTogglePin}
                  pinning={pendingIds.has(note.id)}
                />
              ))}
            </List>
          </Widget>
        </div>
      </ModulePage>

      <NoteDetailDrawer
        note={selected}
        open={selectedId !== null}
        onOpenChange={(open) => !open && setSelectedId(null)}
        onEdit={(note) => {
          setSelectedId(null);
          handleEdit(note);
        }}
        onDelete={(note) => setDeleteTarget(note)}
        onTogglePin={(note) => handleTogglePin(note.id, !note.pinned)}
        busy={selected ? pendingIds.has(selected.id) : false}
      />

      <Modal open={formState !== null} onOpenChange={(open) => !open && setFormState(null)}>
        <ModalContent size="lg" data-testid="note-form-modal">
          <ModalHeader>
            <ModalTitle>{formState?.mode === 'edit' ? 'Edit note' : 'New note'}</ModalTitle>
            <ModalDescription>Write down whatever you need to remember.</ModalDescription>
          </ModalHeader>
          <NoteForm
            initial={formState?.mode === 'edit' ? formState.note : undefined}
            submitLabel={formState?.mode === 'edit' ? 'Save changes' : 'Create note'}
            onSubmit={handleFormSubmit}
            onCancel={() => setFormState(null)}
            submitting={formSubmitting}
          />
        </ModalContent>
      </Modal>

      <Modal open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <ModalContent size="sm" data-testid="note-delete-modal">
          <ModalHeader>
            <ModalTitle>Delete note?</ModalTitle>
            <ModalDescription>
              {deleteTarget
                ? `"${deleteTarget.title || 'Untitled note'}" will be permanently deleted. This cannot be undone.`
                : ''}
            </ModalDescription>
          </ModalHeader>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="danger" loading={deleting} onClick={confirmDelete} data-testid="note-delete-confirm">
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
