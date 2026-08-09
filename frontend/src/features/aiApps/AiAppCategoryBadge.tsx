import { Plug, Wrench } from 'lucide-react';
import { Badge } from '../../design-system';
import type { AiAppCategory } from './aiAppsService';
import { CATEGORY_BADGE_VARIANT, CATEGORY_LABEL } from './aiAppsFormat';

const CATEGORY_ICON: Record<AiAppCategory, React.ReactNode> = {
  'mcp-tool': <Wrench />,
  connector: <Plug />,
};

/**
 * Category is always paired with an icon + text label — never color alone —
 * so it reads correctly for color-blind users and in monochrome (mirrors
 * AutomationStatusBadge / KnowledgeSourceBadge).
 */
export function AiAppCategoryBadge({ category }: { category: AiAppCategory }) {
  return (
    <Badge variant={CATEGORY_BADGE_VARIANT[category]} size="sm">
      {CATEGORY_ICON[category]}
      {CATEGORY_LABEL[category]}
    </Badge>
  );
}
