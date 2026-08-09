# JARVIS Core ↔ Frontend Capability Mapping

**Snapshot:** 2026-08-08  
**Purpose:** Living mapping between Core milestones and frontend surfaces.

| Frontend surface | Core milestone | Current Core state | Frontend state in ZIP | Integration direction |
|---|---|---|---|---|
| Home / Command Center | M8 + multiple Core services | 🟡/mixed | 🟢 Real | Evolve into unified workspace using real services. |
| Chat | M10 | 🟡 Partial / Active | 🟢 Real streaming UI | Move from development Claude endpoint toward real Core orchestration contracts. |
| Voice | M10 | 🟡 Partial / Active | 🟢 Voice overlay | Connect to the same Core conversational path as Chat. |
| Search | M10A | ✅ Complete | 🔴/placeholder | Build against actual Search contract. |
| Knowledge | M10A | ✅ Complete | 🔴/placeholder | Build against actual Knowledge contract. |
| Intelligence | M10B | ✅ Complete | 🔴/placeholder | Consume Core intelligence/context; do not recreate it. |
| AI Apps | M10.5 | ✅ Complete | 🔴/placeholder | Consume MCP/integration capabilities. |
| Integrations | M10.5 | ✅ Complete | 🔴/placeholder | Real connector/integration contracts only. |
| Notes | M11 | 🟡 Active | 🔴/placeholder | Verify actual backend contract before implementation. |
| Tasks | M11 | 🟡 Active | 🔴/placeholder | Same rule. |
| Calendar | M11 | 🟡 Active | 🔴/placeholder | Same rule. |
| Files | M11 / M10A | 🟡/mixed | 🔴/placeholder | Verify File/Workspace contracts first. |
| Memory | Core future/current capability | ⚠️ Verify | 🔴/placeholder | Do not invent API. |
| Agents | M10 | 🟡 Active | 🔴/placeholder | Expose existing orchestration; no second agent framework. |
| Automations | M7 | 🟡 Active / Partial | 🔴/placeholder | Build only around actual workflow contracts. |
| Smart Home | M12 | 🟡 Active | 🔴/placeholder | Use Smart Home Core contracts. |
| Home Assistant | M12 | 🟢 connector shipped | 🔴/placeholder | Connector status/device UI after contract verification. |
| MQTT | M12 | 🟢 connector shipped | 🔴/placeholder | Connector/device UI after contract verification. |
| Settings | System / future Core surfaces | ⚠️ Verify | 🔴/placeholder | Build settings shell first; integrate real settings contracts. |
| Diagnostics | M13B/future observability | 🔴/future | 🔴/placeholder | Do not pretend future Core exists. |
| Performance | Cross-cutting | 🟡 planned discipline | 🔴/placeholder | Build after meaningful Core health/performance contracts exist. |
| Developer Mode | Cross-cutting | ⚠️ Verify | 🔴/placeholder | Expose real diagnostics/events only. |
| Distribution/Desktop | M22 | 🟡 Active / build verification pending | Desktop-aware | Keep desktop concerns separate from generic web UI. |

## Integration priority

1. M10 Chat / Voice orchestration
2. M10A Search / Knowledge
3. M10B Intelligence experiences
4. M10.5 AI Apps / Integrations
5. M11 Productivity
6. M12 Smart Home / Connectivity
7. Future milestone surfaces
8. Final system, performance and polish

## Contract rule

A frontend feature may be visually designed before its backend exists, but it must not claim functionality that the Core does not provide.

Use explicit placeholder/unavailable states when necessary.
