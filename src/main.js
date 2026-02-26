const path = require('node:path');
const { app, BrowserWindow, ipcMain } = require('electron');
const { AgentRuntime } = require('./runtime/agent-runtime');

const runtime = new AgentRuntime();

function getState() {
  return {
    tasks: runtime.listTasks(),
    logs: runtime.listLogs(),
    approvals: runtime.listApprovals(),
    queueDepth: runtime.queueEngine.queue.length,
    processing: runtime.queueEngine.processing,
    paused: runtime.queueEngine.paused
  };
}

function broadcast(channel, payload) {
  for (const win of BrowserWindow.getAllWindows()) {
    win.webContents.send(channel, payload);
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 860,
    webPreferences: {
      preload: path.join(__dirname, 'preload', 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
}

app.whenReady().then(() => {
  createWindow();

  runtime.on('state.changed', () => broadcast('runtime:stateChanged', getState()));
  runtime.on('log', (entry) => broadcast('runtime:log', entry));

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.handle('runtime:getState', () => getState());
ipcMain.handle('task:create', (_, input) => runtime.createTask(input));
ipcMain.handle('task:delete', (_, taskId) => runtime.removeTask(taskId));
ipcMain.handle('task:run', (_, taskId) => runtime.enqueueTask(taskId, 'manual'));
ipcMain.handle('queue:pause', () => runtime.setQueuePaused(true));
ipcMain.handle('queue:resume', () => runtime.setQueuePaused(false));
ipcMain.handle('run:cancel', (_, runId) => runtime.cancelRun(runId));
ipcMain.handle('approval:resolve', (_, approvalId, decision) => runtime.resolveApproval(approvalId, decision));
