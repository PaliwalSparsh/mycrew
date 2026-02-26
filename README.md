# MyCrew App (Electron)

A local-first Electron app with a background runtime for personal agent tasks.

## Implemented
- Electron shell + secure preload bridge
- SQLite-backed persistence for tasks/runs/events
- Modular runtime (`task-store`, `queue-engine`, `trigger-manager`, `run-executor`, `policy-engine`, `log-service`)
- Serial queue with priority, retries, dedupe, pause/resume, and cancel
- Trigger harnesses: manual, cron, folder watch (+ trigger health)
- Structured timeline events
- Risky-action approval flow (terminal/web/file-write)
- Push-based renderer updates over IPC
- 4-step onboarding panel in UI
- Runtime tests (Node test runner)

## Quick start
```bash
npm install
npm run lint
npm test
npm start
```

## Prompt action examples
Use line-based actions in task prompt:
- `terminal: ls -la`
- `websearch: local llm setup`
- `file:write ./notes/out.txt|hello world`

## Fix for `No such built-in module: node:sqlite`
If you hit this Electron error, use the current implementation that relies on `better-sqlite3` (not `node:sqlite`), then rebuild native modules for your Electron version:

```bash
npm install
npx electron-rebuild -f -w better-sqlite3
```

Then start again with `npm start`.
