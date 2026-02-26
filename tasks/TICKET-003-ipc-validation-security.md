# TICKET-003: IPC input validation hardening

**Status:** DONE  
**Priority:** P0

## Goal
Harden IPC boundaries with explicit schema validation and safer defaults.

## Scope
- Validate all IPC inputs (task create/delete/run).
- Return typed errors for invalid payloads.
- Add secure secret storage strategy ticket linkage.

## Acceptance Criteria
- Invalid IPC payloads do not crash runtime.
- Validation errors are surfaced in UI.


## Evidence
- Implemented in current source under `src/` (runtime/main/renderer) and `test/`.
