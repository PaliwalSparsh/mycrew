# TICKET-006: Trigger reliability improvements

**Status:** DONE  
**Priority:** P1

## Goal
Make cron/folder triggers more reliable and observable.

## Scope
- UI pre-validation for cron/path.
- Trigger health state tracking.
- Debounce folder events.
- Last-triggered metadata.

## Acceptance Criteria
- Invalid trigger config is blocked before save.
- Trigger health state is visible in UI.


## Evidence
- Implemented in current source under `src/` (runtime/main/renderer) and `test/`.
