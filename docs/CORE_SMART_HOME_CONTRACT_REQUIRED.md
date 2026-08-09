# Required from JARVIS Core — Smart Home Contract

**Status:** ⛔ Not available yet. The Smart Home Command Center UI is wired
to a pluggable `SmartHomeService` seam
(`frontend/src/features/smartHome/smartHomeService.ts`). The default adapter
is an **in-memory frontend mock** (`adapters/mockSmartHomeAdapter.ts`) —
every room, device, and scene lives only in this browser tab's memory and is
reset on reload. **No real hardware, Home Assistant instance, or MQTT
broker is ever contacted anywhere in this frontend.** A `core` adapter stub
exists (`adapters/coreSmartHomeAdapter.ts`) but is intentionally
unimplemented — **no Core Smart Home, Home Assistant, or MQTT endpoint has
been invented.**

Once Claude Code ships the real Core Smart Home API, implement each method
on `coreSmartHomeService`, set `ready: true`, and select it with
`VITE_SMART_HOME_BACKEND=core`. **No `SmartHomePage`/UI changes should be
required** for the room/device/scene browsing and control behavior — the
page renders entirely against the `Room` / `Device` / `Scene` /
`DeviceCapability` / `DeviceCommand` types already defined in
`smartHomeService.ts`. Realtime push (see below) almost certainly *will*
need Core-side design decisions this mock does not make for you.

## Scope of this frontend surface

Per the roadmap (Phase 6, item 13 "Smart Home Command Center" — the first of
three separate M12 items) and `JARVIS_CORE_MILESTONES.md` (M12 — Smart Home &
IoT Platform — 🟡 Active; Home Assistant and MQTT connectors are marked
"shipped" on the Core side, but M12 overall "remains incomplete" and no
concrete API contract is documented anywhere in this frontend checkpoint),
this is the **Command Center only**: a room overview, a device grid with
inline controls, and a scenes section. Specifically **out of scope** for
this frontend pass, by design, and reserved for later roadmap items:

- **Device Management** (roadmap item 14) — deep per-device settings,
  pairing/onboarding new devices, firmware/diagnostics, device renaming or
  reassignment between rooms. None of that exists in this pass; devices are
  a fixed seeded set.
- **Home Assistant + MQTT connector configuration** (roadmap item 15) —
  connecting/authenticating a Home Assistant instance or MQTT broker,
  entity-mapping/discovery configuration, connector health/status UI. The
  frontend never talks to a connector directly in any adapter, mock or
  future-Core — only Core would, behind this seam.
- Any vendor-specific UI (no Philips Hue, Tuya, Shelly, or similar
  branded components/flows) — every entity is normalized
  (`Room`/`Device`/`DeviceCapability`/`DeviceCommand`/`Scene`) per
  `JARVIS_FRONTEND_ARCHITECTURE.md`'s "do not implement a second
  smart-home protocol engine" rule.
- An autonomous scene engine. Scenes are pre-defined data the frontend
  displays and triggers only — there is no scene *creation/editing* UI, no
  client-side condition/trigger evaluation, and no scheduling.
- Real device discovery/pairing (`getRooms`/`getDevices` return a fixed
  seeded set, never anything discovered).

## What the frontend adapter needs to map (`SmartHomeService` interface)

- `getRooms(signal?) → Room[]` — `{ id, name, icon?, deviceCount, status }`;
  `deviceCount` and `status` ('all_off' | 'some_on' | 'all_on') are derived
  from current device state on every call, never stored/stale
- `getRoom(id, signal?) → Room`
- `getDevices(roomId?, signal?) → Device[]` — all devices, or only those in
  `roomId` when provided
- `getDevice(id, signal?) → Device` — `{ id, name, roomId, type,
  capabilities: DeviceCapability[], state, availability, updatedAt }`
- `sendCommand(deviceId, command: DeviceCommand, value?, signal?) →
  Device` — `command` is one of `TURN_ON | TURN_OFF | SET_BRIGHTNESS |
  SET_TEMPERATURE | SET_FAN_SPEED | LOCK | UNLOCK`; `value` is only used by
  the `SET_*` commands
- `getScenes(signal?) → Scene[]` — `{ id, name, description, icon?,
  actions: { deviceId, summary }[] }`; `actions` is a **display-only**
  human-readable summary list, never an executable DSL Core would parse
- `triggerScene(id, signal?) → Device[]` — applies the scene and returns
  only the devices that actually changed (a target device that is
  offline/unavailable is skipped, never faked as updated)
- `subscribeToDeviceState(deviceId, callback) → unsubscribeFn` — an
  **optional, light** realtime seam. The mock fires `callback` on every
  genuine state change from `sendCommand`/`triggerScene`, plus simulates
  occasional drift for one seeded sensor device via a single interval, to
  prove the seam is real rather than decorative. This is deliberately *not*
  a general per-device push architecture — see "Realtime/events" below for
  what a real implementation would actually need.

