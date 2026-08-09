import { Pencil, Pin, PinOff, Trash2 } from 'lucide-react';
import {
  Badge,
  Button,
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  Spinner,
} from '../../design-system';
import type { Note } from './notesService';
import { formatDateTime } from './notesFormat';

export interface NoteDetailDrawerProps {
  note: Note | null;
  loading?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (note: Note) => void;
  onDelete: (note: Note) => void;
  onTogglePin: (note: Note) => void;
  busy?: boolean;
}

export function NoteDetailDrawer({
  note,
  loading,
  open,
  onOpenChange,
  onEdit,
  onDelete,
  onTogglePin,
  busy,
}: NoteDetailDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent side="right" className="w-full max-w-lg overflow-y-auto" data-testid="note-detail-drawer">
        {loading || !note ? (
          <div className="flex flex-1 items-center justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            <DrawerHeader>
              <div className="flex items-center gap-2">
                <DrawerTitle>{note.title || 'Untitled note'}</DrawerTitle>
                {note.pinned && (
                  <Badge variant="accent" size="sm">
                    <Pin />
                    Pinned
                  </Badge>
                )}
              </div>
              <DrawerDescription>
                Created {formatDateTime(note.createdAt)} · Updated {formatDateTime(note.updatedAt)}
              </DrawerDescription>
            </DrawerHeader>

            {note.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {note.tags.map((tag) => (
                  <Badge key={tag} variant="outline" size="sm">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <section className="flex flex-col gap-2">
              <h3 className="text-body-sm font-semibold text-content">Content</h3>
              <p className="whitespace-pre-wrap rounded-lg border border-line-subtle p-3 text-body-sm text-content-secondary">
                {note.content || 'No content.'}
              </p>
            </section>

            <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-line-subtle pt-4">
              <Button variant="secondary" leftIcon={<Pencil className="size-4" />} onClick={() => onEdit(note)}>
                Edit
              </Button>
              <Button
                variant="secondary"
                leftIcon={note.pinned ? <PinOff className="size-4" /> : <Pin className="size-4" />}
                onClick={() => onTogglePin(note)}
                disabled={busy}
                data-testid="note-pin-toggle"
              >
                {note.pinned ? 'Unpin' : 'Pin'}
              </Button>
              <Button
                variant="danger"
                leftIcon={<Trash2 className="size-4" />}
                onClick={() => onDelete(note)}
                className="ml-auto"
                data-testid="note-delete-trigger"
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
