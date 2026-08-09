import { useState } from 'react';
import { Button, FormField, Input } from '../../design-system';

export interface NewFolderFormProps {
  onSubmit: (name: string) => void | Promise<void>;
  onCancel: () => void;
  submitting?: boolean;
}

export function NewFolderForm({ onSubmit, onCancel, submitting }: NewFolderFormProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | undefined>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Folder name is required.');
      return;
    }
    setError(undefined);
    void onSubmit(name.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" data-testid="new-folder-form">
      <FormField label="Folder name" required error={error}>
        {(p) => (
          <Input
            {...p}
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Receipts"
            data-testid="new-folder-name"
          />
        )}
      </FormField>

      <div className="flex items-center justify-end gap-2 border-t border-line-subtle pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting} data-testid="new-folder-submit">
          Create folder
        </Button>
      </div>
    </form>
  );
}
