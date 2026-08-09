import { useEffect, useState } from 'react';
import {
  Card,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from '../../design-system';
import type { Device, DeviceCommand, DeviceCommandValue, FanSpeed } from './smartHomeService';
import { DeviceAvailabilityBadge } from './DeviceAvailabilityBadge';
import { deviceTypeIcon, formatDateTime } from './smartHomeFormat';

export interface DeviceTileProps {
  device: Device;
  /** True while a discrete command (power/lock) sent from this tile is
   *  in flight — mirrors the AutomationCard/AiAppCard `toggling` pattern. */
  pending?: boolean;
  highlighted?: boolean;
  onCommand: (deviceId: string, command: DeviceCommand, value?: DeviceCommandValue) => void;
}

const FAN_SPEEDS: FanSpeed[] = ['low', 'medium', 'high'];
const FAN_SPEED_LABEL: Record<FanSpeed, string> = { low: 'Low', medium: 'Medium', high: 'High' };

/**
 * A single device's card: name, type, availability, and whichever inline
 * capability controls apply. Controls are disabled whenever the device is
 * not `online` (the mock adapter itself rejects commands to an offline/
 * unavailable device — see `requireOnline` in mockSmartHomeAdapter.ts) or
 * while a discrete command is in flight.
 *
 * Power/lock are controlled directly by `device` (source of truth), same as
 * AutomationCard's enable Switch — the toggle only visually flips once the
 * command resolves. Brightness/temperature keep a small local mirror of
 * their value so the slider can be dragged smoothly; it re-syncs from
 * `device.state` whenever the server-confirmed value changes (e.g. after a
 * scene trigger updates this device from elsewhere on the page).
 */
export function DeviceTile({ device, pending, highlighted, onCommand }: DeviceTileProps) {
  const Icon = deviceTypeIcon(device.type);
  const online = device.availability === 'online';
  const disabled = pending || !online;

  const [brightness, setBrightness] = useState(device.state.brightness ?? 0);
  useEffect(() => setBrightness(device.state.brightness ?? 0), [device.state.brightness]);

  const [temperature, setTemperature] = useState(device.state.temperature ?? 21);
  useEffect(() => setTemperature(device.state.temperature ?? 21), [device.state.temperature]);

  return (
    <Card
      variant="raised"
      className="flex flex-col gap-3 p-4"
      data-testid={`device-tile-${device.id}`}
      data-highlighted={highlighted ? 'true' : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 shrink-0 text-content-tertiary [&_svg]:size-5">
            <Icon aria-hidden="true" />
          </span>
          <div className="flex min-w-0 flex-col gap-1">
            <span className="truncate text-body font-semibold text-content">{device.name}</span>
            <span className="text-caption text-content-tertiary">{device.type}</span>
          </div>
        </div>
        <DeviceAvailabilityBadge availability={device.availability} />
      </div>

      <div className="flex flex-col gap-3 border-t border-line-subtle pt-3">
        {device.capabilities.includes('power') && (
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor={`power-${device.id}`}>Power</Label>
            <Switch
              id={`power-${device.id}`}
              checked={device.state.power === true}
              disabled={disabled}
              aria-label={device.state.power ? `Turn off ${device.name}` : `Turn on ${device.name}`}
              onCheckedChange={(checked) => onCommand(device.id, checked ? 'TURN_ON' : 'TURN_OFF')}
              data-testid={`device-power-${device.id}`}
            />
          </div>
        )}

        {device.capabilities.includes('lock') && (
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor={`lock-${device.id}`}>{device.state.locked ? 'Locked' : 'Unlocked'}</Label>
            <Switch
              id={`lock-${device.id}`}
              checked={device.state.locked === true}
              disabled={disabled}
              aria-label={device.state.locked ? `Unlock ${device.name}` : `Lock ${device.name}`}
              onCheckedChange={(checked) => onCommand(device.id, checked ? 'LOCK' : 'UNLOCK')}
              data-testid={`device-lock-${device.id}`}
            />
          </div>
        )}

        {device.capabilities.includes('brightness') && (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor={`brightness-${device.id}`}>Brightness</Label>
              <span className="text-caption tabular-nums text-content-tertiary">{brightness}%</span>
            </div>
            <Input
              id={`brightness-${device.id}`}
              type="range"
              min={0}
              max={100}
              step={1}
              value={brightness}
              disabled={disabled}
              aria-label={`${device.name} brightness`}
              onChange={(e) => {
                const v = Number(e.target.value);
                setBrightness(v);
                onCommand(device.id, 'SET_BRIGHTNESS', v);
              }}
              data-testid={`device-brightness-${device.id}`}
            />
          </div>
        )}

        {device.capabilities.includes('temperature') && (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor={`temperature-${device.id}`}>Target temperature</Label>
              <span className="text-caption tabular-nums text-content-tertiary">{temperature}°C</span>
            </div>
            <Input
              id={`temperature-${device.id}`}
              type="range"
              min={10}
              max={32}
              step={1}
              value={temperature}
              disabled={disabled}
              aria-label={`${device.name} target temperature`}
              onChange={(e) => {
                const v = Number(e.target.value);
                setTemperature(v);
                onCommand(device.id, 'SET_TEMPERATURE', v);
              }}
              data-testid={`device-temperature-${device.id}`}
            />
          </div>
        )}

        {device.capabilities.includes('fan_speed') && (
          <div className="flex items-center justify-between gap-3">
            <Label id={`fan-speed-label-${device.id}`}>Fan speed</Label>
            <Select
              value={device.state.fanSpeed ?? 'low'}
              disabled={disabled}
              onValueChange={(v) => onCommand(device.id, 'SET_FAN_SPEED', v as FanSpeed)}
            >
              <SelectTrigger
                aria-labelledby={`fan-speed-label-${device.id}`}
                className="w-[130px]"
                data-testid={`device-fanspeed-${device.id}`}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FAN_SPEEDS.map((speed) => (
                  <SelectItem key={speed} value={speed}>
                    {FAN_SPEED_LABEL[speed]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {device.capabilities.includes('sensor') && device.state.sensorValue && (
          <div className="flex items-center justify-between gap-3">
            <span className="text-body-sm text-content-secondary">{device.state.sensorValue.label}</span>
            <span
              className="text-body-sm font-medium tabular-nums text-content"
              data-testid={`device-sensor-${device.id}`}
            >
              {device.state.sensorValue.value}
            </span>
          </div>
        )}
      </div>

      <div className="mt-auto border-t border-line-subtle pt-2 text-caption text-content-tertiary">
        Updated {formatDateTime(device.updatedAt)}
      </div>
    </Card>
  );
}
