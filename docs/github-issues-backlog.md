# GitHub Issues Backlog (Derived from PRD)

These are issue-ready drafts with suggested labels and acceptance criteria.

---

## Issue 1: Bootstrap Electron app with background Node runtime (macOS)
**Labels**: `type:feature`, `area:platform`, `priority:P0`

### Description
Set up the Electron application shell and ensure a background Node runtime starts automatically on app launch.

### Acceptance Criteria
- Electron app launches on macOS.
- Background runtime starts with app startup.
- Runtime health status is visible in UI.
- Local dev start script works end-to-end.

---

## Issue 2: Implement 3–4 step onboarding wizard with <30s first automation goal
**Labels**: `type:feature`, `area:ux`, `priority:P0`

### Description
Create a minimal wizard flow that gets users from open app → model selection → first task creation quickly.

### Acceptance Criteria
- Wizard has max 4 steps.
- User can choose Local (Ollama) or OpenAI BYOK.
- User can create first task before leaving onboarding.
- First successful run appears in timeline.

---

## Issue 3: Build provider abstraction + adapters for Ollama and OpenAI
**Labels**: `type:feature`, `area:llm`, `priority:P0`

### Description
Implement provider-agnostic model interface with Ollama local adapter and OpenAI API adapter.

### Acceptance Criteria
- Unified provider interface.
- Ollama adapter can run prompts successfully.
- OpenAI adapter supports BYOK API key.
- Single global model default in settings.

---

## Issue 4: Add secure secret management for API keys
**Labels**: `type:feature`, `area:security`, `priority:P0`

### Description
Store sensitive credentials using OS keychain integration; never persist plain API keys in SQLite.

### Acceptance Criteria
- OpenAI key saved/retrieved via OS secure storage.
- Secrets are redacted in logs.
- No plaintext API key in local database.

---

## Issue 5: Implement task entity + task list/detail pages
**Labels**: `type:feature`, `area:tasks`, `priority:P0`

### Description
Create core task data model and UI for creating, viewing, editing, and deleting tasks.

### Acceptance Criteria
- CRUD for tasks.
- Task supports manual, hook, and cron modes.
- Task detail shows configuration and status.

---

## Issue 6: Build serial queue with task prioritization and retries
**Labels**: `type:feature`, `area:runtime`, `priority:P0`

### Description
Implement queue engine that executes tasks serially, supports priority sorting, and retries failed tasks 3 times.

### Acceptance Criteria
- Serial execution guaranteed.
- Priority affects dequeue order.
- Failed tasks auto-retry up to 3 times.
- Failed-after-retries tasks surface clearly in logs.

---

## Issue 7: Add cron scheduler trigger harness
**Labels**: `type:feature`, `area:triggers`, `priority:P0`

### Description
Allow users to attach cron schedules to tasks and trigger runs at specified times.

### Acceptance Criteria
- Cron expression validated in UI.
- Scheduler triggers tasks in runtime.
- Trigger events appear in timeline.

---

## Issue 8: Add file/folder watcher trigger harness (macOS)
**Labels**: `type:feature`, `area:triggers`, `priority:P0`

### Description
Implement file/folder change event trigger support for tasks.

### Acceptance Criteria
- User can select watched path.
- Create/modify events can trigger task runs.
- Trigger origin shown in run timeline.

---

## Issue 9: Build tool layer v1 (filesystem, terminal, web search)
**Labels**: `type:feature`, `area:tools`, `priority:P0`

### Description
Create tool registry/execution framework with initial tools: filesystem operations, terminal access, web search.

### Acceptance Criteria
- Agent can invoke tool actions via runtime.
- Tool calls logged with inputs/outputs (with redaction rules).
- Tool failures propagate structured errors.

---

## Issue 10: Add risky-action approval workflow + policy presets
**Labels**: `type:feature`, `area:safety`, `priority:P0`

### Description
Introduce user approval gates for risky actions and policy presets (Conservative/Balanced/Autonomous).

### Acceptance Criteria
- Risky tool calls pause for user approval.
- Policy presets affect approval behavior.
- Approval decisions are audited in logs.

---

## Issue 11: Implement timeline observability and run diagnostics
**Labels**: `type:feature`, `area:observability`, `priority:P0`

### Description
Create a timeline UI showing what happened, what is happening, and what failed, including reasons.

### Acceptance Criteria
- Real-time timeline with run states.
- Run detail includes action-by-action trace.
- Every failed run has human-readable failure reason.

---

## Issue 12: Implement per-task history and global summary dashboard
**Labels**: `type:feature`, `area:observability`, `priority:P1`

### Description
Add task history views and a global summary page across all tasks.

### Acceptance Criteria
- Task page shows total runs, success/failure counts.
- Global summary aggregates all task activity.
- User can filter by date and task.

---

## Issue 13: Add memory system with inspect/edit/delete UX
**Labels**: `type:feature`, `area:memory`, `priority:P1`

### Description
Implement always-on memory persistence and management UI.

### Acceptance Criteria
- Memory writes occur for relevant interactions/runs.
- User can inspect entries.
- User can edit and delete entries.

---

## Issue 14: Add SQLite persistence schema and migration framework
**Labels**: `type:feature`, `area:data`, `priority:P0`

### Description
Introduce SQLite schema for tasks, runs, memory, settings, usage, and plugin metadata.

### Acceptance Criteria
- Schema versioning and migrations supported.
- Core entities persisted and reloadable.
- Basic backup/export path documented.

---

## Issue 15: Add OpenAI token/cost tracking dashboard
**Labels**: `type:feature`, `area:billing`, `priority:P1`

### Description
Track token usage and estimated spend for OpenAI requests.

### Acceptance Criteria
- Usage tracked per run and aggregated.
- Dashboard shows total spend estimate.
- Cost can be segmented by task and timeframe.

---

## Issue 16: Define plugin architecture baseline
**Labels**: `type:feature`, `area:extensibility`, `priority:P1`

### Description
Create plugin interfaces for triggers, tools, and model providers.

### Acceptance Criteria
- Plugin lifecycle contract documented.
- Runtime can discover/load local plugins.
- Example plugin included.

---

## Issue 17: Add telemetry framework with privacy controls
**Labels**: `type:feature`, `area:telemetry`, `priority:P1`

### Description
Introduce telemetry events while preserving privacy-first principles.

### Acceptance Criteria
- Telemetry events are schema-defined.
- User-facing telemetry settings available.
- Sensitive data excluded/redacted by design.

---

## Issue 18: Prototype remote read-only web companion over private P2P path
**Labels**: `type:feature`, `area:remote`, `priority:P2`

### Description
Build initial web companion that can read status from the desktop runtime with privacy-preserving architecture direction (P2P).

### Acceptance Criteria
- Remote companion can display task status and timeline.
- Read-only controls for MVP phase.
- Architecture note documents P2P approach and constraints.

---

## Issue 19: Add offline-only / safe mode toggle
**Labels**: `type:feature`, `area:safety`, `priority:P1`

### Description
Provide a mode that disables cloud model calls and (optionally) risky tool classes.

### Acceptance Criteria
- Toggle available in settings.
- Cloud calls blocked when enabled.
- UI clearly communicates current mode.

---

## Issue 20: Establish CI checks and basic quality gates
**Labels**: `type:chore`, `area:devex`, `priority:P1`

### Description
Set up lint/test/build checks for reproducible quality.

### Acceptance Criteria
- CI runs lint + tests + build.
- PR failures block merge on failed checks.
- Contribution guide updated with local commands.

