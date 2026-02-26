# TICKET-009: Automated runtime and IPC tests

**Status:** DONE  
**Priority:** P1

## Goal
Add meaningful tests for queue behavior, triggers, and IPC contract.

## Scope
- Unit tests for queue ordering and retry behavior.
- Unit tests for trigger binding.
- Integration tests for task lifecycle through IPC.

## Acceptance Criteria
- Test suite includes runtime behavior assertions.
- CI can execute tests in non-GUI environment.


## Evidence
- Implemented in current source under `src/` (runtime/main/renderer) and `test/`.
