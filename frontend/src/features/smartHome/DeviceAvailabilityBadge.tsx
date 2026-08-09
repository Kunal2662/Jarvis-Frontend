import { Ban, Wifi, WifiOff } from 'lucide-react';
import { Badge } from '../../design-system';
import type { DeviceAvailability } from './smartHomeService';
import { AVAILABILITY_BADGE_VARIANT, AVAILABILITY_LABEL } from './smartHomeFormat';

const AVAILABILITY_ICON: Record<DeviceAvailability, React.ReactNode> = {
  online: <Wifi />,
  offline: <WifiOff />,
  unavailable: <Ban />,
};

/**
 * Availability is always paired with an icon + text label — never color
 * alone — so it reads correctly for color-blind users and in monochrome
 * (mirrors AutomationStatusBadge / AiAppStatusBadge).
 */
export function DeviceAvailabilityBadge({ availability }: { availability: DeviceAvailability }) {
  return (
    <Badge variant={AVAILABILITY_BADGE_VARIANT[availability]} size="sm">
      {AVAILABILITY_ICON[availability]}
      {AVAILABILITY_LABEL[availability]}
    </Badge>
  );
}
