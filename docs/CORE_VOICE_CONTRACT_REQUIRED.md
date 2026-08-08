# Required from JARVIS Core — Voice / Conversation Contract

**Status:** ⛔ Not available yet. The Voice UI is wired to a pluggable
`VoiceService` seam (`frontend/src/features/voice/voiceService.ts`). The default
adapter is the **browser Web Speech API** (local, client-side STT only — no
server calls, no TTS). A `core` adapter stub exists
(`adapters/coreVoiceAdapter.ts`) but is intentionally unimplemented — **no Core
voice endpoint/protocol has been invented.**

Once Claude Code ships the real Core voice contract, implement
`coreVoiceService.useSession` (and optionally `speak`), set `ready: true` + real
`capabilities`, and select it with `VITE_VOICE_BACKEND=core`. **No VoiceOverlay
changes will be required.**

## What the frontend adapter needs to satisfy (`VoiceService`)

- `useSession()` → reactive `{ supported, listening, transcript, interim, error,
  status, start(), stop(), reset(), cancel() }`.
- `status` must move through the `VoiceLifecycle`:
  `idle → listening → processing → speaking → cancelled | error | unavailable | reconnecting`.
- `capabilities: { stt, tts }` declares what the backend supports.
- Optional `speak(text)` for spoken replies (TTS).

## Exact questions Claude Code must answer

1. **Transport**: WebSocket, WebRTC, or HTTP streaming for the voice session?
   Endpoint path(s)?
2. **STT**: server-side transcription or client capture streamed up? Expected
   **audio format / sample rate / encoding** (e.g. PCM16 16kHz, Opus)?
   Partial vs. final transcript event schema.
3. **TTS**: does Core return audio to play (`/api/voice/speak`)? Format
   (mp3/opus/PCM), streaming or whole-file? Barge-in / interrupt support?
4. **Turn/conversation model**: does voice reuse the Chat/Core conversation
   contract (see `CORE_CHAT_CONTRACT_REQUIRED.md`) once transcribed, or is there
   a dedicated voice conversation endpoint? Session id semantics.
5. **Event schema**: exact JSON/binary events for
   listening/partial/final/processing/speaking/error, plus any orchestrator
   step events to ignore or display.
6. **Cancellation & reconnect**: how to cancel an in-flight utterance/response;
   whether an interrupted session can reconnect/resume.
7. **VAD / endpointing**: server-driven end-of-speech, or client-driven?
8. **Auth**: headers/tokens for the voice channel (none today).
9. **Error taxonomy**: structured codes vs. free-text; which are user-safe.

Until these are provided, the browser Web Speech API remains the only verified
implementation and stays the default. Do not present it as production Core voice.
