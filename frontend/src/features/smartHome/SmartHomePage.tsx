import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertTriangle, House, Lightbulb, Plug, Settings, Sparkles, Wifi } from 'lucide-react';
import {
  Button,
  EmptyState,
  ModulePage,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  StatCard,
  useAsync,
  useToast,
} from '../../design-system';
import {
  getSmartHomeService,
  type Device,
  type DeviceCommand,
  type DeviceCommandValue,
  type Room,
  type Scene,
} from './smartHomeService';
import { RoomCard } from './RoomCard';
import { DeviceTile } from './DeviceTile';
import { SceneCard } from './SceneCard';

interface SmartHomeData {
  rooms: Room[];
  devices: Device[];
  scenes: Scene[];
}

const DISCRETE_COMMANDS = new Set<DeviceCommand>(['TURN_ON', 'TURN_OFF', 'LOCK', 'UNLOCK']);

function commandVerb(command: DeviceCommand): string {
  switch (command) {
    case 'TURN_ON':
      return 'turned on';
    case 'TURN_OFF':
      return 'turned off';
    case 'LOCK':
      return 'locked';
    case 'UNLOCK':
      return 'unlocked';
    default:
      return 'updated';
  }
}

export function SmartHomePage() {
  const service = useMemo(() => getSmartHomeService(), []);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const list = useAsync<SmartHomeData>(
    async (signal) => {
      const [rooms, devices, scenes] = await Promise.all([
        service.getRooms(signal),
        service.getDevices(undefined, signal),
        service.getScenes(signal),
      ]);
      return { rooms, devices, scenes };
    },
    { isEmpty: (data) => data.rooms.length === 0 && data.devices.length === 0 },
  );

  // Local, patchable copies. Mutations (sendCommand/triggerScene) update these
  // in place instead of re-fetching, so a control never flashes the whole
  // page back to a full loading spinner — mirrors AutomationsPage/AiAppsPage.
  const [rooms, setRooms] = useState<Room[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [scenes, setScenes] = useState<Scene[]>([]);
  useEffect(() => {
    if (list.data) {
      setRooms(list.data.rooms);
      setDevices(list.data.devices);
      setScenes(list.data.scenes);
    }
  }, [list.data]);

  const [roomFilter, setRoomFilter] = useState<string>('all');
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [triggeringSceneId, setTriggeringSceneId] = useState<string | null>(null);
  const [highlightedDeviceId, setHighlightedDeviceId] = useState<string | null>(null);
  const [highlightedSceneId, setHighlightedSceneId] = useState<string | null>(null);

  // Deep-link support (mirrors AutomationsPage/AiAppsPage): Universal Search
  // navigates here with `state: { roomId }` / `{ deviceId }` / `{ sceneId }`.
  // There is no detail drawer in this step, so a room/device link filters the
  // Devices section to the right room, and a device/scene link also applies a
  // temporary highlight so the result is visibly findable.
  const consumedDeepLink = useRef(false);
  useEffect(() => {
    if (consumedDeepLink.current || !list.data) return;
    const state = (location.state as { roomId?: string; deviceId?: string; sceneId?: string } | null) ?? null;
    if (!state) return;

    if (state.deviceId) {
      const device = devices.find((d) => d.id === state.deviceId);
      if (!device) return;
      consumedDeepLink.current = true;
      setRoomFilter(device.roomId);
      setHighlightedDeviceId(device.id);
      window.history.replaceState({}, '');
    } else if (state.roomId) {
      if (!rooms.some((r) => r.id === state.roomId)) return;
      consumedDeepLink.current = true;
      setRoomFilter(state.roomId);
      window.history.replaceState({}, '');
    } else if (state.sceneId) {
      if (!scenes.some((s) => s.id === state.sceneId)) return;
      consumedDeepLink.current = true;
      setHighlightedSceneId(state.sceneId);
      window.history.replaceState({}, '');
    }
  }, [location.state, list.data, devices, rooms, scenes]);

  // Light realtime seam: subscribe to every sensor-capable device so the
  // mock adapter's simulated drift (see subscribeToDeviceState in
  // mockSmartHomeAdapter.ts) is actually reflected in the UI, not just
  // present in the adapter. Re-subscribes only when the SET of device ids
  // changes, not on every state patch (a patch would otherwise create a new
  // `devices` array reference each time and needlessly tear down/recreate
  // the subscription, which the mock uses to start/stop a real interval).
  const sensorDeviceIds = devices.filter((d) => d.capabilities.includes('sensor')).map((d) => d.id);
  const sensorDeviceIdsKey = sensorDeviceIds.join(',');
  useEffect(() => {
    const unsubscribes = sensorDeviceIds.map((id) =>
      service.subscribeToDeviceState(id, (updated) => {
        setDevices((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
      }),
    );
    return () => unsubscribes.forEach((unsub) => unsub());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sensorDeviceIdsKey, service]);

  const pageStatus = !service.ready
    ? 'unavailable'
    : list.status === 'ready' && rooms.length === 0 && devices.length === 0
      ? 'empty'
      : list.status;

  const patchDevice = (updated: Device) => {
    setDevices((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
  };

  // Room.status/deviceCount are derived from device state by the adapter,
  // never computed client-side (to avoid a second aggregation engine — see
  // the `Room` interface's own doc comment in smartHomeService.ts). Refresh
  // every room touched by a batch of device changes from the service itself,
  // fully awaited, so the room overview stays honest after a scene trigger.
  const refreshRooms = async (roomIds: string[]) => {
    const uniqueIds = Array.from(new Set(roomIds));
    if (uniqueIds.length === 0) return;
    const refreshed = await Promise.all(uniqueIds.map((id) => service.getRoom(id)));
    setRooms((prev) => prev.map((r) => refreshed.find((updated) => updated.id === r.id) ?? r));
  };

  // A single device command patches that device only — the room overview
  // re-syncs from the service on the next full load or scene trigger rather
  // than after every individual toggle/slider change, which keeps this the
  // common, fast interaction path.
  const handleCommand = (deviceId: string, command: DeviceCommand, value?: DeviceCommandValue) => {
    const discrete = DISCRETE_COMMANDS.has(command);
    if (discrete) setPendingIds((prev) => new Set(prev).add(deviceId));

    service
      .sendCommand(deviceId, command, value)
      .then((updated) => {
        patchDevice(updated);
        if (discrete) {
          toast({ title: `${updated.name} ${commandVerb(command)}`, variant: 'success' });
        }
      })
      .catch((err: unknown) => {
        toast({
          title: 'Could not update device',
          description: err instanceof Error ? err.message : String(err),
          variant: 'danger',
        });
      })
      .finally(() => {
        if (discrete) {
          setPendingIds((prev) => {
            const next = new Set(prev);
            next.delete(deviceId);
            return next;
          });
        }
      });
  };

  const handleTriggerScene = async (scene: Scene) => {
    setTriggeringSceneId(scene.id);
    try {
      const changed = await service.triggerScene(scene.id);
      changed.forEach(patchDevice);
      await refreshRooms(changed.map((d) => d.roomId));
      toast({
        title: changed.length > 0 ? `${scene.name} activated` : `${scene.name} triggered`,
        description:
          changed.length > 0
            ? `${changed.length} device${changed.length === 1 ? '' : 's'} updated.`
            : 'No devices were affected — every targeted device is offline or unavailable.',
        variant: changed.length > 0 ? 'success' : 'info',
      });
    } catch (err) {
      toast({
        title: 'Could not trigger scene',
        description: err instanceof Error ? err.message : String(err),
        variant: 'danger',
      });
    } finally {
      setTriggeringSceneId(null);
    }
  };

  const onlineCount = devices.filter((d) => d.availability === 'online').length;
  const filteredDevices = roomFilter === 'all' ? devices : devices.filter((d) => d.roomId === roomFilter);

  return (
    <ModulePage
      title="Smart Home"
      description={
        service.ready
          ? 'Rooms, devices, and scenes. Everything shown here is simulated and local to this frontend session.'
          : `${service.label} — smart home data is not connected yet.`
      }
      actions={
        <>
          <Button
            variant="secondary"
            leftIcon={<Plug className="size-4" />}
            onClick={() => navigate('/smart-home/integrations')}
            data-testid="smart-home-integrations"
          >
            Integrations
          </Button>
          <Button
            variant="secondary"
            leftIcon={<Settings className="size-4" />}
            onClick={() => navigate('/smart-home/devices')}
            disabled={!service.ready}
            data-testid="smart-home-manage-devices"
          >
            Manage devices
          </Button>
        </>
      }
      status={pageStatus}
      onRetry={list.reload}
      error={list.error}
      stateProps={
        pageStatus === 'empty'
          ? {
              title: 'No rooms or devices yet',
              description: 'Simulated smart home data will appear here once available.',
            }
          : undefined
      }
    >
      <div className="flex flex-col gap-6 pb-16" data-testid="smart-home-page">
        <div
          className="flex items-start gap-3 rounded-lg border border-warning/40 bg-warning-soft p-4"
          role="note"
          data-testid="smart-home-simulation-banner"
        >
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden="true" />
          <div className="flex flex-col gap-0.5">
            <span className="text-body-sm font-semibold text-content">
              Simulated devices — no real hardware is connected
            </span>
            <span className="text-body-sm text-content-secondary">
              Every room, device, and scene on this page is simulated inside this browser tab's memory. Nothing
              here is wired to a real smart-home hub, Home Assistant instance, or MQTT broker — no command you
              send from this page affects anything physical.
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Rooms" value={rooms.length} icon={<House />} />
          <StatCard label="Devices" value={devices.length} icon={<Lightbulb />} />
          <StatCard label="Online" value={onlineCount} icon={<Wifi />} />
          <StatCard label="Scenes" value={scenes.length} icon={<Sparkles />} />
        </div>

        <section className="flex flex-col gap-3">
          <h2 className="text-h3 text-content">Rooms</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3" data-testid="smart-home-room-list">
            {rooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                selected={roomFilter === room.id}
                onSelect={(id) => setRoomFilter((current) => (current === id ? 'all' : id))}
              />
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-h3 text-content">Devices</h2>
            <Select value={roomFilter} onValueChange={setRoomFilter}>
              <SelectTrigger
                aria-label="Filter devices by room"
                className="w-[180px]"
                data-testid="smart-home-room-filter"
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

          {filteredDevices.length === 0 ? (
            <EmptyState
              className="py-8"
              icon={<Lightbulb />}
              title="No devices in this room"
              description="Choose a different room filter to see more devices."
            />
          ) : (
            <div
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
              data-testid="smart-home-device-list"
            >
              {filteredDevices.map((device) => (
                <DeviceTile
                  key={device.id}
                  device={device}
                  pending={pendingIds.has(device.id)}
                  highlighted={highlightedDeviceId === device.id}
                  onCommand={handleCommand}
                />
              ))}
            </div>
          )}
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-h3 text-content">Scenes</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3" data-testid="smart-home-scene-list">
            {scenes.map((scene) => (
              <SceneCard
                key={scene.id}
                scene={scene}
                highlighted={highlightedSceneId === scene.id}
                triggering={triggeringSceneId === scene.id}
                onTrigger={handleTriggerScene}
              />
            ))}
          </div>
        </section>
      </div>
    </ModulePage>
  );
}
