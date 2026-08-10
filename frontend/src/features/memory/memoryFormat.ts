import {
  Cpu,
  Heart,
  MapPin,
  MessageSquare,
  Mic,
  Repeat,
  Signpost,
  type LucideIcon,
} from 'lucide-react';
import type { MemoryImportance, MemorySource, MemoryType } from './memoryService';

/** Shared, presentation-only formatting helpers for the Memory feature —
 *  mirrors knowledgeFormat.ts / smartHomeFormat.ts. Every label is always
 *  paired with an icon or text, never color alone. */

export const MEMORY_TYPE_LABEL: Record<MemoryType, string> = {
  Preference: 'Preference',
  Context: 'Context',
  Device: 'Device',
  Routine: 'Routine',
  Instruction: 'Instruction',
};

export const MEMORY_TYPE_ICON: Record<MemoryType, LucideIcon> = {
  Preference: Heart,
  Context: MapPin,
  Device: Cpu,
  Routine: Repeat,
  Instruction: Signpost,
};

export const MEMORY_SOURCE_LABEL: Record<MemorySource, string> = {
  chat: 'Chat',
  voice: 'Voice',
};

export const MEMORY_SOURCE_ICON: Record<MemorySource, LucideIcon> = {
  chat: MessageSquare,
  voice: Mic,
};

export const MEMORY_IMPORTANCE_LABEL: Record<MemoryImportance, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export const MEMORY_IMPORTANCE_BADGE_VARIANT: Record<MemoryImportance, 'neutral' | 'warning' | 'danger'> = {
  low: 'neutral',
  medium: 'warning',
  high: 'danger',
};

export function formatMemoryDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatMemoryDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}
