# TICKET-008: Onboarding wizard (3–4 steps)

**Status:** DONE  
**Priority:** P0

## Goal
Implement fast onboarding aligned with the <30s first automation objective.

## Scope
- Step 1: model mode (Local/OpenAI)
- Step 2: model credentials/setup
- Step 3: safety preferences
- Step 4: first task creation + run

## Acceptance Criteria
- Wizard max 4 steps.
- User can run first task directly from onboarding.


## Evidence
- Implemented in current source under `src/` (runtime/main/renderer) and `test/`.
