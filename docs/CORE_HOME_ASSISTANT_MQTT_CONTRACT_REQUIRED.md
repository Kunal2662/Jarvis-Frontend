# Required from JARVIS Core — Home Assistant + MQTT Integration Contract

**Status:** ⛔ Not available yet. The Home Assistant + MQTT integration UI is
wired to a pluggable `ConnectorService` seam
(`frontend/src/features/smartHome/smartHomeIntegrationService.ts`), one
instance per connector (`getHomeAssistantConnectorService()`,
`getMqttConnectorService()`). The default adapter for each is an **in-memory
frontend mock** (`adapters/mockHomeAssistantAdapter.ts`,
`adapters/mockMqttAdapter.ts`) — every connector's status, credential state,
and discovered-entity preview lives only in this browser tab's memory and is
reset on reload. **No real Home Assistant instance or MQTT broker is ever
contacted anywhere in this frontend.** A `core` adapter stub exists for each
connector (`adapters/coreHomeAssistantAdapter.ts`,
`adapters/coreMqttAdapter.ts`) but is intentionally unimplemented — **no Core
Home Assistant or MQTT endpoint has been invented.**

Once Claude Code ships the real Core contract for a connector, implement its
methods on the corresponding `core*ConnectorService`, set `ready: true`, and
select it with `VITE_HOME_ASSISTANT_BACKEND=core` /
`VITE_MQTT_BACKEND=core` (independent per connector — Core may ship one
before the other). **No UI changes should be required** — the integrations
page renders entirely against the `ConnectorState` / `DiscoveredEntity`
types already defined in `smartHomeIntegrationService.ts`.

## Scope of this frontend surface

Per the roadmap (Phase 6, item 15 "Home Assistant + MQTT" — the third and
final M12 item, following item 13 "Smart Home Command Center" and item 14
"Device Management") and `docs/CORE_SMART_HOME_CONTRACT_REQUIRED.md`'s own
scoping note for item 15 ("connecting/authenticating a Home Assistant
instance or MQTT broker, entity-mapping/discovery configuration, connector
health/status UI. The frontend never talks to a connector directly in any
adapter, mock or future-Core — only Core would, behind this seam"), this
frontend pass is **connector status, configuration, and diagnostics only**:

- Per-connector status (not configured / disconnected / connecting /
  connected / error), masked credential state (never a raw password/token —
  see below), instance display info (Home Assistant instance URL label /
  MQTT broker host:port label — cosmetic display strings only, never
  actually dialed), last-synced timestamp, and a diagnostics log.
- A mock "connect" flow that records a display label + marks credential
  state `configured` — it never performs a real HTTP/WebSocket handshake,
  never validates a real Home Assistant token or MQTT broker password, and
  never stores the entered secret anywhere retrievable (the mock adapter
  discards the raw value immediately after recording that *a* value was
  entered).
- A mock "sync entities" flow that returns a small, clearly-labeled
  **preview** list of `DiscoveredEntity` records, normalized into the same
  `DeviceType`/`DeviceCapability` vocabulary `smartHomeService.ts` already
  defines. This preview is **never merged into the live Smart Home Command
  Center's device list** (`mockSmartHomeAdapter.ts`'s seeded `devices`
  array) — doing so would mean a Step 15 mock silently mutating Step 13/14's
  established dataset and tests. A real Core integration would be the only
  thing authorized to actually add live-controllable devices to the
  Command Center.

Specifically **out of scope** for this frontend pass, by design:

- Any real network call to a Home Assistant instance or MQTT broker, in any
  adapter, mock or Core-stub. Per `JARVIS_FRONTEND_ARCHITECTURE.md`'s "do
  not implement a second integration framework" rule, this frontend never
  becomes an MQTT client or a Home Assistant REST/WebSocket client — that
  belongs entirely behind Core.
- Displaying, storing, or round-tripping any real credential value (API
  token, broker password, client certificate). The UI only ever renders the
  abstract `CredentialState` (`not_configured` / `configured` / `invalid` /
  `unavailable`).
- Actually adding synced entities to the Command Center's controllable
  device set (see above) — this pass is discovery/status/diagnostics only.
