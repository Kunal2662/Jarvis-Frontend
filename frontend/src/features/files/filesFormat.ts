import { File, FileImage, FileSpreadsheet, FileText, type LucideIcon } from 'lucide-react';
import type { FileEntry } from './filesService';

/** Shared, presentation-only formatting helpers for the Files feature. */

export function formatDateTime(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export function formatBytes(bytes?: number): string {
  if (bytes === undefined || Number.isNaN(bytes)) return '—';
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(value < 10 ? 1 : 0)} ${units[unitIndex]}`;
}

/** Coarse, human-readable file category derived from a mime type — used for
 *  icon selection and the "Add file" mock form. Not a real content-type
 *  registry. */
export type FileKind = 'document' | 'spreadsheet' | 'image' | 'pdf' | 'other';

export function fileKind(mimeType?: string): FileKind {
  if (!mimeType) return 'other';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.includes('spreadsheet') || mimeType === 'text/csv') return 'spreadsheet';
  if (mimeType.includes('word') || mimeType === 'text/plain') return 'document';
  return 'other';
}

const KIND_ICON: Record<FileKind, LucideIcon> = {
  document: FileText,
  spreadsheet: FileSpreadsheet,
  image: FileImage,
  pdf: FileText,
  other: File,
};

export function fileIcon(entry: FileEntry): LucideIcon {
  return KIND_ICON[fileKind(entry.mimeType)];
}

export const MOCK_UPLOAD_TYPES: { value: string; label: string; mimeType: string; sizeBytes: number }[] = [
  { value: 'document', label: 'Document (.docx)', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', sizeBytes: 42_000 },
  { value: 'spreadsheet', label: 'Spreadsheet (.xlsx)', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', sizeBytes: 58_000 },
  { value: 'pdf', label: 'PDF (.pdf)', mimeType: 'application/pdf', sizeBytes: 320_000 },
  { value: 'image', label: 'Image (.png)', mimeType: 'image/png', sizeBytes: 1_800_000 },
  { value: 'text', label: 'Text (.txt)', mimeType: 'text/plain', sizeBytes: 4_000 },
];
