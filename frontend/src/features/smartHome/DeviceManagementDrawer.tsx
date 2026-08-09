import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import {
  Badge,
  Button,
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  FormField,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Spinner,
} from '../../design-system';
import type { Device, DeviceCapability, Room, UpdateDeviceInput } from './smartHomeService';
import { DeviceAvailabilityBadge } from './DeviceAvailabilityBadge';
import { DeviceHealthSummary } from './DeviceHealthSummary';
import { CAPABILITY_LABEL, formatDateTime } from './smartHomeFormat';

export interface DeviceManagementDrawerProps {
  device: Device | null;
  rooms: Room[];
  loading?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, input: UpdateDeviceInput) => void | Promise<void>;
  saving?: boolean;
  onRemove: (device: Device) => void;
}

/** Human-readable, read-only summary of a device's current state — control
 *  already lives on the Command Center (DeviceTile); this drawer is about
 *  management (rename/reassign/remove/pair), never a second control surface. */
function describeState(device: Device): { label: string; value: string }[] {
  const rows: { label: string; value: string }[] = [];
  const has = (c: DeviceCapability) => device.capabilities.includes(c);
  if (has('power')) rows.push({ label: 'Power', value: device.state.power ? 'On' : 'Off' });
  if (has('brightness') && device.state.brightness !== undefined) {
    rows.push({ label: 'Brightness', value: `${device.state.brightness}%` });
  }
  if (has('temperature') && device.state.temperature !== undefined) {
    rows.push({ label: 'Target temperature', value: `${device.state.temperature}°C` });
  }
  if (has('fan_speed') && device.state.fanSpeed) {
    rows.push({ label: 'Fan speed', value: device.state.fanSpeed });
  }
  if (has('lock')) rows.push({ label: 'Lock', value: device.state.locked ? 'Locked' : 'Unlocked' });
  if (has('sensor') && device.state.sensorValue) {
    rows.push({ label: device.state.sensorValue.label, value: device.state.sensorValue.value });
  }
  return rows;
}

export function DeviceManagementDrawer({
  device,
  rooms,
  loading,
  open,
  onOpenChange,
  onSave,
  saving,
  onRemove,
}: DeviceManagementDrawerProps) {
  const [name, setName] = useState('');
  const [roomId, setRoomId] = useState('');

  // Reset the editable fields only when the drawer opens on a *different*
  // device — not on every re-render — so an in-progress edit is never wiped
  // out by an unrelated parent-state patch (mirrors DeviceTile's brightness
  // mirror pattern in smartHomeFormat's sibling file).
  useEffect(() => {
    if (device) {
      setName(device.name);
      setRoomId(device.roomId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [device?.id]);

  const dirty = device ? (name.trim() !== device.name || roomId !== device.roomId) && name.trim() !== '' : false;

  const handleSave = () => {
    if (!device || !dirty) return;
    const input: UpdateDeviceInput = {};
    if (name.trim() !== device.name) input.name = name.trim();
    if (roomId !== device.roomId) input.roomId = roomId;
    void onSave(device.id, input);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        side="right"
        className="w-full max-w-lg overflow-y-auto"
        data-testid="device-management-drawer"
      >
        {loading || !device ? (
          <div className="flex flex-1 items-center justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            <DrawerHeader>
              <div className="flex flex-wrap items-center gap-2">
                <DrawerTitle>{device.name}</DrawerTitle>
                <DeviceAvailabilityBadge availability={device.availability} />
              </div>
              <DrawerDescription>
                {device.type} · {rooms.find((r) => r.id === device.roomId)?.name ?? 'Unknown room'}
              </DrawerDescription>
            </DrawerHeader>

            <section className="flex flex-col gap-2">
              <h3 className="text-body-sm font-semibold text-content">Capabilities</h3>
              <div className="flex flex-wrap gap-1.5">
                {device.capabilities.map((c) => (
                  <Badge key={c} variant="outline" size="sm">
                    {CAPABILITY_LABEL[c]}
                  </Badge>
                ))}
              </div>
            </section>

            <section className="flex flex-col gap-2">
              <h3 className="text-body-sm font-semibold text-content">Current state</h3>
              <p className="text-caption text-content-tertiary">
                Read-only reference — control this device from the Smart Home Command Center.
              </p>
              {describeState(device).length === 0 ? (
                <p className="text-caption text-content-tertiary">No reportable state.</p>
              ) : (
                <ul className="flex flex-col gap-1.5">
                  {describeState(device).map((row) => (
                    <li
                      key={row.label}
                      className="flex items-center justify-between rounded-lg border border-line-subtle p-2.5 text-body-sm"
                    >
                      <span className="text-content-secondary">{row.label}</span>
                      <span className="font-medium tabular-nums text-content">{row.value}</span>
                    </li>
                  ))}
                </ul>
              )}
              <p className="text-caption text-content-tertiary">Updated {formatDateTime(device.updatedAt)}</p>
            </section>

            <section className="flex flex-col gap-2">
              <h3 className="text-body-sm font-semibold text-content">Health &amp; diagnostics</h3>
              <DeviceHealthSummary device={device} />
            </section>

            <section className="flex flex-col gap-3 rounded-lg border border-line-subtle p-3">
              <h3 className="text-body-sm font-semibold text-content">Rename &amp; reassign room</h3>
              <FormField label="Name" required>
                {(p) => (
                  <Input
                    {...p}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={saving}
                    data-testid="device-management-name-input"
                  />
                )}
              </FormField>
              <FormField label="Room" required>
                {(p) => (
                  <Select value={roomId} onValueChange={setRoomId} disabled={saving}>
                    <SelectTrigger id={p.id} data-testid="device-management-room-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {rooms.map((room) => (
                        <SelectItem key={room.id} value={room.id}>
                          {room.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </FormField>
              <Button
                variant="secondary"
                className="self-start"
                disabled={!dirty}
                loading={saving}
                onClick={handleSave}
                data-testid="device-management-save"
              >
                Save changes
              </Button>
            </section>

            <div className="mt-auto flex items-center border-t border-line-subtle pt-4">
              <Button
                variant="danger"
                leftIcon={<Trash2 className="size-4" />}
                onClick={() => onRemove(device)}
                data-testid="device-management-remove-trigger"
              >
                Remove device
              </Button>
            </div>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}
