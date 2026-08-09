import { useState } from 'react';
import {
  Button,
  FormField,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../design-system';
import { MOCK_UPLOAD_TYPES } from './filesFormat';

export interface AddFileFormValues {
  name: string;
  mimeType: string;
  sizeBytes: number;
}

export interface AddFileFormProps {
  onSubmit: (values: AddFileFormValues) => void | Promise<void>;
  onCancel: () => void;
  submitting?: boolean;
}

/** Collects a name + a coarse file-type choice and fabricates a plausible
 *  size — there is no real storage behind this, so there is nothing to
 *  actually upload. See the "mock, not a real upload" disclosure in
 *  FilesPage.tsx and docs/CORE_FILES_CONTRACT_REQUIRED.md. */
export function AddFileForm({ onSubmit, onCancel, submitting }: AddFileFormProps) {
  const [name, setName] = useState('');
  const [typeValue, setTypeValue] = useState(MOCK_UPLOAD_TYPES[0].value);
  const [error, setError] = useState<string | undefined>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('File name is required.');
      return;
    }
    setError(undefined);
    const picked = MOCK_UPLOAD_TYPES.find((t) => t.value === typeValue) ?? MOCK_UPLOAD_TYPES[0];
    void onSubmit({ name: name.trim(), mimeType: picked.mimeType, sizeBytes: picked.sizeBytes });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" data-testid="add-file-form">
      <p className="rounded-lg border border-line-subtle bg-surface-raised p-3 text-caption text-content-tertiary">
        This adds a placeholder file entry only — no real file is uploaded or stored. JARVIS does not have real
        file storage yet.
      </p>

      <FormField label="File name" required error={error}>
        {(p) => (
          <Input
            {...p}
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Meeting notes.docx"
            data-testid="add-file-name"
          />
        )}
      </FormField>

      <FormField label="Type" description="Used only to pick a placeholder icon and fake size.">
        {(p) => (
          <Select value={typeValue} onValueChange={setTypeValue}>
            <SelectTrigger id={p.id} data-testid="add-file-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MOCK_UPLOAD_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </FormField>

      <div className="flex items-center justify-end gap-2 border-t border-line-subtle pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting} data-testid="add-file-submit">
          Add file
        </Button>
      </div>
    </form>
  );
}
