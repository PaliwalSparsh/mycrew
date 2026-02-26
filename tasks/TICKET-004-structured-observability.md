# TICKET-004: Structured observability timeline schema

**Status:** DONE  
**Priority:** P0

## Goal
Move from generic log lines to structured event types and richer run diagnostics.

## Scope
- Define event schema (`run_started`, `tool_called`, etc.).
- Map runtime events to schema.
- Update UI timeline rendering.

## Acceptance Criteria
- Timeline shows typed events with run grouping.
- Failures include remediation hint field.


## Evidence
- Implemented in current source under `src/` (runtime/main/renderer) and `test/`.
