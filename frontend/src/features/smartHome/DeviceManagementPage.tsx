import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AlertTriangle, BatteryWarning, Cpu, Plus, Radio, Wifi } from 'lucide-react';
import {
  Button,
  List,
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModulePage,
  Search,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  StatCard,
  Widget,
  useAsync,
  useToast,
} from '../../design-system';
import { getSmartHomeService, type Device, type PairDeviceInput, type Room, type UpdateDeviceInput } from './smartHomeService';
import { DeviceManagementRow } from './DeviceManagementRow';
import { DeviceManagementDrawer } from './DeviceManagementDrawer';
import { PairDeviceForm } from './PairDeviceForm';

interface DeviceManagementData {
  rooms: Room[];
  devices: Device[];
}

const LOW_BATTERY_THRESHOLD = 20;

function matches(device: Device, roomName: string, term: string): boolean {
  return `${device.name} ${device.type} ${roomName}`.toLowerCase().includes(term);
}

/**
 * Device Management (roadmap item 14) — extends the Smart Home Command
 * Center (item 13) on the same `SmartHomeService` seam. This page is about
 * managing simulated devices — rename/room-reassignment, pairing new ones,
 * removing them, and reviewing read-only health/diagnostics/connector
 * metadata — never a second control surface for turning things on/off
 * (that stays on `/smart-home`, via `sendCommand`).
 */
