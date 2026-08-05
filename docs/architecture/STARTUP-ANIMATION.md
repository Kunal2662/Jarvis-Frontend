# JARVIS — Startup Animation

**Status:** ⬜ **PENDING — NOT IMPLEMENTED**
**Priority:** Required milestone. The frontend is **not feature-complete** until this ships.
**Target phase:** Phase 7-D (see [ROADMAP.md](../../ROADMAP.md))
**Owner surface:** `frontend/src/features/startup/`

---

## 1. Objective

Create a premium startup sequence that feels like **powering on an advanced AI Operating System**,
not loading a website.

The user should feel that JARVIS is **waking up** — coming into presence naturally — rather than
being assembled or fetched. Smooth, minimal, cinematic, restrained.

This is a core part of the JARVIS experience, not decoration. It is the first thing that
communicates "this is an operating system, not a web app", and it sets the emotional register for
everything after it.

---

## 2. Hard constraints — what this must NOT be

| Forbidden | Why |
|---|---|
| ❌ Splash screen with text | Text is a website convention |
| ❌ "Loading…" messages | Waiting is not a feature |
| ❌ Progress bars | Implies a queue, not an awakening |
| ❌ Fake percentage counters | Dishonest and instantly recognisable as theatre |
| ❌ Logo bounce / spin / branding flourish | Ostentatious; the opposite of calm intelligence |
| ❌ Abrupt cuts between stages | Breaks continuity |
| ❌ A "skip" button as the primary affordance | If it needs skipping, it is too long |

The animation must never *announce* itself. It should feel like the machine was always on and is now
paying attention.

---

## 3. Animation sequence

Ten beats, continuous, **2–4 seconds total**. No stage boundary should be perceptible.

| # | Beat | Description | ~Timing | Drives |
|---|---|---|---|---|
| 1 | **Black** | True black canvas. Nothing. A held breath. | 0–150ms | `--surface-canvas` at full black, opacity 1 |
| 2 | **Ambient glow** | A faint radial cyan bloom rises from centre. Barely perceptible at first. | 150–500ms | `--ai-aura` radial gradient, opacity 0 → 0.15 |
| 3 | **Logo fade** | The JARVIS mark resolves out of the glow. Slow, no scale bounce. | 400–900ms | opacity 0 → 1, scale 0.98 → 1 |
| 4 | **Soft pulse** | One gentle breathing pulse — the system drawing its first breath. | 900–1300ms | scale 1 → 1.03 → 1, glow intensity follows |
| 5 | **Energy wave** | A single ring expands outward from the mark and dissipates at the edges. | 1200–1800ms | scale 0.2 → 2.4, opacity 0.6 → 0 |
| 6 | **Particles** | Ambient particles become visible in the wave's wake. Slow drift, low density. | 1600–2200ms | canvas layer, opacity 0 → 0.4 |
| 7 | **Glass materialises** | The interface substrate fades up — top bar, status bar, workspace frame — as frosted glass gaining opacity and blur. | 2000–2600ms | `backdrop-filter` 0 → full, surface opacity ramp |
| 8 | **Widgets cascade** | Workspace widgets fade+rise in sequence, ~60ms stagger, in reading order. | 2400–3200ms | staggered `y: 8 → 0`, opacity 0 → 1 |
| 9 | **Voice Orb activates** | The orb settles into its `idle` state; the aura stabilises. JARVIS is present. | 3000–3400ms | `VoiceOrb` state `offline` → `idle` |
| 10 | **Handoff** | The startup layer unmounts. No fade-to-white, no cut — the last frame of the animation **is** the first frame of Home. | 3400ms | startup layer `display: none`, app already interactive |

**Continuity requirement:** beats overlap. Each begins before the previous ends. There must be no
frame where the screen is static between stages.

### The handoff rule

The final frame of the animation and the first frame of the Home workspace must be **pixel-identical
in layout**. The startup layer renders the real shell's geometry as it materialises, so beat 10 is an
opacity handoff, not a transition between two different screens.

---

## 4. Visual style

**Inspiration:** Iron Man HUD · Apple Vision Pro · Nothing OS · Arc Browser · modern sci-fi interfaces.

**Register:** elegant and restrained, never flashy.

| Element | Direction |
|---|---|
| Palette | Near-black canvas; **cyan AI aura only** (`--ai-aura`). No blue accent, no status colours, no multi-hue gradients. |
| Light | Everything is emissive — light comes *from* the mark outward. No drop shadows. |
| Motion curve | Long ease-out on entrances (`cubic-bezier(0.16, 1, 0.3, 1)`); nothing linear; nothing bouncy. |
| Particles | ≤ 60, sub-pixel drift, low opacity. Ambient dust, not a starfield. |
| Energy wave | One ring. Never a pulse train. |
| Typography | **None.** No wordmark text, no tagline, no version string. |

The mark itself is the existing `Sparkles`-based brand glyph used in the top bar, rendered large —
**not a new asset**, so brand identity is consistent from the first frame.

---

## 5. Audio (optional, off by default)

Support subtle startup audio **only when sound is explicitly enabled**. The application must be
**completely silent when sound is disabled** — which is the default.

| Cue | Beat | Character |
|---|---|---|
| Ambient hum | 2 → 7 | Low, warm, rising; fades under the interface |
| Activation tone | 5 | Single soft tone on the energy wave |
| Interface chime | 9 | Light, brief, on orb activation |

