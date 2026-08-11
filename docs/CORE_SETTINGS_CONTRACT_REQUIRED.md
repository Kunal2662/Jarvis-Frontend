# Required from JARVIS Core — Settings Contract

**Status:** ⛔ Not available yet. The Settings UI is wired to a pluggable
`SettingsService` seam (`frontend/src/features/settings/settingsService.ts`).
The default adapter persists to this browser's `localStorage`
(`adapters/mockSettingsAdapter.ts`) — every preference lives only on this
device and is never synced anywhere. **No real Core settings/preferences
endpoint is ever contacted anywhere in this frontend.** A `core` adapter
stub exists (`adapters/coreSettingsAdapter.ts`) but is intentionally
unimplemented — **no Core Settings endpoint has been invented.**

Once Claude Code ships a real Core Settings/Preferences API, implement its
methods on `coreSettingsService`, set `ready: true`, and select it with
`VITE_SETTINGS_BACKEND=core`. **No `SettingsPage`/UI changes should be
required** — the page renders entirely against the `AppSettings` type
already defined in `settingsService.ts`.

## Repository search performed before implementation

Searched this checkpoint (excluding `2.0-main/` and
`Jarvis-Frontend-main/backend/`, per project scope) for a verified Core
contract covering: settings, preferences, user preferences, appearance,
theme, notifications, voice, audio, language, privacy, security, smart
home preferences, automation preferences, memory preferences, AI provider
settings, connection settings, system settings, device settings.

**No such contract exists anywhere in `docs/JARVIS_CORE_MILESTONES.md`,
`docs/JARVIS_CORE_FRONTEND_MAPPING.md`, or any other checkpoint document.**
`JARVIS_CORE_FRONTEND_MAPPING.md` has no row for "Settings" at all — Phase 8
("System") of `FRONTEND_IMPLEMENTATION_ROADMAP.md` is a frontend-only
grouping, not a mapped Core milestone. None was invented.

## Scope of this frontend surface

Settings (roadmap item 19) is the **user-facing configuration surface for
systems that already exist** — it does not own any intelligence, and it
does not duplicate any other feature's data model. Concretely:

- **Appearance** is NOT owned by `SettingsService`. It reads/writes the
  existing, already-shipped `ThemeProvider`
  (`design-system/theme/ThemeProvider.tsx`) directly — the same engine
  `QuickSettings` already uses. This avoids a second theme engine, per
  `docs/FRONTEND_CONTINUATION_GUIDE.md`'s "don't rebuild working
  components" rule.
- **Voice** is a read-only status view over the existing `VoiceService`
  seam (`features/voice/voiceService.ts`) — backend id/label/ready and
  STT/TTS capability flags. No microphone/speaker selection is offered
  because no such control exists in the underlying seam; building one here
  would be a fake control with no real effect.
- **Smart Home / Connections** is a read-only summary over the existing
  `SmartHomeService` and `ConnectorService` seams
  (`features/smartHome/smartHomeService.ts`,
  `smartHomeIntegrationService.ts`), reusing the already-built
  `ConnectorCard` component. Connect/disconnect/sync stays exclusively on
  `IntegrationsPage` (Step 15) — Settings only links there.
- **AI Apps, Memory, Agents, Automations** are each a read-only summary
  over their existing service seam, with a link to that feature's own
  page. No catalog, recall, or orchestration logic is duplicated here.
- **Notifications** owns exactly one real, `SettingsService`-backed
  preference — `notificationsEnabled` — which genuinely gates the
  `NotificationCenter` bell and its unread badge in `AppLayout.tsx`. No
  per-category notification toggles (e.g. "automation alerts", "device
  alerts") were built, because no per-category notification data model
  exists anywhere in this checkpoint; adding toggles with no real effect
  would violate the explicit "no fake toggle" requirement for this step.
- **Privacy** is informational plus a real link into Memory
  (`/memory`, where recall/forget already lives). No frontend toggle
  claims to change Core-side data retention, because no verified Core
  contract for that exists — see the open questions below.
- **About** shows the frontend's own `package.json` version (real, not
  fabricated) plus each backend seam's actual `id` / `label` / `ready`
  values, read live from `getXService()` — never hardcoded strings.

## What the frontend adapter needs to map (`SettingsService` interface)

- `getSettings(signal?) → AppSettings` — currently `{ notificationsEnabled
  }`
- `updateSettings(patch, signal?) → AppSettings` — partial update, mock
  persists to `localStorage`
- `resetSettings(signal?) → AppSettings` — restores documented defaults

## Open questions for JARVIS Core (unanswered — do not guess)

1. **Sync**: should preferences follow the user across devices, or stay
   local to a browser/install the way this mock behaves today?
2. **Ownership boundary**: for settings that configure another Core-owned
   feature (e.g. a future "voice auto-listen" preference), does Core want
   to own that preference directly (as part of the owning feature's own
   contract) or delegate it to a generic Settings/Preferences service?
3. **Data retention**: is there a real Core-side data-retention/deletion
   control this frontend should eventually expose under Privacy (e.g. "let
   Core forget everything from before date X")? Nothing like this exists
   in any checkpoint document today.
4. **Notification delivery**: does Core ever push real notifications this
   frontend should render (vs. today's static, hardcoded
   `AppLayout.tsx` sample list)? If so, a category taxonomy would need to
   come from Core, not be invented client-side.
5. **Endpoint(s)**: REST/WebSocket path(s) for get/update/reset, and
   whether settings changes should be broadcast to other open tabs/devices
   in real time.
6. **Permissions**: are any settings gated behind a permission/role (e.g.
   security-sensitive toggles), or are all preferences low-risk by
   definition?

Until these are provided, the `localStorage`-backed mock adapter remains
the only verified frontend behavior and stays the default. Do not present
it as a real, synced, multi-device preferences store — nothing this UI
does today reaches Core.
