# TICKET-007: Push-based UI updates over IPC

**Status:** DONE  
**Priority:** P1

## Goal
Replace polling with event-driven renderer updates.

## Scope
- Emit runtime events from main process.
- Subscribe in renderer via preload bridge.
- Remove periodic polling loop.

## Acceptance Criteria
- UI updates in near real-time from push events.
- Polling timer removed.


## Evidence
- Implemented in current source under `src/` (runtime/main/renderer) and `test/`.
