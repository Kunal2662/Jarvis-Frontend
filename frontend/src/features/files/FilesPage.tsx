import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FolderOpen, FolderPlus, Home, UploadCloud } from 'lucide-react';
import {
  Breadcrumb,
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
  StatCard,
  useAsync,
  useToast,
  Widget,
} from '../../design-system';
import { getFilesService, type FileEntry, type FilesService } from './filesService';
import { FileEntryRow } from './FileEntryRow';
import { FileDetailDrawer } from './FileDetailDrawer';
import { NewFolderForm } from './NewFolderForm';
import { AddFileForm, type AddFileFormValues } from './AddFileForm';
import { formatBytes } from './filesFormat';

interface Crumb {
  id: string | undefined;
  name: string;
}

const ROOT_CRUMB: Crumb = { id: undefined, name: 'Files' };

/** Walks a folder's ancestry up to the root via repeated `getFile` calls, so
 *  a deep link into a nested folder (from Universal Search) can render a
 *  correct breadcrumb without the user having clicked through it. */
async function buildAncestry(folderId: string, service: FilesService): Promise<Crumb[]> {
  const crumbs: Crumb[] = [];
  let currentId: string | undefined = folderId;
  while (currentId) {
    const entry: FileEntry = await service.getFile(currentId);
    crumbs.unshift({ id: entry.id, name: entry.name });
    currentId = entry.parentId;
  }
  return [ROOT_CRUMB, ...crumbs];
}

function matches(entry: FileEntry, term: string): boolean {
  return entry.name.toLowerCase().includes(term);
}

