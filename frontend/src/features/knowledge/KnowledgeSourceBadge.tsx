import { FileText, Globe, MessageSquare, StickyNote } from 'lucide-react';
import { Badge } from '../../design-system';
import type { KnowledgeSourceType } from './knowledgeService';
import { SOURCE_BADGE_VARIANT, SOURCE_LABEL } from './knowledgeFormat';

const SOURCE_ICON: Record<KnowledgeSourceType, React.ReactNode> = {
  'chat-memory': <MessageSquare />,
  file: <FileText />,
  note: <StickyNote />,
  web: <Globe />,
};

/**
 * Source is always paired with an icon + text label — never color alone —
 * so it reads correctly for color-blind users and in monochrome (mirrors
 * AutomationStatusBadge).
 */
export function KnowledgeSourceBadge({ sourceType }: { sourceType: KnowledgeSourceType }) {
  return (
    <Badge variant={SOURCE_BADGE_VARIANT[sourceType]} size="sm">
      {SOURCE_ICON[sourceType]}
      {SOURCE_LABEL[sourceType]}
    </Badge>
  );
}
