import { Circle, CircleDot, CheckCircle2 } from 'lucide-react';
import { Badge } from '../../design-system';
import type { TaskStatus } from './tasksService';
import { STATUS_BADGE_VARIANT, STATUS_LABEL } from './tasksFormat';

const STATUS_ICON: Record<TaskStatus, React.ReactNode> = {
  todo: <Circle />,
  'in-progress': <CircleDot />,
  done: <CheckCircle2 />,
};

/**
 * Status is always paired with an icon + text label — never color alone —
 * so the state reads correctly for color-blind users and in monochrome.
 * Mirrors AutomationStatusBadge.tsx.
 */
export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return (
    <Badge variant={STATUS_BADGE_VARIANT[status]} size="sm">
      {STATUS_ICON[status]}
      {STATUS_LABEL[status]}
    </Badge>
  );
}
