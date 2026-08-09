import { Pin } from 'lucide-react';
import { Badge, IconButton, ListRow } from '../../design-system';
import type { Note } from './notesService';
import { contentPreview, formatDateTime } from './notesFormat';

export interface NoteRowProps {
  note: Note;
  onOpen: (id: string) => void;
  onTogglePin: (id: string, pinned: boolean) => void;
  pinning?: boolean;
}

export function NoteRow({ note, onOpen, onTogglePin, pinning }: NoteRowProps) {
  return (
    <ListRow
      leading={
        <IconButton
          label={note.pinned ? `Unpin ${note.title}` : `Pin ${note.title}`}
          variant="ghost"
          size="sm"
          disabled={pinning}
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin(note.id, !note.pinned);
          }}
          data-testid={`note-pin-${note.id}`}
        >
          <Pin className={note.pinned ? 'size-4 fill-current text-accent-text' : 'size-4'} />
        </IconButton>
      }
      title={note.title || 'Untitled note'}
      subtitle={contentPreview(note.content) || 'No content'}
      trailing={
        <span className="flex flex-col items-end gap-1">
          <span className="whitespace-nowrap text-caption text-content-tertiary">
            {formatDateTime(note.updatedAt)}
          </span>
          {note.tags.length > 0 && (
            <span className="flex flex-wrap justify-end gap-1">
              {note.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" size="sm">
                  {tag}
                </Badge>
              ))}
            </span>
          )}
        </span>
      }
      role="button"
      tabIndex={0}
      onClick={() => onOpen(note.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen(note.id);
        }
      }}
      data-testid={`note-row-${note.id}`}
      aria-label={`Open ${note.title || 'Untitled note'}`}
    />
  );
}
