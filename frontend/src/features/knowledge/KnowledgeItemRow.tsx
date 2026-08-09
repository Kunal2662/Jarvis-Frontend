import { FileText, Globe, MessageSquare, StickyNote } from 'lucide-react';
import { ListRow } from '../../design-system';
import type { KnowledgeItem, KnowledgeSourceType } from './knowledgeService';
import { formatDateTime } from './knowledgeFormat';

const SOURCE_LEADING_ICON: Record<KnowledgeSourceType, React.ReactNode> = {
  'chat-memory': <MessageSquare />,
  file: <FileText />,
  note: <StickyNote />,
  web: <Globe />,
};

export interface KnowledgeItemRowProps {
  item: KnowledgeItem;
  onOpen: (id: string) => void;
}

/** A single browsable knowledge document row (reuses the design-system List/ListRow
 *  data component — a better fit for a document browser than a Card grid). */
export function KnowledgeItemRow({ item, onOpen }: KnowledgeItemRowProps) {
  return (
    <ListRow
      leading={SOURCE_LEADING_ICON[item.sourceType]}
      title={item.title}
      subtitle={item.snippet}
      trailing={
        <span className="whitespace-nowrap text-caption text-content-tertiary">
          {formatDateTime(item.updatedAt)}
        </span>
      }
      role="button"
      tabIndex={0}
      onClick={() => onOpen(item.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen(item.id);
        }
      }}
      data-testid={`knowledge-item-${item.id}`}
      aria-label={`Open ${item.title}`}
    />
  );
}
