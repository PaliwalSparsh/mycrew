const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

function planActions(prompt) {
  const lines = prompt.split('\n').map((line) => line.trim()).filter(Boolean);
  const actions = [];

  for (const line of lines) {
    if (line.startsWith('terminal:')) {
      actions.push({ type: 'terminal', command: line.slice('terminal:'.length).trim() });
      continue;
    }
    if (line.startsWith('websearch:')) {
      actions.push({ type: 'websearch', query: line.slice('websearch:'.length).trim() });
      continue;
    }
    if (line.startsWith('file:write')) {
      const payload = line.slice('file:write'.length).trim();
      const [target, ...contentParts] = payload.split('|');
      actions.push({ type: 'file_write', target: target?.trim(), content: contentParts.join('|').trim() });
      continue;
    }
  }

  if (actions.length === 0) {
    actions.push({ type: 'respond', text: prompt });
  }

  return actions;
}

class RunExecutor {
  constructor({ policyEngine }) {
    this.policyEngine = policyEngine;
  }

  executeAction(action) {
    if (action.type === 'respond') {
      return { ok: true, output: `Acknowledged: ${action.text.slice(0, 120)}` };
    }

    if (action.type === 'terminal') {
      const output = execSync(action.command, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
      return { ok: true, output: output.slice(0, 2000) };
    }

    if (action.type === 'websearch') {
      return { ok: true, output: `Simulated search result for query: ${action.query}` };
    }

    if (action.type === 'file_write') {
      if (!action.target) {
        throw new Error('file_write missing target');
      }
      const resolved = path.resolve(action.target);
      fs.mkdirSync(path.dirname(resolved), { recursive: true });
      fs.writeFileSync(resolved, action.content || '', 'utf8');
      return { ok: true, output: `Wrote file: ${resolved}` };
    }

    throw new Error(`Unknown action type: ${action.type}`);
  }
}

module.exports = { RunExecutor, planActions };