**Rules:**
- Default `enabled: false`, stored at `jarvis.audio.enabled`, toggled in `Settings → Sound`.
- Never autoplay before a user gesture — browsers block it and it is hostile. If no gesture has
  occurred, run the animation silently.
- Audio assets are **lazy-loaded and never block** the animation or app init. If they fail to load,
  the sequence runs silently with no error surfaced.
- Total audio budget ≤ 150KB, preloaded only when sound is enabled.

---

## 6. Performance requirements

| Requirement | Target |
|---|---|
| Blocks app initialization | **Never** — React mounts, data fetches and hydration run *behind* the animation |
| Total duration | 2–4s (target 3.4s) |
| Frame rate | 60 FPS sustained |
| Animated properties | `transform` and `opacity` only — never `width`/`height`/`top`/`left` |
| Asset loading | Lazy, in background, non-blocking |
| Added bundle cost | ≤ 20KB gzipped for the startup chunk |
| Early-exit | If the app is ready *and* the user interacts (click/key), fast-forward to beat 10 over 200ms |

### Non-blocking contract

```
main.tsx mounts
   ├─ StartupSequence renders on top (own layer, pointer-events: none after beat 8)
   └─ App initializes underneath, in parallel:
         theme resolution · store hydration · route prep · data prefetch

Animation completes  OR  app-ready + user gesture  →  handoff
```

**The animation is a curtain, never a gate.** If initialization finishes at 800ms, the animation still
plays to completion — but if the user clicks, they get straight through. If initialization takes
longer than the animation, the orb holds its `thinking` state at beat 9 until ready, then completes.
This is the only stage permitted to extend.

**Show once per session, not per navigation.** Store a session flag; a route change or HMR reload
must not replay it.

---

## 7. Accessibility

**A reduced-motion version is mandatory**, honouring the OS setting via the existing
`useReducedMotion()` hook (`design-system/hooks/useReducedMotion.ts`) and the global
`prefers-reduced-motion` reset already in `index.css`.

| | Full | Reduced motion |
|---|---|---|
| Duration | ~3.4s | ≤ 600ms |
| Beats 4, 5, 6 (pulse, wave, particles) | Play | **Omitted entirely** |
| Beats 3, 7, 8 (logo, glass, widgets) | Animated | Simple cross-fade, no movement |
| Transforms | Full | None — opacity only |

Additionally:
- The startup layer is `aria-hidden="true"` — it carries no information.
- A single polite live-region announcement at handoff: *"Jarvis ready."*
- Keyboard focus must land on the composer at handoff, never trapped in the startup layer.
- The sequence must be dismissible by any keypress.
- Respect `prefers-reduced-transparency`: skip the glass materialisation, fade solid surfaces instead.

---

## 8. Implementation plan

```
frontend/src/features/startup/
├── StartupSequence.tsx      ← orchestrator; owns the beat timeline
├── AmbientGlow.tsx          ← beats 2, 4
├── EnergyWave.tsx           ← beat 5
├── ParticleField.tsx        ← beat 6 (canvas, respects reduced motion)
├── useStartupSequence.ts    ← beat state machine, early-exit, session flag
├── useStartupAudio.ts       ← lazy audio, gated on jarvis.audio.enabled
└── startup.motion.ts        ← variants, extending design-system/foundations/motion.ts
```

**Reuse, do not rebuild:**

| Need | Existing asset |
|---|---|
| Orb visual + states | `design-system/patterns/VoiceOrb/VoiceOrb.tsx` (has an `offline` state — use it for beat 1–8) |
| Ambient orb motion | `features/home/HeroOrb.tsx` |
| Wave rendering reference | `features/home/Waveform.tsx` |
| Motion variants | `design-system/foundations/motion.ts` |
| Reduced motion | `design-system/hooks/useReducedMotion.ts` |
| Glass capability detection | `ThemeProvider.detectGlassCapability()` — **skip beat 7's blur on incapable devices** |
| Widget stagger targets | `WidgetGrid` (see [WIDGET-SYSTEM.md](./WIDGET-SYSTEM.md)) |

**Ordering note:** beats 7 and 8 materialise the *new* single-workspace shell (top bar → workspace →
status bar). This animation should therefore be built **after** the shell refactor lands, so it
animates the real geometry rather than the deprecated sidebar layout.

---

## 9. Definition of done

- [ ] Sequence plays end-to-end in 2–4s with no perceptible stage boundaries
- [ ] Final animation frame is layout-identical to the first Home frame
- [ ] App initialization is provably non-blocking (verified with init artificially delayed to 5s)
- [ ] 60 FPS sustained on a mid-tier laptop (Performance panel capture attached to the PR)
- [ ] Reduced-motion path verified with the OS setting on
- [ ] Silent by default; audio path verified with sound enabled and with assets failing to load
- [ ] Plays once per session; not replayed on route change or HMR
- [ ] Any keypress or click fast-forwards to handoff
- [ ] Startup chunk ≤ 20KB gzipped, lazy-loaded
- [ ] `aria-hidden` correct; focus lands on the composer; "Jarvis ready" announced
- [ ] Works with glass on and off, dark and light, high contrast
- [ ] Storybook story with a timeline scrubber for review

---

## 10. Status tracking

**This milestone stays on the roadmap until fully implemented and tested.** Do not mark the frontend
feature-complete, and do not close Phase 7, while this document reads `PENDING`.
