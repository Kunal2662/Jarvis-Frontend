import { useState } from 'react';
import { Button, FormField, Input, TextArea } from '../../design-system';
import type { Note, NoteInput } from './notesService';
import { parseTags } from './notesFormat';

export interface NoteFormProps {
  initial?: Note;
  submitLabel: string;
  onSubmit: (input: NoteInput) => void | Promise<void>;
  onCancel: () => void;
  submitting?: boolean;
}

export function NoteForm({ initial, submitLabel, onSubmit, onCancel, submitting }: NoteFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [content, setContent] = useState(initial?.content ?? '');
  const [tagsText, setTagsText] = useState(initial?.tags.join(', ') ?? '');
  const [error, setError] = useState<string | undefined>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    setError(undefined);
    void onSubmit({
      title: title.trim(),
      content: content.trim(),
      tags: parseTags(tagsText),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" data-testid="note-form">
      <FormField label="Title" required error={error && !title.trim() ? error : undefined}>
        {(p) => (
          <Input
            {...p}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Ideas for Voice Orb redesign"
            data-testid="note-form-title"
          />
        )}
      </FormField>

      <FormField label="Content" description="Plain text — one idea per line works well.">
        {(p) => (
          <TextArea
            {...p}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your note…"
            className="min-h-[160px]"
            data-testid="note-form-content"
          />
        )}
      </FormField>

      <FormField label="Tags" description="Comma-separated, e.g. design, voice">
        {(p) => (
          <Input
            {...p}
            value={tagsText}
            onChange={(e) => setTagsText(e.target.value)}
            placeholder="design, voice"
            data-testid="note-form-tags"
          />
        )}
      </FormField>

      {error && (
        <p role="alert" className="text-caption text-danger" data-testid="note-form-error">
          {error}
        </p>
      )}

      <div className="flex items-center justify-end gap-2 border-t border-line-subtle pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting} data-testid="note-form-submit">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
