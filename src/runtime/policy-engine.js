class PolicyEngine {
  assess(action) {
    if (action.type === 'terminal') {
      return { risky: true, reason: 'Terminal commands require approval' };
    }
    if (action.type === 'websearch') {
      return { risky: true, reason: 'Web requests require approval' };
    }
    if (action.type === 'file_write') {
      return { risky: true, reason: 'File write requires approval' };
    }
    return { risky: false, reason: null };
  }
}

module.exports = { PolicyEngine };