- Vendor-specific UI beyond the two connector types this roadmap item names
  (no generic "add any MQTT-like broker" plugin system, no Zigbee/Z-Wave
  gateway UI, etc.).
- A connector-specific command-execution path. Device control remains
  entirely on `SmartHomeService.sendCommand`, normalized, exactly as
  Steps 13-14 built it — this step does not add a second way to command a
  device.

## What the frontend adapter needs to map (`ConnectorService` interface)

- `getState(signal?) → ConnectorState` — `{ status, credentialState,
  instance?: { label, detail? }, lastSyncedAt?, discoveredEntities:
  DiscoveredEntity[], diagnostics: ConnectorDiagnosticEntry[] }`
- `connect(input: { endpoint, secret }, signal?) → ConnectorState` — `input`
  is display-only in the mock (an instance URL / broker host label, and an
  opaque secret string never persisted). A real adapter would need to
  actually pass this through Core for a real auth handshake.
- `disconnect(signal?) → ConnectorState`
- `reconnect(signal?) → ConnectorState`
- `syncEntities(signal?) → ConnectorState` — discovers/refreshes
  `discoveredEntities`, a **preview list**, per the scope note above.

## Open questions for JARVIS Core (unanswered — do not guess)

1. **Real endpoint(s)**: REST/WebSocket path(s) for connecting a Home
   Assistant instance or an MQTT broker, and for triggering/polling a sync —
   e.g. `POST /api/v1/integrations/home-assistant/connect`,
   `POST /api/v1/integrations/mqtt/connect`,
   `POST /api/v1/integrations/{type}/sync`, plus whatever transport realtime
   connector-status updates would use.
2. **Credential handling**: how does the frontend submit a Home Assistant
   long-lived access token or an MQTT broker username/password without ever
   holding it longer than the single request — does Core provide a
   short-lived, purpose-scoped submission channel, and what does the
   frontend receive back to represent "configured" (never the credential
   itself)?
3. **Discovery/sync semantics**: is entity discovery a one-time sync, a
   polled refresh, or a live subscription? How does a discovered entity get
   promoted into the Command Center's live, controllable device set — is
   that a separate explicit "add to Smart Home" action, or automatic? This
   frontend pass does not implement that promotion step because the answer
   is unknown.
4. **Entity → normalized-model mapping**: who performs the mapping from a
   Home Assistant entity (`light.living_room`, `climate.thermostat`, etc.)
   or an MQTT topic/payload schema into this frontend's `DeviceType` /
   `DeviceCapability` / `DeviceState` vocabulary — Core, or does the
   frontend need a per-vendor mapping table? If the frontend needs one, what
   is the authoritative source for it (so it doesn't silently drift from
   what Core actually reports)?
5. **Connection health / reconnect**: what does a dropped connection look
   like from Core's perspective — does Core auto-reconnect and the frontend
   just polls/subscribes to status, or does the frontend need to explicitly
   trigger reconnect (as this mock assumes)? What's the backoff/retry
   contract?
6. **Errors**: structured error codes (invalid credential, unreachable
   instance/broker, timeout, unsupported entity type) vs. free-text, and
   which are safe to surface directly (e.g. "could not reach broker" is
   safe and expected; internal connector implementation details probably
   should not leak).
7. **Multiple instances**: can a user configure more than one Home Assistant
   instance or MQTT broker, or is it exactly one of each? This mock assumes
   exactly one of each, matching how `docs/CORE_SMART_HOME_CONTRACT_REQUIRED.md`
   scoped item 15 originally (singular "a Home Assistant instance or MQTT
   broker").
8. **Relationship to `SmartHomeService`**: confirms the `DeviceConnector`
   metadata already on `Device` (`smartHomeService.ts`, added in Step 14) —
   `{ type: 'home_assistant' | 'mqtt' | 'native', externalId? }` — is
   read-only display data sourced from wherever Core ultimately performs the
   entity → device promotion in question 3, not something this integration
   seam writes to directly.

Until these are provided, the in-memory mock adapters remain the only
verified frontend behavior and stay the default. Do not present connector
status as a real, live Home Assistant/MQTT connection, and do not build a
real MQTT client or Home Assistant REST/WebSocket client against this
seam — nothing this UI does today reaches real infrastructure.
