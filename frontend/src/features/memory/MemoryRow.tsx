import { Badge, ListRow } from '../../design-system';
import type { Memory } from './memoryService';
import {
  formatMemoryDate,
  MEMORY_IMPORTANCE_BADGE_VARIANT,
  MEMORY_IMPORTANCE_LABEL,
  MEMORY_SOURCE_ICON,
  MEMORY_TYPE_ICON,
  MEMORY_TYPE_LABEL,
} from './memoryFormat';

export interface MemoryRowProps {
  memory: Memory;
  onOpen: (id: string) => void;
}

/** A single remembered-item row (reuses the design-system List/ListRow data
 *  component, mirrors KnowledgeItemRow — a better fit for a browsable list
 *  than a card grid). */
export function MemoryRow({ memory, onOpen }: MemoryRowProps) {
  const TypeIcon = MEMORY_TYPE_ICON[memory.type];
  const SourceIcon = MEMORY_SOURCE_ICON[memory.source];

  return (
    <ListRow
      leading={<TypeIcon />}
      title={memory.content}
      subtitle={`${MEMORY_TYPE_LABEL[memory.type]} · ${formatMemoryDate(memory.createdAt)}`}
      trailing={
        <span className="flex items-center gap-2">
          <SourceIcon className="size-3.5 shrink-0 text-content-tertiary" aria-hidden="true" />
          <Badge variant={MEMORY_IMPORTANCE_BADGE_VARIANT[memory.importance]} size="sm">
            {MEMORY_IMPORTANCE_LABEL[memory.importance]}
          </Badge>
        </span>
      }
      role="button"
      tabIndex={0}
      onClick={() => onOpen(memory.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen(memory.id);
        }
      }}
      data-testid={`memory-row-${memory.id}`}
      aria-label={`Open memory: ${memory.content}`}
    />
  );
}