export function DeviceManagementPage() {
  const service = useMemo(() => getSmartHomeService(), []);
  const location = useLocation();
  const { toast } = useToast();

  const list = useAsync<DeviceManagementData>(
    async (signal) => {
      const [rooms, devices] = await Promise.all([service.getRooms(signal), service.getDevices(undefined, signal)]);
      return { rooms, devices };
    },
    { isEmpty: (data) => data.devices.length === 0 },
  );

  // Local, patchable copies — mirrors SmartHomePage/AutomationsPage so a
  // rename/pair/remove never flashes the whole page back to loading.
  const [rooms, setRooms] = useState<Room[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  useEffect(() => {
    if (list.data) {
      setRooms(list.data.rooms);
      setDevices(list.data.devices);
    }
  }, [list.data]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Device | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [pairOpen, setPairOpen] = useState(false);
  const [pairing, setPairing] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [roomFilter, setRoomFilter] = useState<string>('all');

  const roomNameById = useMemo(() => new Map(rooms.map((r) => [r.id, r.name])), [rooms]);
  const selected = selectedId ? devices.find((d) => d.id === selectedId) ?? null : null;

  // Deep-link support: DeviceTile's "Manage" button (Step 13's Command
  // Center) navigates here with `state: { deviceId }`, mirroring exactly how
  // Universal Search deep-links into SmartHomePage with the same shape.
  const consumedDeepLink = useRef(false);
  useEffect(() => {
    if (consumedDeepLink.current || !list.data) return;
    const deviceId = (location.state as { deviceId?: string } | null)?.deviceId;
    if (!deviceId) return;
    if (devices.some((d) => d.id === deviceId)) {
      consumedDeepLink.current = true;
      setSelectedId(deviceId);
      window.history.replaceState({}, '');
    }
  }, [location.state, list.data, devices]);

  const pageStatus = !service.ready
    ? 'unavailable'
    : list.status === 'ready' && devices.length === 0
      ? 'empty'
      : list.status;

  const patchDevice = (updated: Device) => setDevices((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));

  // Room.deviceCount/status are derived server-side, never computed
  // client-side (same rule as SmartHomePage) — refresh every room touched by
  // a mutation from the service itself, fully awaited.
  const refreshRooms = useCallback(
    async (roomIds: string[]) => {
      const uniqueIds = Array.from(new Set(roomIds));
      if (uniqueIds.length === 0) return;
      const refreshed = await Promise.all(uniqueIds.map((id) => service.getRoom(id)));
      setRooms((prev) => prev.map((r) => refreshed.find((updated) => updated.id === r.id) ?? r));
    },
    [service],
  );

  const handleSave = async (id: string, input: UpdateDeviceInput) => {
    const before = devices.find((d) => d.id === id);
    setSaving(true);
    try {
      const updated = await service.updateDevice(id, input);
      patchDevice(updated);
      const touchedRooms = [before?.roomId, updated.roomId].filter((r): r is string => !!r);
      await refreshRooms(touchedRooms);
      toast({ title: 'Device updated', description: updated.name, variant: 'success' });
    } catch (err) {
      toast({
        title: 'Could not update device',
        description: err instanceof Error ? err.message : String(err),
        variant: 'danger',
      });
    } finally {
      setSaving(false);
    }
  };

  const confirmRemove = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await service.removeDevice(deleteTarget.id);
      setDevices((prev) => prev.filter((d) => d.id !== deleteTarget.id));
      await refreshRooms([deleteTarget.roomId]);
      toast({ title: 'Device removed', description: deleteTarget.name });
      setDeleteTarget(null);
      if (selectedId === deleteTarget.id) setSelectedId(null);
    } catch (err) {
      toast({
        title: 'Could not remove device',
        description: err instanceof Error ? err.message : String(err),
        variant: 'danger',
      });
    } finally {
      setDeleting(false);
    }
  };

  const handlePair = async (input: PairDeviceInput) => {
    setPairing(true);
    try {
      const created = await service.pairDevice(input);
      setDevices((prev) => [...prev, created]);
      await refreshRooms([created.roomId]);
      toast({ title: 'Device paired', description: created.name, variant: 'success' });
      setPairOpen(false);
    } catch (err) {
      toast({
        title: 'Could not pair device',
        description: err instanceof Error ? err.message : String(err),
        variant: 'danger',
      });
    } finally {
      setPairing(false);
    }
  };

  const term = filterText.trim().toLowerCase();
  const filteredDevices = devices
    .filter((d) => roomFilter === 'all' || d.roomId === roomFilter)
    .filter((d) => !term || matches(d, roomNameById.get(d.roomId) ?? '', term))
    .sort((a, b) => a.name.localeCompare(b.name));

  const counts = {
    total: devices.length,
    online: devices.filter((d) => d.availability === 'online').length,
    needsAttention: devices.filter((d) => d.availability !== 'online').length,
    lowBattery: devices.filter((d) => typeof d.battery === 'number' && d.battery <= LOW_BATTERY_THRESHOLD).length,
  };

  return (
    <>
      <ModulePage
        title="Device Management"
        description={
          service.ready
            ? 'Rename, reassign, pair, and remove simulated devices, and review their health metadata. Everything shown here is simulated and local to this frontend session.'
            : `${service.label} — device management data is not connected yet.`
        }
        actions={
          <Button
            leftIcon={<Plus className="size-4" />}
            onClick={() => setPairOpen(true)}
            data-testid="device-management-pair-new"
            disabled={!service.ready}
          >
            Pair new device
          </Button>
        }
        status={pageStatus}
        onRetry={list.reload}
        error={list.error}
        stateProps={
          pageStatus === 'empty'
            ? {
                title: 'No devices yet',
                description: 'Pair a simulated device to start managing it here.',
                action: (
                  <Button
                    leftIcon={<Plus className="size-4" />}
                    onClick={() => setPairOpen(true)}
                    data-testid="device-management-pair-new-empty"
                  >
                    Pair new device
                  </Button>
                ),
              }
            : undefined
        }
      >
        <div className="flex flex-col gap-6 pb-16" data-testid="device-management-page">
          <div
            className="flex items-start gap-3 rounded-lg border border-warning/40 bg-warning-soft p-4"
            role="note"
            data-testid="device-management-simulation-banner"
          >
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden="true" />
            <div className="flex flex-col gap-0.5">
              <span className="text-body-sm font-semibold text-content">
                Simulated devices — no real hardware is connected
              </span>
              <span className="text-body-sm text-content-secondary">
                Every device managed on this page is simulated inside this browser tab's memory. Pairing a "new"
                device runs no real Bluetooth/Zigbee/WiFi/Home Assistant/MQTT discovery protocol — it is a UI-only
                simulation, and nothing here affects anything physical.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Devices" value={counts.total} icon={<Cpu />} />
            <StatCard label="Online" value={counts.online} icon={<Wifi />} />
            <StatCard label="Needs attention" value={counts.needsAttention} icon={<Radio />} />
            <StatCard label="Low battery" value={counts.lowBattery} icon={<BatteryWarning />} />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Search
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              onClear={() => setFilterText('')}
              placeholder="Filter devices…"
              aria-label="Filter devices"
              data-testid="device-management-filter-input"
              className="sm:max-w-sm"
            />
            <Select value={roomFilter} onValueChange={setRoomFilter}>
              <SelectTrigger
                aria-label="Filter by room"
                className="sm:w-[180px]"
                data-testid="device-management-room-filter"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All rooms</SelectItem>
                {rooms.map((room) => (
                  <SelectItem key={room.id} value={room.id}>
                    {room.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Widget
            title="Devices"
            icon={<Cpu />}
            status={filteredDevices.length === 0 ? 'empty' : 'ready'}
            emptyTitle="No matching devices"
            emptyDescription="Try a different search term or room filter."
          >
            <List className="divide-y divide-line-subtle" data-testid="device-management-list">
              {filteredDevices.map((device) => (
                <DeviceManagementRow
                  key={device.id}
                  device={device}
                  roomName={roomNameById.get(device.roomId) ?? 'Unknown room'}
                  onOpen={setSelectedId}
                />
              ))}
            </List>
          </Widget>
        </div>
      </ModulePage>

      <DeviceManagementDrawer
        device={selected}
        rooms={rooms}
        open={selectedId !== null}
        onOpenChange={(open) => !open && setSelectedId(null)}
        onSave={handleSave}
        saving={saving}
        onRemove={(device) => setDeleteTarget(device)}
      />

      <Modal open={pairOpen} onOpenChange={(open) => !pairing && setPairOpen(open)}>
        <ModalContent size="lg" data-testid="pair-device-modal">
          <ModalHeader>
            <ModalTitle>Pair new device</ModalTitle>
            <ModalDescription>
              Simulated pairing only — no real discovery protocol runs. Choose a name, room, type, and
              capabilities.
            </ModalDescription>
          </ModalHeader>
          <PairDeviceForm rooms={rooms} onSubmit={handlePair} onCancel={() => setPairOpen(false)} submitting={pairing} />
        </ModalContent>
      </Modal>

      <Modal open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <ModalContent size="sm" data-testid="device-management-remove-modal">
          <ModalHeader>
            <ModalTitle>Remove device?</ModalTitle>
            <ModalDescription>
              {deleteTarget
                ? `"${deleteTarget.name}" will be unpaired and permanently removed. This cannot be undone.`
                : ''}
            </ModalDescription>
          </ModalHeader>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={deleting}
              onClick={confirmRemove}
              data-testid="device-management-remove-confirm"
            >
              Remove
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