## Normalized entity/capability model this mock assumes

- `DeviceCapability`: `power | brightness | temperature | fan_speed | lock |
  media | sensor`
- `DeviceType` (a human-facing label, never a vendor product name): `Light |
  Thermostat | Fan | Lock | Speaker | Sensor | Switch`
- `DeviceState` fields are optional and only present for capabilities the
  device actually has: `power?: boolean`, `brightness?: number` (0-100),
  `temperature?: number` (°C), `fanSpeed?: 'low'|'medium'|'high'`,
  `locked?: boolean`, `sensorValue?: { label, value }` (read-only)
- `DeviceAvailability`: `online | offline | unavailable`

Core does not need to adopt these exact shapes, but any real contract needs
*some* normalized capability/state model the frontend can map to without
branching on vendor/connector identity in the UI layer.

## What Core must actually define before real integration

1. **Device discovery**: how are devices enumerated — a one-time sync, a
   live subscription, or both? Does discovery differ per connector (Home
   Assistant vs. MQTT vs. future connectors), and does the frontend ever see
   that difference, or is it fully normalized by Core first?
2. **Room/area structure**: is "room" a first-class Core entity (as this
   mock assumes) or a client-side grouping over a flatter device list? Who
   assigns a device to a room — Core/connector-provided, or user-configured
   (and if user-configured, where does that live)?
3. **Capability/state schema**: a stable, versioned schema for capabilities
   and their state shapes so the frontend isn't hand-coding per-device-type
   branches — including how a new capability type gets introduced without
   breaking older frontend builds.
4. **Command execution + results**: synchronous command acknowledgment vs.
   fire-and-forget with a separate state update? What does a failed command
   look like (device unreachable, command rejected, timeout) — a structured
   error the frontend can render distinctly from "succeeded"?
5. **Realtime/events**: is there a WebSocket/SSE event stream for device
   state changes, or does the frontend need to poll? If push-based, what is
   the subscribe/unsubscribe contract per device (or per room, or globally),
   reconnect/backoff behavior, and how are missed events during a
   disconnect handled (resync on reconnect vs. assume nothing changed)?
6. **Device health**: online/offline/unavailable as this mock has, or a
   richer health model (battery level, signal strength, last-seen
   timestamp, firmware version)? Some of this may belong to the later
   Device Management step (item 14) rather than this Command Center.
7. **Scenes**: are scenes authored in Core/connector config (e.g. existing
   Home Assistant scenes) and only *triggered* by the frontend (as this mock
   assumes), or does JARVIS's own automation/scene engine own scene
   definition separately from per-vendor scenes? How does triggering a scene
   report partial success (some devices updated, others failed)?
8. **Authentication/permissions**: what credentials does the frontend need
   to call this API, and — critically — commands that affect physical
   devices must route through Jarvis's planned Permission Engine / Execution
   Engine / Tool Registry (per `JARVIS_FRONTEND_ARCHITECTURE.md`) rather than
   the frontend calling a device-command endpoint directly. What does a
   permission-denied response look like, and is per-device/per-room
   permission scoping needed (e.g. a guest profile that can't unlock doors)?
9. **Errors**: structured error codes vs. free-text, and which are safe to
   surface directly in the page's error/unavailable state (e.g. "device
   offline" is safe and expected to show the user; an internal connector
   fault probably shouldn't leak connector implementation details).
10. **Home Assistant/MQTT connector boundary**: the frontend must never call
    a connector directly — confirm the real contract is Core-mediated end to
    end (frontend → Core → connector → device), never
    frontend → connector → device, so vendor/connector identity never leaks
    into frontend code or UI.
11. **Endpoint(s)**: REST/WebSocket path(s) for
    list-rooms/list-devices/get-device/send-command/list-scenes/
    trigger-scene/subscribe — e.g. `GET /api/v1/smart-home/rooms`,
    `GET /api/v1/smart-home/devices?room={id}`,
    `POST /api/v1/smart-home/devices/{id}/command`,
    `GET /api/v1/smart-home/scenes`,
    `POST /api/v1/smart-home/scenes/{id}/trigger`, plus whatever transport
    realtime state uses (WebSocket channel, SSE stream, etc.).
12. **Relationship to Device Management (item 14) and Home Assistant + MQTT
    (item 15)**: which of the above genuinely belongs to *this* seam
    (`SmartHomeService`) versus a separate service those later steps would
    introduce (e.g. a `DeviceManagementService` for pairing/diagnostics, or
    a `ConnectorService` for Home Assistant/MQTT connection config)? This
    contract should be revisited once those steps are scoped, rather than
    assumed to cover everything Smart Home will ever need.

Until these are provided, the in-memory mock adapter remains the only
verified frontend behavior and stays the default. Do not present it as
production Core Smart Home, and do not build a real device-control system
against it — nothing this UI does today reaches a real device, and no
command sent from `SmartHomePage` should ever be described to a user as
affecting anything physical.
