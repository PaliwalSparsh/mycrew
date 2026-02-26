# TICKET-002: Execution pipeline (planner/tools/approvals)

**Status:** DONE  
**Priority:** P0

## Goal
Replace placeholder run behavior with a real execution pipeline.

## Scope
- Planner step (task + context -> action plan)
- Tool dispatcher (filesystem, terminal, web search)
- Approval gate for risky actions
- Structured result + failure reason

## Acceptance Criteria
- Runs include planner + tool invocation events.
- Risky actions require user approval.
- Failure reason appears in timeline.


## Evidence
- Implemented in current source under `src/` (runtime/main/renderer) and `test/`.