export function FilesPage() {
  const service = useMemo(() => getFilesService(), []);
  const routerLocation = useLocation();
  const { toast } = useToast();

  const [path, setPath] = useState<Crumb[]>([ROOT_CRUMB]);
  const currentFolderId = path[path.length - 1].id;

  const list = useAsync<FileEntry[]>((signal) => service.getFiles(currentFolderId, signal));
  const skipNextReload = useRef(true);
  useEffect(() => {
    if (skipNextReload.current) {
      skipNextReload.current = false;
      return;
    }
    list.reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFolderId]);

  const [entries, setEntries] = useState<FileEntry[]>([]);
  useEffect(() => {
    if (list.data) setEntries(list.data);
  }, [list.data]);

  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [pendingOpenFileId, setPendingOpenFileId] = useState<string | null>(null);
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [addFileOpen, setAddFileOpen] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FileEntry | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [filterText, setFilterText] = useState('');

  const selectedFile = selectedFileId ? entries.find((e) => e.id === selectedFileId) ?? null : null;

  // Deep-link support (mirrors NotesPage/TasksPage/CalendarPage): Universal
  // Search navigates here with `state: { folderId?, fileId? }` when a
  // file/folder result is selected — folderId is the containing folder (or
  // the folder itself for a folder result), fileId optionally highlights a
  // specific file within it.
  const consumedDeepLink = useRef(false);
  useEffect(() => {
    const state = (routerLocation.state as { folderId?: string; fileId?: string } | null) ?? null;
    if (!state || consumedDeepLink.current) return;
    if (!state.folderId && !state.fileId) return;
    consumedDeepLink.current = true;
    (async () => {
      if (state.folderId) {
        try {
          const crumbs = await buildAncestry(state.folderId, service);
          setPath(crumbs);
        } catch {
          // Folder no longer exists — stay at root rather than erroring the page.
        }
      }
      if (state.fileId) setPendingOpenFileId(state.fileId);
      window.history.replaceState({}, '');
    })();
  }, [routerLocation.state, service]);

  // Once the deep-linked folder's contents have loaded, open the target file.
  useEffect(() => {
    if (!pendingOpenFileId) return;
    if (entries.some((e) => e.id === pendingOpenFileId)) {
      setSelectedFileId(pendingOpenFileId);
      setPendingOpenFileId(null);
    }
  }, [entries, pendingOpenFileId]);

  const pageStatus = !service.ready
    ? 'unavailable'
    : list.status === 'ready' && entries.length === 0
      ? 'empty'
      : list.status;

  const openFolder = useCallback((folder: FileEntry) => {
    setFilterText('');
    setPath((prev) => [...prev, { id: folder.id, name: folder.name }]);
  }, []);

  const openFolderById = useCallback(
    (id: string) => {
      const folder = entries.find((e) => e.id === id);
      if (folder) openFolder(folder);
    },
    [entries, openFolder],
  );

  const goToCrumb = (index: number) => {
    setFilterText('');
    setPath((prev) => prev.slice(0, index + 1));
  };

  const handleCreateFolder = async (name: string) => {
    setFormSubmitting(true);
    try {
      const created = await service.createFolder({ name, parentId: currentFolderId });
      setEntries((prev) => [...prev, created]);
      toast({ title: 'Folder created', description: name, variant: 'success' });
      setNewFolderOpen(false);
    } catch (err) {
      toast({
        title: 'Could not create folder',
        description: err instanceof Error ? err.message : String(err),
        variant: 'danger',
      });
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleAddFile = async (values: AddFileFormValues) => {
    setFormSubmitting(true);
    try {
      const created = await service.uploadFile({ ...values, parentId: currentFolderId });
      setEntries((prev) => [...prev, created]);
      toast({ title: 'File added', description: `${values.name} (mock — not a real upload)`, variant: 'success' });
      setAddFileOpen(false);
    } catch (err) {
      toast({
        title: 'Could not add file',
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
      await service.deleteFile(deleteTarget.id);
      setEntries((prev) => prev.filter((e) => e.id !== deleteTarget.id));
      toast({ title: deleteTarget.type === 'folder' ? 'Folder deleted' : 'File deleted', description: deleteTarget.name });
      setDeleteTarget(null);
      if (selectedFileId === deleteTarget.id) setSelectedFileId(null);
    } catch (err) {
      toast({
        title: 'Could not delete',
        description: err instanceof Error ? err.message : String(err),
        variant: 'danger',
      });
    } finally {
      setDeleting(false);
    }
  };

  const term = filterText.trim().toLowerCase();
  const filtered = entries
    .filter((e) => !term || matches(e, term))
    .sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'folder' ? -1 : 1));

  const counts = {
    folders: entries.filter((e) => e.type === 'folder').length,
    files: entries.filter((e) => e.type === 'file').length,
    totalSize: entries.filter((e) => e.type === 'file').reduce((sum, e) => sum + (e.sizeBytes ?? 0), 0),
  };

  const breadcrumb = (
    <div data-testid="files-breadcrumb">
      <Breadcrumb
        items={path.map((crumb, index) => ({
          label: crumb.name,
          icon: index === 0 ? <Home className="size-3.5" /> : undefined,
          onClick: index === path.length - 1 ? undefined : () => goToCrumb(index),
        }))}
      />
    </div>
  );

  return (
    <>
      <ModulePage
        title="Files"
        description={
          service.ready
            ? "JARVIS's own local file browser — metadata only, no real storage or upload yet. Data shown here is local to this frontend session."
            : `${service.label} — file data is not connected yet.`
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              leftIcon={<FolderPlus className="size-4" />}
              onClick={() => setNewFolderOpen(true)}
              data-testid="files-new-folder"
            >
              New folder
            </Button>
            <Button
              leftIcon={<UploadCloud className="size-4" />}
              onClick={() => setAddFileOpen(true)}
              data-testid="files-add-file"
            >
              Add file
            </Button>
          </div>
        }
        toolbar={breadcrumb}
        status={pageStatus}
        onRetry={list.reload}
        error={list.error}
        stateProps={
          pageStatus === 'empty'
            ? {
                title: 'This folder is empty',
                description: 'Create a folder or add a file to get started.',
                action: (
                  <Button
                    leftIcon={<FolderPlus className="size-4" />}
                    onClick={() => setNewFolderOpen(true)}
                    data-testid="files-new-folder-empty"
                  >
                    New folder
                  </Button>
                ),
              }
            : undefined
        }
      >
        <div className="flex flex-col gap-6 pb-16" data-testid="files-page">
          <div className="grid grid-cols-3 gap-4">
            <StatCard label="Folders" value={counts.folders} icon={<FolderOpen />} />
            <StatCard label="Files" value={counts.files} icon={<FolderOpen />} />
            <StatCard label="Total size" value={formatBytes(counts.totalSize)} icon={<FolderOpen />} />
          </div>

          <Search
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            onClear={() => setFilterText('')}
            placeholder="Filter this folder…"
            aria-label="Filter files and folders"
            data-testid="files-filter-input"
            className="sm:max-w-sm"
          />

          <Widget
            title="Contents"
            icon={<FolderOpen />}
            status={filtered.length === 0 ? 'empty' : 'ready'}
            emptyTitle="No matching items"
            emptyDescription="Try a different search term."
          >
            <List className="divide-y divide-line-subtle" data-testid="files-list">
              {filtered.map((entry) => (
                <FileEntryRow
                  key={entry.id}
                  entry={entry}
                  onOpenFolder={openFolderById}
                  onOpenFile={setSelectedFileId}
                  onDelete={setDeleteTarget}
                />
              ))}
            </List>
          </Widget>
        </div>
      </ModulePage>

      <FileDetailDrawer
        entry={selectedFile}
        open={selectedFileId !== null}
        onOpenChange={(open) => !open && setSelectedFileId(null)}
        onDelete={(entry) => setDeleteTarget(entry)}
      />

      <Modal open={newFolderOpen} onOpenChange={setNewFolderOpen}>
        <ModalContent size="sm" data-testid="new-folder-modal">
          <ModalHeader>
            <ModalTitle>New folder</ModalTitle>
            <ModalDescription>Create a folder inside {path[path.length - 1].name}.</ModalDescription>
          </ModalHeader>
          <NewFolderForm onSubmit={handleCreateFolder} onCancel={() => setNewFolderOpen(false)} submitting={formSubmitting} />
        </ModalContent>
      </Modal>

      <Modal open={addFileOpen} onOpenChange={setAddFileOpen}>
        <ModalContent size="sm" data-testid="add-file-modal">
          <ModalHeader>
            <ModalTitle>Add file</ModalTitle>
            <ModalDescription>Add a placeholder file to {path[path.length - 1].name}.</ModalDescription>
          </ModalHeader>
          <AddFileForm onSubmit={handleAddFile} onCancel={() => setAddFileOpen(false)} submitting={formSubmitting} />
        </ModalContent>
      </Modal>

      <Modal open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <ModalContent size="sm" data-testid="file-delete-modal">
          <ModalHeader>
            <ModalTitle>{deleteTarget?.type === 'folder' ? 'Delete folder?' : 'Delete file?'}</ModalTitle>
            <ModalDescription>
              {deleteTarget
                ? deleteTarget.type === 'folder'
                  ? `"${deleteTarget.name}" and everything inside it will be permanently deleted. This cannot be undone.`
                  : `"${deleteTarget.name}" will be permanently deleted. This cannot be undone.`
                : ''}
            </ModalDescription>
          </ModalHeader>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="danger" loading={deleting} onClick={confirmDelete} data-testid="file-delete-confirm">
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
