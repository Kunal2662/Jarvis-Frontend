# JARVIS Core Milestones — Frontend Alignment Snapshot

**Snapshot date:** 2026-08-08  
**Purpose:** Portable context for any frontend coding agent (Emergent, Claude Code, Cursor, etc.).  
**Source of truth:** The current JARVIS-OS Core repository and its roadmap documentation.  
**Important:** This is a snapshot. Re-verify milestone status before making major changes.

## Current milestone state

| Milestone | Status | Frontend relevance |
|---|---|---|
| M7 — Workflow Intelligence | 🟡 Active / Partial | Workflow and automation UI must follow actual Core contracts. |
| M8 — React Frontend & Desktop Experience | 🟡 Active / Partial | Current frontend architecture and deferred UI work. |
| M9 — Runtime & Core Services | ✅ Complete | Consume runtime/service contracts; do not recreate infrastructure. |
| M10 — AI Orchestrator | 🟡 Partial / Active | Chat and Voice should reach the real AgentOrchestrator. |
| M10A — Universal Search & Knowledge Platform | ✅ Complete | Search and Knowledge UI can consume existing Core capabilities. |
| M10B — Intelligence Layer | ✅ Complete | Context/intelligence experiences should consume Core capabilities. |
| M10.5 — MCP & Integration Platform | ✅ Complete | AI Apps and integrations UI should consume MCP/integration contracts. |
| M11 — Intelligent Workspace & Productivity | 🟡 Active / Not fully closed | Productivity frontend: Notes, Tasks, Calendar, Files, Workspace. |
| M11A — SEO Intelligence | 🔴 Not Started | Do not present as an implemented frontend capability. |
| M11B — Productivity Suite | 🔴 Not Started | Do not assume separate future functionality exists. |
| M12 — Smart Home & IoT Platform | 🟡 Active | Smart Home Core + Connectivity + Home Assistant + MQTT are shipped; M12 remains incomplete. |
| M13 — Computer Control | 🔴 Not Started | Do not build as if Core capability exists. |
| M13A — AI Sandbox | 🔴 Not Started | Future capability. |
| M13B — Self-Healing & Observability | 🔴 Not Started | Future capability. |
| M14 onward (except M22) | 🔴 Not Started / future | Do not invent unavailable contracts. |
| M22 — Cross-Platform Distribution & Universal Installer | 🟡 Active / Build Verification Pending | Desktop/distribution concern; do not turn into generic web features. |

## M10 details

The Core contains a real `AgentOrchestrator` with intent, context, planning, tool selection, permission validation, execution, critic/iteration, and response stages.

Conversational routing has also been implemented so Chat/Voice can reach the orchestration path.

**Frontend rule:** do not build a second AI orchestration system.

## M12 details

M12 is active, not complete.

Completed slices include:

- Smart Home Core
- Connectivity Layer foundation
- Home Assistant connector
- MQTT connector

Remaining M12 modules must be treated according to the actual Core implementation status. Do not invent device capabilities or APIs.

## Status semantics

- ✅ Complete — capability is shipped in Core.
- 🟡 Active / Partial — some capability is shipped; verify contracts before integration.
- 🔴 Not Started — do not present as a real Core capability.
- ⚠️ Blocked / pending verification — do not assume production readiness.

## Agent rule

Before implementing a frontend feature, map it to a Core milestone and verify the actual API/WebSocket/event contract. If the Core capability does not exist, do not fabricate it in the frontend.
