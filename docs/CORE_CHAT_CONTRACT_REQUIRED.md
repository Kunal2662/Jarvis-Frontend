# Required from JARVIS Core — Chat Conversational Contract

**Status:** ⛔ Not available yet. The frontend Chat UI is wired to a pluggable
`ChatService` seam (`frontend/src/features/chat/chatService.ts`). The default
adapter uses the **development** endpoint `/api/chat/stream`. A `core` adapter
stub exists (`adapters/coreChatAdapter.ts`) but is intentionally unimplemented —
**no Core endpoint has been invented.**

Once Claude Code ships the real Core conversational API, implement
`coreChatService.sendMessage`, set `ready: true`, and select it with
`VITE_CHAT_BACKEND=core`. **No ChatPage/UI changes will be required.**

## What the frontend adapter needs to map (`ChatService` interface)

`sendMessage(turns, handlers, signal, sessionId?) → { outcome, sessionId?, error? }`

- **Input `turns`**: ordered `{ role: 'user' | 'assistant'; content: string }[]`
  (full history; the client currently owns history).
- **Streaming output** the adapter must translate into handler calls:
  - `onMeta({ sessionId })` — once, at/near start.
  - `onDelta(text)` — repeated assistant token/chunk deltas.
  - `onStatus(...)` — lifecycle: `sending → streaming → completed | cancelled | error`
    (and optionally `reconnecting`).
  - `onError(message)` — a user-safe error string.
- **Cancellation**: the passed `AbortSignal` MUST abort the in-flight turn and
  resolve with `outcome: 'cancelled'` (must not throw).

## Exact questions Claude Code must answer

1. **Endpoint(s)**: path + method for a conversational turn
   (e.g. `POST /api/v1/agent/chat`?). Is it SSE, WebSocket, or chunked fetch?
2. **Request schema**: does Core accept full `turns` history, or does it own
   session state (send only the latest message + `session_id`)?
3. **Streaming event schema**: exact event names / JSON shapes for
   deltas, metadata, tool/step progress, and errors. Are there intermediate
   orchestrator events (intent/plan/tool) the UI should ignore or may display?
4. **Session lifecycle**: how are `session_id`s created/reused? Contracts for
   `GET/DELETE /api/chat/sessions[/{id}]` (listed as "pending" in README).
5. **Model/provider selection**: does the client pass `model`/`provider`, or is
   that Core-owned? (Dev endpoint currently accepts them.)
6. **Auth**: headers/tokens required (none today).
7. **Cancellation & reconnect**: how to cancel a running turn server-side;
   whether reconnect/resume of an interrupted stream is supported.
8. **Error taxonomy**: structured error codes vs. free-text, and which are
   user-safe to display.

Until these are provided, the development endpoint remains the only verified
contract and stays the default. Do not present it as the production Core.
