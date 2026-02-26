# TICKET-005: Queue controls (dedupe/cancel/pause)

**Status:** DONE  
**Priority:** P1

## Goal
Improve queue robustness and operator control.

## Scope
- Queue dedupe for burst triggers.
- Cancel queued run.
- Pause/resume queue processing.
- Max queue depth/backpressure.

## Acceptance Criteria
- Users can pause and resume processing.
- Users can cancel queued runs.
- Dedupe reduces duplicate folder-trigger runs.


## Evidence
- Implemented in current source under `src/` (runtime/main/renderer) and `test/`.
