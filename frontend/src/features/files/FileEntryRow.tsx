import { ChevronRight, Folder, Trash2 } from 'lucide-react';
import { IconButton, ListRow } from '../../design-system';
import type { FileEntry } from './filesService';
import { fileIcon, formatBytes, formatDateTime } from './filesFormat';

export interface FileEntryRowProps {
  entry: FileEntry;
  onOpenFolder: (id: string) => void;
  onOpenFile: (id: string) => void;
  onDelete: (entry: FileEntry) => void;
}

/** A single browsable file/folder row (List/ListRow — a better fit for a
 *  file browser than a card grid, mirroring KnowledgeItemRow.tsx). Clicking
 *  a folder navigates into it; clicking a file opens its metadata drawer.
 *  Delete is always available inline since navigating away from the row
 *  (into a folder) would otherwise leave no way to reach it. */
export function FileEntryRow({ entry, onOpenFolder, onOpenFile, onDelete }: FileEntryRowProps) {
  const isFolder = entry.type === 'folder';
  const Icon = isFolder ? Folder : fileIcon(entry);
  const open = () => (isFolder ? onOpenFolder(entry.id) : onOpenFile(entry.id));

  return (
    <ListRow
      leading={<Icon />}
      title={entry.name}
      subtitle={isFolder ? 'Folder' : formatBytes(entry.sizeBytes)}
      trailing={
        <span className="flex items-center gap-2">
          <span className="hidden whitespace-nowrap text-caption text-content-tertiary sm:inline">
            {formatDateTime(entry.updatedAt)}
          </span>
          <IconButton
            label={`Delete ${entry.name}`}
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(entry);
            }}
            data-testid={`file-delete-${entry.id}`}
          >
            <Trash2 className="size-4" />
          </IconButton>
          {isFolder && <ChevronRight className="size-4 shrink-0 text-content-tertiary" aria-hidden />}
        </span>
      }
      role="button"
      tabIndex={0}
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          open();
        }
      }}
      data-testid={`file-row-${entry.id}`}
      aria-label={isFolder ? `Open folder ${entry.name}` : `Open ${entry.name}`}
    />
  );
}
