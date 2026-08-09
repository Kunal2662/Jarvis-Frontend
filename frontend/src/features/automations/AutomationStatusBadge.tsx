import { AlertTriangle, CheckCircle2, PauseCircle, PowerOff } from 'lucide-react';
import { Badge } from '../../design-system';
import type { AutomationStatus } from './automationService';
import { STATUS_BADGE_VARIANT, STATUS_LABEL } from './automationFormat';

const STATUS_ICON: Record<AutomationStatus, React.ReactNode> = {
  active: <CheckCircle2 />,
  paused: <PauseCircle />,
  failed: <AlertTriangle />,
  disabled: <PowerOff />,
};

/**
 * Status is always paired with an icon + text label — never color alone —
 * so the state reads correctly for color-blind users and in monochrome.
 */
export function AutomationStatusBadge({ status }: { status: AutomationStatus }) {
  return (
    <Badge variant={STATUS_BADGE_VARIANT[status]} size="sm">
      {STATUS_ICON[status]}
      {STATUS_LABEL[status]}
    </Badge>
  );
}
