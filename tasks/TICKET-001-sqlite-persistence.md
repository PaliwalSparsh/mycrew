# TICKET-001: SQLite persistence layer

**Status:** DONE  
**Priority:** P0

## Goal
Persist tasks, runs, logs, settings, and memory in SQLite so data survives restarts.

## Scope
- Add DB bootstrap + migrations.
- Add repositories for tasks/runs/events/settings.
- Rehydrate runtime state on startup.

## Acceptance Criteria
- Restarting app preserves tasks and run history.
- Migration versioning exists.
- Runtime can query persisted logs for timeline.


## Evidence
- Implemented in current source under `src/` (runtime/main/renderer) and `test/`.
