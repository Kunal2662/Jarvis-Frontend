# Required from JARVIS Core — Developer Mode Contract

**Status:** ✅ No Core contract is required for what this frontend pass
actually built. Per `docs/JARVIS_CORE_FRONTEND_MAPPING.md`'s own row for
Developer Mode:

> `| Developer Mode | Cross-cutting | ⚠️ Verify | 🔴/placeholder | Expose
> real diagnostics/events only. |`

That instruction — "expose real diagnostics/events only" — is the entire
scope boundary for this step. Developer Mode is **not** a second
orchestration/permission/execution system, does not invent a Core or MCP
endpoint, and does not talk to real hardware. Concretely, this frontend
pass built:

1. **`developerModeEnabled`** — one new boolean field, additive, on the
   already-existing `SettingsService` seam
   (`frontend/src/features/settings/settingsService.ts`), following the
   exact same pattern `notificationsEnabled` established in Step 19. It
   persists to `localStorage` via the existing `mockSettingsAdapter.ts` —
   no new adapter, no new Core contract.
2. A real, verifiable effect: when on, `AppLayout.tsx`'s Command Palette
   "Go to" group includes `app/modules.tsx`'s `developerModules` (currently
   just the pre-existing Design System page, `/design`) — a selector that
   existed, unused, since Step 2. This is discoverability only; `/design`
   was always reachable by direct URL regardless of the toggle.
3. A "System registry" summary card on the new Settings → Developer tab
   that reads `DiagnosticsService.getSystemStatus()` (Step 20) — real,
   already-computed data — and links to `/diagnostics`, rather than
   re-deriving or duplicating it.

None of this required, invented, or assumed a Core API, event stream, or
feature-flag service.

## What a *future*, deeper Developer Mode would need from Core

If a later step wants Developer Mode to show genuinely Core-side
information — not just this frontend's own local state — the following
would need a real, verified Core contract first (do not guess or invent
any of this):

1. **Real Core event/log streaming**: does Core expose any
   developer-facing event stream (tool calls, planning steps, permission
   decisions) this UI could tail? Transport (WebSocket/SSE) and event
   schema are both unknown.
2. **Real feature-flag/config control**: does Core have its own
   feature-flag or config system this frontend could read/toggle, or would
   a "mock vs. Core" backend switch ever need to be a *runtime* control
   here instead of the current build-time `VITE_*_BACKEND` env vars each
   feature seam already reads?
3. **Real Core health/self-healing internals**: this is really M13B's
   domain — see `docs/CORE_DIAGNOSTICS_CONTRACT_REQUIRED.md`, which this
   step deliberately does not duplicate.
4. **Permissions**: should a genuinely Core-connected developer surface be
   gated behind something stronger than a local, unauthenticated
   `localStorage` toggle (e.g. a real permission/role check performed by
   Core)?

Until any of the above is answered with a verified contract, Developer
Mode stays exactly what it is today: a local discoverability toggle over
already-real, already-built frontend surfaces. Do not build a second
diagnostics/events/logging pipeline against this seam, and do not present
anything here as a live view into Core internals.
