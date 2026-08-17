# JARVIS Frontend — Technical Debt Register

**Snapshot date:** 2026-08-14 (Step 26 — Final QA + Frontend Freeze)
**Purpose:** An honest, classified inventory of what is actually owed versus what is intentional, Core-waiting architecture. Do not treat an `INTENTIONAL / WAITING FOR CORE` item as a defect — it is a deliberate seam, documented per-feature in its own `docs/CORE_*_CONTRACT_REQUIRED.md`.

**Method:** Compiled from the cumulative audits across Steps 20–26 (Diagnostics, Developer Mode, Global Command Center, Visual Identity, Responsive + Accessibility, Performance Engineering, and this step's final regression pass) plus a fresh Step 26 security/Core-boundary sweep. Nothing here is invented — every item traces to a specific, named file.

---

## CRITICAL

**None found.** No accidental secret exposure, no broken route, no data-loss path, no unhandled crash surface was found in this audit.

## HIGH

**None found.** No genuine accessibility blocker, no confirmed security gap, and no unresolved functional regression exists as of Step 26.

## MEDIUM

1. **Touch targets below the 44×44px ideal.** Topbar icon buttons (36px), `Switch` (38×22px), Modal/Drawer close buttons (32px) all exceed the WCAG 2.5.8 AA minimum (24×24px) but fall short of the 44px AAA/platform-HIG ideal. Deliberately left as-is in Step 24: the topbar has zero pixel headroom at 375px width to grow them without reintroducing horizontal overflow. Revisit only alongside a wider visual pass, not in isolation. — `design-system/primitives/Button/IconButton.tsx`, `design-system/primitives/Switch/`, `Modal.tsx`/`Drawer.tsx` close buttons.
2. **Production build duration grew** from ~14s to ~17–37s (run-to-run variance) after Step 25's route-splitting, since Rollup now renders ~30 chunks instead of 4. Expected, one-time build-time cost in exchange for a smaller shipped payload — not a runtime regression, but worth knowing if CI build-time budgets exist.

## LOW

1. **`Surface: 'contextual'`** in `app/modules.tsx`'s type union has been declared-but-unused since Step 2 — confirmed genuinely unread by any selector/consumer as of this audit too. Documented in-line as a reserved placeholder; harmless, but could be removed if a future cleanup pass wants zero unused type members.
2. **`Dock` component** (`design-system/patterns/Dock/`) is unused/unmounted — not composed into the default shell per the single-workspace architecture decision, retained only for a possible future edge case. Its one Framer Motion usage does not check `useReducedMotion` (every *live* consumer does), but since it's unreachable from any route today, this is dormant, not a live accessibility gap.
3. **No Lighthouse/FCP/LCP/CLS/TBT numbers exist for this frontend.** The available tooling this session could not capture a real Chrome DevTools performance trace. Bundle-size measurements (Step 25) are real; page-level performance metrics are not yet captured. Worth doing once a real hosting environment exists to test in.
4. **`.storybook/preview.tsx` has one pre-existing lint error** (`react-hooks/rules-of-hooks` on a `withTheme` decorator function). Predates this frontend's Step 20–26 work, unrelated to app code, explicitly preserved rather than silently fixed per every step's instructions. A background task to fix it was previously offered to the user and not completed.

## INTENTIONAL / WAITING FOR CORE

Every mock adapter in `docs/FRONTEND_CORE_INTEGRATION_HANDOFF.md` §2 (19 seams) is in this category by design — in-memory, resets on reload, explicitly disclosed as simulated in its own UI copy. Representative examples, not an exhaustive re-list (see the handoff doc for the complete, current table):

- **Authentication/sessions/RBAC** — do not exist at all yet; genuinely zero frontend work has been done here because no Core contract exists to build against.
- **Credential Manager / API keys** — the one credential-shaped UI (Home Assistant/MQTT connector secret field) is a write-only, never-persisted form; a real Credential Manager is entirely a future Core/backend concern.
- **Smart Home device execution** — every scene trigger/device command is a local, in-memory mutation; no real hardware, Home Assistant instance, or MQTT broker is ever contacted.
- **AgentOrchestrator wiring** — Chat/Voice/Agents all have real, working frontend seams pointed at either a mock or (Chat only) the existing development SSE endpoint; none reaches the real Core `AgentOrchestrator` yet, though Core's milestone snapshot marks it 🟡 Active.
- **Automations execution/scheduling** — full CRUD UI exists; nothing created ever actually runs.
- **Memory formation/semantic recall, Diagnostics Core-health (M13B), realtime device state** — each has an honest mock or explicit "unavailable" state rather than a fabricated one.

None of these are defects to "fix" in the frontend. They become HIGH/CRITICAL only if a future change starts presenting mock data as if it were real, or invents a Core endpoint that was never verified — the discipline maintained through Steps 0–26 (see every `CORE_*_CONTRACT_REQUIRED.md`) is what keeps this list this short.

---

## What changed since the last register (none existed before Step 26)

This is the first version of this document. Future updates should append a dated changelog entry here rather than silently rewriting history.
