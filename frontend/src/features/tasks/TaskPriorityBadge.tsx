import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { Badge } from '../../design-system';
import type { TaskPriority } from './tasksService';
import { PRIORITY_BADGE_VARIANT, PRIORITY_LABEL } from './tasksFormat';

const PRIORITY_ICON: Record<TaskPriority, React.ReactNode> = {
  low: <ArrowDown />,
  medium: <Minus />,
  high: <ArrowUp />,
};

/** Priority is always paired with an icon + text label — never color alone. */
export function TaskPriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <Badge variant={PRIORITY_BADGE_VARIANT[priority]} size="sm">
      {PRIORITY_ICON[priority]}
      {PRIORITY_LABEL[priority]}
    </Badge>
  );
}
