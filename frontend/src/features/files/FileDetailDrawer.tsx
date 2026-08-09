import { Trash2 } from 'lucide-react';
import {
  Button,
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  Spinner,
} from '../../design-system';
import type { FileEntry } from './filesService';
import { fileIcon, formatBytes, formatDateTime } from './filesFormat';

export interface FileDetailDrawerProps {
  entry: FileEntry | null;
  loading?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (entry: FileEntry) => void;
}

/** Metadata-only detail view for a single file (folders navigate instead of
 *  opening this drawer — see FileEntryRow). No content preview/viewer is
 *  rendered; this frontend has no real file bytes to show. */
export function FileDetailDrawer({ entry, loading, open, onOpenChange, onDelete }: FileDetailDrawerProps) {
  const Icon = entry ? fileIcon(entry) : null;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent side="right" className="w-full max-w-lg overflow-y-auto" data-testid="file-detail-drawer">
        {loading || !entry ? (
          <div className="flex flex-1 items-center justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            <DrawerHeader>
              <div className="flex items-center gap-2">
                {Icon && <Icon className="size-5 shrink-0 text-content-tertiary" aria-hidden />}
                <DrawerTitle>{entry.name}</DrawerTitle>
              </div>
              <DrawerDescription>{entry.mimeType ?? 'Unknown file type'}</DrawerDescription>
            </DrawerHeader>

            <div className="grid grid-cols-2 gap-3 text-body-sm">
              <div className="rounded-lg border border-line-subtle p-3">
                <div className="text-caption text-content-tertiary">Size</div>
                <div className="text-content">{formatBytes(entry.sizeBytes)}</div>
              </div>
              <div className="rounded-lg border border-line-subtle p-3">
                <div className="text-caption text-content-tertiary">Type</div>
                <div className="truncate text-content" title={entry.mimeType}>
                  {entry.mimeType ?? '—'}
                </div>
              </div>
            </div>

            <section className="flex flex-col gap-2">
              <h3 className="text-body-sm font-semibold text-content">Timeline</h3>
              <p className="rounded-lg border border-line-subtle p-3 text-body-sm text-content-secondary">
                Created {formatDateTime(entry.createdAt)} · Updated {formatDateTime(entry.updatedAt)}
              </p>
            </section>

            <div className="mt-auto flex items-center gap-2 border-t border-line-subtle pt-4">
              <Button
                variant="danger"
                leftIcon={<Trash2 className="size-4" />}
                onClick={() => onDelete(entry)}
                className="ml-auto"
                data-testid="file-delete-trigger"
              >
                Delete
              </Button>
            </div>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}
