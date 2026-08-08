import { Ban, CheckCircle2, Circle } from 'lucide-react';
import { Badge } from '../../design-system';
import type { AiAppConnectionStatus } from './aiAppsService';
import { STATUS_BADGE_VARIANT, STATUS_LABEL } from './aiAppsFormat';

const STATUS_ICON: Record<AiAppConnectionStatus, React.ReactNode> = {
  connected: <CheckCircle2 />,
  not_connected: <Circle />,
  unavailable: <Ban />,
};

/**
 * Connection status is always paired with an icon + text label — never
 * color alone (mirrors AutomationStatusBadge / KnowledgeSourceBadge).
 */
export function AiAppStatusBadge({ status }: { status: AiAppConnectionStatus }) {
  return (
    <Badge variant={STATUS_BADGE_VARIANT[status]} size="sm">
      {STATUS_ICON[status]}
      {STATUS_LABEL[status]}
    </Badge>
  );
}
