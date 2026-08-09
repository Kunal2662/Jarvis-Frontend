import { ChevronRight } from 'lucide-react';
import { ListRow } from '../../design-system';
import type { Device } from './smartHomeService';
import { DeviceAvailabilityBadge } from './DeviceAvailabilityBadge';
import { batteryIcon, deviceTypeIcon, formatBattery, formatSignal, signalIcon } from './smartHomeFormat';

export interface DeviceManagementRowProps {
  device: Device;
  roomName: string;
  onOpen: (deviceId: string) => void;
}

/** A single device management list row — name, room, type, availability,
 *  and a compact battery/signal glance (icon + percentage, never color
 *  alone — mirrors DeviceAvailabilityBadge). Clicking opens the management
 *  drawer for this device (List/ListRow, matching FilesPage/TasksPage —
 *  a better fit for a management list than the Command Center's card grid). */
export function DeviceManagementRow({ device, roomName, onOpen }: DeviceManagementRowProps) {
  const Icon = deviceTypeIcon(device.type);
  const BatteryIcon = batteryIcon(device.battery);
  const SignalIcon = signalIcon(device.signalStrength);

  return (
    <ListRow
      leading={<Icon />}
      title={device.name}
      subtitle={`${roomName} · ${device.type}`}
      trailing={
        <span className="flex items-center gap-3">
          {typeof device.battery === 'number' && (
            <span
              className="hidden items-center gap-1 text-caption tabular-nums text-content-tertiary sm:flex"
              data-testid={`device-row-battery-${device.id}`}
            >
              <BatteryIcon className="size-3.5" aria-hidden="true" />
              {formatBattery(device.battery)}
            </span>
          )}
          {typeof device.signalStrength === 'number' && (
            <span
              className="hidden items-center gap-1 text-caption tabular-nums text-content-tertiary sm:flex"
              data-testid={`device-row-signal-${device.id}`}
            >
              <SignalIcon className="size-3.5" aria-hidden="true" />
              {formatSignal(device.signalStrength)}
            </span>
          )}
          <DeviceAvailabilityBadge availability={device.availability} />
          <ChevronRight className="size-4 shrink-0 text-content-tertiary" aria-hidden="true" />
        </span>
      }
      role="button"
      tabIndex={0}
      onClick={() => onOpen(device.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen(device.id);
        }
      }}
      data-testid={`device-management-row-${device.id}`}
      aria-label={`Manage ${device.name}`}
    />
  );
}
