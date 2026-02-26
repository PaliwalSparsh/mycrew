const form = document.getElementById('task-form');
const tasksNode = document.getElementById('tasks');
const logsNode = document.getElementById('logs');
const approvalsNode = document.getElementById('approvals');
const runtimeMeta = document.getElementById('runtime-meta');
const pauseBtn = document.getElementById('pause-btn');
const resumeBtn = document.getElementById('resume-btn');
const wizardStepNode = document.getElementById('wizard-step');
const wizardNextBtn = document.getElementById('wizard-next');
const wizardSkipBtn = document.getElementById('wizard-skip');

let currentState = null;
let wizardStep = 0;

const wizardSteps = [
  'Step 1: Choose model mode (Local via Ollama or OpenAI API key).',
  'Step 2: Configure credentials (saved locally; keychain integration next).',
  'Step 3: Set safety mode and approvals policy.',
  'Step 4: Create your first task and run it.'
];

const renderWizard = () => {
  wizardStepNode.textContent = wizardSteps[wizardStep] || 'Wizard complete. You can now use the app.';
};

wizardNextBtn.addEventListener('click', () => {
  wizardStep = Math.min(wizardStep + 1, wizardSteps.length);
  renderWizard();
});

wizardSkipBtn.addEventListener('click', () => {
  document.getElementById('onboarding-card').style.display = 'none';
});

const render = (state) => {
  currentState = state;
  runtimeMeta.textContent = `Queue: ${state.queueDepth} | Processing: ${state.processing ? 'yes' : 'no'} | Paused: ${state.paused ? 'yes' : 'no'} | Tasks: ${state.tasks.length}`;

  tasksNode.innerHTML = '';
  for (const task of state.tasks) {
    const li = document.createElement('li');
    li.className = 'item';
    li.innerHTML = `
      <div class="row"><strong>${task.name}</strong><span>${task.status}</span></div>
      <div>Trigger: ${task.trigger} | Priority: ${task.priority} | Runs: ${task.runCount} | Failed: ${task.failedCount}</div>
      <div>Health: watcher=${task.triggerHealth.hasWatcher} scheduler=${task.triggerHealth.hasScheduler} last=${task.triggerHealth.lastTriggeredAt || 'never'}</div>
      <div class="actions">
        <button data-action="run" data-task-id="${task.id}">Run</button>
        <button data-action="delete" data-task-id="${task.id}">Delete</button>
      </div>
    `;
    tasksNode.appendChild(li);
  }

  approvalsNode.innerHTML = '';
  for (const approval of state.approvals) {
    const li = document.createElement('li');
    li.className = 'item';
    li.innerHTML = `
      <div><strong>${approval.action.type}</strong> | ${approval.reason}</div>
      <div>Run ${approval.runId}, Task ${approval.taskId}</div>
      <div class="actions">
        <button data-action="approve" data-approval-id="${approval.id}">Approve</button>
        <button data-action="reject" data-approval-id="${approval.id}">Reject</button>
      </div>
    `;
    approvalsNode.appendChild(li);
  }

  logsNode.innerHTML = '';
  for (const entry of state.logs) {
    const li = document.createElement('li');
    li.className = 'item';
    li.textContent = `${entry.at} | ${entry.type} | run=${entry.runId || '-'} | ${JSON.stringify(entry.data)}`;
    logsNode.appendChild(li);
  }
};

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const trigger = document.getElementById('trigger').value;
  const schedule = document.getElementById('schedule').value;
  const watchPath = document.getElementById('watchPath').value;

  if (trigger === 'cron' && !schedule.trim()) {
    alert('Cron trigger requires a schedule');
    return;
  }
  if (trigger === 'folder' && !watchPath.trim()) {
    alert('Folder trigger requires a watch path');
    return;
  }

  try {
    await window.mycrew.createTask({
      name: document.getElementById('name').value,
      prompt: document.getElementById('prompt').value,
      trigger,
      schedule,
      watchPath,
      priority: Number(document.getElementById('priority').value || 5),
      retries: 3
    });
    form.reset();
  } catch (error) {
    alert(error.message);
  }
});

document.body.addEventListener('click', async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const action = target.getAttribute('data-action');
  const taskId = target.getAttribute('data-task-id');
  const approvalId = target.getAttribute('data-approval-id');

  if (action === 'run' && taskId) await window.mycrew.runTask(taskId);
  if (action === 'delete' && taskId) await window.mycrew.deleteTask(taskId);
  if (action === 'approve' && approvalId) await window.mycrew.resolveApproval(approvalId, true);
  if (action === 'reject' && approvalId) await window.mycrew.resolveApproval(approvalId, false);
});

pauseBtn.addEventListener('click', () => window.mycrew.pauseQueue());
resumeBtn.addEventListener('click', () => window.mycrew.resumeQueue());

window.mycrew.onStateChanged((state) => render(state));
window.mycrew.getState().then((state) => render(state));
renderWizard();
