# TICKET-011: Electron shell and IPC baseline

**Status:** DONE  
**Priority:** P0

## What is already implemented
- Electron app window bootstrap.
- Context-isolated preload bridge.
- IPC handlers for runtime state and task actions.

## Evidence
- `src/main.js`
- `src/preload/preload.js`
