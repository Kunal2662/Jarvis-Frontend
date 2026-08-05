import os
import json
import uuid
from typing import List, Literal

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

load_dotenv()

from emergentintegrations.llm.chat import LlmChat, UserMessage, TextDelta, StreamDone  # noqa: E402

EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY")
CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "*")

SYSTEM_PROMPT = (
    "You are JARVIS, an AI Operating Companion inspired by Iron Man's JARVIS. "
    "You are precise, calm, and quietly confident. Keep answers helpful and well-structured; "
    "use markdown (headings, lists, code blocks) when it improves clarity. "
    "You assist with productivity: notes, tasks, projects, files, calendar, and knowledge."
)

app = FastAPI(title="JARVIS API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in CORS_ORIGINS.split(",")] if CORS_ORIGINS != "*" else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    session_id: str | None = None
    model: str = "claude-sonnet-4-6"
    provider: str = "anthropic"


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "jarvis-api"}


@app.post("/api/chat/stream")
async def chat_stream(req: ChatRequest):
    session_id = req.session_id or str(uuid.uuid4())

    # Rebuild prior context into the system message so each turn has history
    # (message history is owned by the client and passed in per request).
    history = "\n".join(f"{m.role.upper()}: {m.content}" for m in req.messages[:-1])
    system = SYSTEM_PROMPT + (f"\n\nConversation so far:\n{history}" if history else "")
    latest = req.messages[-1].content if req.messages else ""

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=session_id,
        system_message=system,
    ).with_model(req.provider, req.model)

    async def event_generator():
        yield f"event: meta\ndata: {json.dumps({'session_id': session_id})}\n\n"
        try:
            async for ev in chat.stream_message(UserMessage(text=latest)):
                if isinstance(ev, TextDelta):
                    yield f"data: {json.dumps({'delta': ev.content})}\n\n"
                elif isinstance(ev, StreamDone):
                    break
        except Exception as exc:  # surface a graceful error to the UI
            yield f"event: error\ndata: {json.dumps({'error': str(exc)})}\n\n"
        yield "event: done\ndata: {}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no", "Connection": "keep-alive"},
    )
