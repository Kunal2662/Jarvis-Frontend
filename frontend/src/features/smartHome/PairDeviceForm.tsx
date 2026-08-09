import { useState } from 'react';
import { Radar } from 'lucide-react';
import {
  Button,
  Checkbox,
  FormField,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Spinner,
} from '../../design-system';
import type { DeviceCapability, DeviceType, PairDeviceInput, Room } from './smartHomeService';
import { CAPABILITY_LABEL, DEFAULT_CAPABILITIES_BY_TYPE } from './smartHomeFormat';

const DEVICE_TYPES: DeviceType[] = ['Light', 'Thermostat', 'Fan', 'Lock', 'Speaker', 'Sensor', 'Switch'];
const CAPABILITIES: DeviceCapability[] = ['power', 'brightness', 'temperature', 'fan_speed', 'lock', 'media', 'sensor'];

export interface PairDeviceFormProps {
  rooms: Room[];
  onSubmit: (input: PairDeviceInput) => void | Promise<void>;
  onCancel: () => void;
  /** True while the mock adapter's simulated "discovering device…" delay is
   *  in flight (see PAIR_DEVICE_DELAY_MS in mockSmartHomeAdapter.ts). */
  submitting?: boolean;
}

/**
 * The "Pair New Device" form — name, room, type, capabilities. This is a UI
 * simulation only: no real Bluetooth/Zigbee/WiFi/Home Assistant/MQTT
 * discovery protocol runs anywhere behind it (see `pairDevice` in
 * smartHomeService.ts). Capabilities default per the chosen type (mirroring
 * what the seeded devices of that type already have) but stay fully
 * editable — the defaults are only a starting suggestion.
 */
export function PairDeviceForm({ rooms, onSubmit, onCancel, submitting }: PairDeviceFormProps) {
  const [name, setName] = useState('');
  const [roomId, setRoomId] = useState(rooms[0]?.id ?? '');
  const [type, setType] = useState<DeviceType>('Light');
  const [capabilities, setCapabilities] = useState<Set<DeviceCapability>>(
    new Set(DEFAULT_CAPABILITIES_BY_TYPE.Light),
  );
  const [error, setError] = useState<string | undefined>();

  const handleTypeChange = (next: DeviceType) => {
    setType(next);
    setCapabilities(new Set(DEFAULT_CAPABILITIES_BY_TYPE[next]));
  };

  const toggleCapability = (capability: DeviceCapability, checked: boolean) => {
    setCapabilities((prev) => {
      const next = new Set(prev);
      if (checked) next.add(capability);
      else next.delete(capability);
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Device name is required.');
      return;
    }
    if (!roomId) {
      setError('Choose a room for this device.');
      return;
    }
    if (capabilities.size === 0) {
      setError('Select at least one capability.');
      return;
    }
    setError(undefined);
    void onSubmit({ name: name.trim(), roomId, type, capabilities: Array.from(capabilities) });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" data-testid="pair-device-form">
      <FormField label="Device name" required error={error && !name.trim() ? error : undefined}>
        {(p) => (
          <Input
            {...p}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Hallway Light"
            disabled={submitting}
            data-testid="pair-device-name"
          />
        )}
      </FormField>

      <FormField label="Room" required>
        {(p) => (
          <Select value={roomId} onValueChange={setRoomId} disabled={submitting}>
            <SelectTrigger id={p.id} data-testid="pair-device-room">
              <SelectValue placeholder="Choose a room" />
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

      <FormField label="Device type" required>
        {(p) => (
          <Select value={type} onValueChange={(v) => handleTypeChange(v as DeviceType)} disabled={submitting}>
            <SelectTrigger id={p.id} data-testid="pair-device-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DEVICE_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </FormField>

      <div className="flex flex-col gap-2.5 rounded-lg border border-line-subtle p-3">
        <span className="text-body-sm font-semibold text-content">Capabilities</span>
        <p className="text-caption text-content-tertiary">
          Pre-selected based on the device type — adjust as needed.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {CAPABILITIES.map((capability) => (
            <label key={capability} className="flex items-center gap-2 text-body-sm text-content">
              <Checkbox
                checked={capabilities.has(capability)}
                disabled={submitting}
                onCheckedChange={(checked) => toggleCapability(capability, checked === true)}
                data-testid={`pair-device-capability-${capability}`}
              />
              {CAPABILITY_LABEL[capability]}
            </label>
          ))}
        </div>
      </div>

      {error && (
        <p role="alert" className="text-caption text-danger" data-testid="pair-device-form-error">
          {error}
        </p>
      )}

      {submitting && (
        <div
          className="flex items-center gap-2 rounded-lg border border-line-subtle bg-surface-raised p-3 text-body-sm text-content-secondary"
          data-testid="pair-device-discovering"
        >
          <Spinner size="sm" label="Discovering device" />
          <Radar className="size-4 shrink-0" aria-hidden="true" />
          Discovering device… this is simulated and can take a moment.
        </div>
      )}

      <div className="flex items-center justify-end gap-2 border-t border-line-subtle pt-4">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting} data-testid="pair-device-submit">
          {submitting ? 'Discovering…' : 'Pair device'}
        </Button>
      </div>
    </form>
  );
}
