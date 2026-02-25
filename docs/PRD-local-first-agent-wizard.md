# PRD: Local-First Personal Agent Wizard (Electron)

## 1) Overview
Build a privacy-first Electron desktop app that lets non-technical users launch a personal AI agent in under **30 seconds**, then configure automations using simple tasks, hooks, and cron schedules.

The product should feel like a personal assistant, not a developer framework.

## 2) Why This Product
1. Agent setup is currently too developer-heavy.
2. Users need clear visibility into what the agent did, is doing, and failed to do.
3. Simplicity is a core differentiator.
4. The architecture must remain LLM-provider agnostic and local-first, with a long-term path to fully local execution.

## 3) Product Goals
### Primary goals
- **Time to first successful automation: < 30 seconds**.
- Make setup and daily use understandable for personal productivity users.
- Keep data and execution local by default.
- Provide full action-level observability.

### Secondary goals
- Enable optional cloud model usage via user-provided credentials.
- Provide basic remote read-only control via a simple web interface using private-by-design architecture (target: P2P).

## 4) Target User & Positioning
- **Primary user**: personal productivity user (individual, non-technical or semi-technical).
- **Positioning**: privacy + simplicity first.
- **Product identity**: personal assistant that can run background tasks.

## 5) Scope
## 5.1 MVP In Scope
- Electron desktop app (macOS first).
- Background Node process running from app start.
- Single-agent runtime.
- Serial task queue execution.
- Task prioritization.
- Trigger harnesses:
  - File/folder change hooks.
  - Cron/scheduled triggers.
- Tools:
  - Terminal access.
  - Web search tool.
  - File system operations.
- Model support:
  - One local model via Ollama.
  - OpenAI (BYOK) support.
  - One global default model for all tasks.
- Safety:
  - User approvals for risky actions.
  - Policy presets (Conservative / Balanced / Autonomous).
  - Optional safe mode concept (disable risky tools), can ship as early flag.
- Observability:
  - Timeline/log view with per-run reasoned failures.
  - Show all actions taken.
  - Per-task history, run count, and status.
  - Global summary view of all task activity.
- Memory:
  - Always-on memory for all interactions and runs.
  - User can inspect/edit/delete memory entries.
- Cost tracking:
  - OpenAI token usage and estimated spend.
- Local persistence:
  - SQLite.
- Extensibility:
  - Plugin architecture from the start.
- Telemetry:
  - Include telemetry support.

## 5.2 MVP Out of Scope
- Multi-agent orchestration.
- Advanced app automation (UI control).
- Windows support (planned next).
- Encryption at rest (deferred).
- Intelligent auto model routing.
- Per-task model selection.

## 6) User Experience
## 6.1 Onboarding Constraints
- Setup must be **3–4 steps max**.
- App startup expectation: node process is already running in the background.
- User chooses:
  - Local mode (bundled/local Ollama model path), or
  - BYOK OpenAI key.

## 6.2 First-Run Flow (Target)
1. Open app.
2. Choose model mode (Local or OpenAI).
3. Enter minimal credentials/config.
4. Create first task or cron/hook.
5. See first execution in timeline.

## 6.3 Core Task Model
- One agent, many user-defined tasks.
- Tasks can be recurring, event-based, or manual.
- Each task has:
  - Configuration
  - Priority
  - Run history
  - Failure diagnostics

## 7) Functional Requirements
## 7.1 Agent Runtime & Queue
- Accept task requests from hooks, cron, and manual triggers.
- Queue tasks and execute serially.
- Support priority ordering.
- Auto-retry failed runs up to 3 times; then mark failed and surface in logs.

## 7.2 Triggers
- File/folder watcher trigger.
- Cron scheduler trigger.
- Manual run trigger from UI.

## 7.3 Tools
- Local filesystem read/write/move operations.
- Terminal command execution with safety policy.
- Web search tool integration.

## 7.4 Safety
- Require user approval for risky actions.
- Provide policy presets for approval strictness.
- Support offline-only/safe mode concept to disable cloud and/or risky tool classes.

## 7.5 Model Layer
- Abstraction layer for providers.
- Provider adapters:
  - Ollama local adapter.
  - OpenAI API adapter.
- Global model selection used by all tasks.

## 7.6 Observability
- Real-time run timeline.
- Action logs per run.
- Explicit failure reason and remediation hint.
- Task-centric detail pages with historical runs.
- Global summary dashboard.

## 7.7 Data & Storage
- SQLite for tasks, runs, memory, settings, and usage stats.
- Secure secret storage for API keys (OS keychain integration expected).
- Local-first storage of all prompts, tool calls, and run artifacts.

## 7.8 Remote Access (Early)
- Very simple web app for remote read/control intent.
- Initial phase should prioritize read-only control.
- Architecture should target privacy-preserving P2P.

## 8) Non-Functional Requirements
- Fast startup and low friction onboarding.
- Stable long-running background process.
- Resilient queue processing.
- Transparent auditing and debuggability.
- Privacy-by-default behavior.

## 9) Success Metrics
- **TTFSA (Time to first successful automation): < 30s**.
- Onboarding completion rate.
- Number of active tasks per user.
- Task success rate and retries/failures.
- Daily/weekly active users.
- OpenAI usage/cost visibility adoption.

## 10) Milestones
## Milestone 1: MVP Desktop Core
- Wizard + model setup.
- Task CRUD.
- Cron/file triggers.
- Serial queue + priority + retries.
- Timeline logs + task history.

## Milestone 2: Safety & Cost Controls
- Approval UX.
- Policy presets.
- OpenAI cost dashboard.

## Milestone 3: Remote Companion (Basic)
- Simple read-only web app.
- P2P-oriented connectivity prototype.

## 11) Open Decisions
- Exact local model packaging strategy (pre-pull model vs guided install).
- Safe mode defaults and UX entry point.
- P2P transport stack for remote companion.
- Telemetry defaults and privacy controls.
