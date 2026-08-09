import { Badge } from '../../design-system';
import type { Device } from './smartHomeService';
import {
  batteryIcon,
  connectorIcon,
  CONNECTOR_LABEL,
  formatBattery,
  formatFirmware,
  formatLastSeen,
  formatSignal,
  signalIcon,
} from './smartHomeFormat';

export interface DeviceHealthSummaryProps {
  device: Device;
}

/**
 * Device Management (item 14) read-only health/diagnostics/connector
 * display: battery, signal, firmware, last-seen, and the connector this
 * device is metadata-tagged with. Every field is clearly labeled and shows
 * "Not reported" rather than fabricating a value when the mock adapter
 * didn't seed one (e.g. mains-powered devices have no `battery`). The
 * connector badge is READ-ONLY here — there is no connector configuration
 * control anywhere on this page; that is roadmap item 15's job.
 */
export function DeviceHealthSummary({ device }: DeviceHealthSummaryProps) {
  const BatteryIcon = batteryIcon(device.battery);
  const SignalIcon = signalIcon(device.signalStrength);
  const connectorType = device.connector?.type ?? 'native';
  const ConnectorIcon = connectorIcon(connectorType);

  return (
    <div className="grid grid-cols-2 gap-3 text-body-sm" data-testid={`device-health-${device.id}`}>
      <div className="rounded-lg border border-line-subtle p-3">
        <div className="flex items-center gap-1.5 text-caption text-content-tertiary">
          <BatteryIcon className="size-3.5" aria-hidden="true" />
          Battery
        </div>
        <div className="text-content" data-testid={`device-battery-${device.id}`}>
          {formatBattery(device.battery)}
        </div>
      </div>
      <div className="rounded-lg border border-line-subtle p-3">
        <div className="flex items-center gap-1.5 text-caption text-content-tertiary">
          <SignalIcon className="size-3.5" aria-hidden="true" />
          Signal
        </div>
        <div className="text-content" data-testid={`device-signal-${device.id}`}>
          {formatSignal(device.signalStrength)}
        </div>
      </div>
      <div className="rounded-lg border border-line-subtle p-3">
        <div className="text-caption text-content-tertiary">Firmware</div>
        <div className="text-content" data-testid={`device-firmware-${device.id}`}>
          {formatFirmware(device.firmwareVersion)}
        </div>
      </div>
      <div className="rounded-lg border border-line-subtle p-3">
        <div className="text-caption text-content-tertiary">Last seen</div>
        <div className="text-content" data-testid={`device-lastseen-${device.id}`}>
          {formatLastSeen(device.lastSeenAt)}
        </div>
      </div>
      <div className="col-span-2 rounded-lg border border-line-subtle p-3">
        <div className="text-caption text-content-tertiary">Connector</div>
        <Badge variant="neutral" size="sm" className="mt-1" data-testid={`device-connector-${device.id}`}>
          <ConnectorIcon className="size-3.5" aria-hidden="true" />
          Connector: {CONNECTOR_LABEL[connectorType]}
        </Badge>
      </div>
    </div>
  );
}
