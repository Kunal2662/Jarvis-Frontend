import { Power, PowerOff, Zap } from 'lucide-react';
import { Badge } from '../../design-system';
import type { RoomStatus } from './smartHomeService';
import { ROOM_STATUS_BADGE_VARIANT, ROOM_STATUS_LABEL } from './smartHomeFormat';

const STATUS_ICON: Record<RoomStatus, React.ReactNode> = {
  all_off: <PowerOff />,
  some_on: <Zap />,
  all_on: <Power />,
};

/**
 * Room aggregate power status is always paired with an icon + text label —
 * never color alone (mirrors DeviceAvailabilityBadge / AutomationStatusBadge).
 * This is a purely presentational rollup of the room's power-capable
 * devices, computed by the adapter — never a rules/aggregation engine.
 */
export function RoomStatusBadge({ status }: { status: RoomStatus }) {
  return (
    <Badge variant={ROOM_STATUS_BADGE_VARIANT[status]} size="sm">
      {STATUS_ICON[status]}
      {ROOM_STATUS_LABEL[status]}
    </Badge>
  );
}
