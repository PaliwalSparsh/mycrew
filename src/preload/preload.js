const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('mycrew', {
  getState: () => ipcRenderer.invoke('runtime:getState'),
  createTask: (input) => ipcRenderer.invoke('task:create', input),
  deleteTask: (taskId) => ipcRenderer.invoke('task:delete', taskId),
  runTask: (taskId) => ipcRenderer.invoke('task:run', taskId),
  pauseQueue: () => ipcRenderer.invoke('queue:pause'),
  resumeQueue: () => ipcRenderer.invoke('queue:resume'),
  cancelRun: (runId) => ipcRenderer.invoke('run:cancel', runId),
  resolveApproval: (approvalId, decision) => ipcRenderer.invoke('approval:resolve', approvalId, decision),
  onStateChanged: (handler) => {
    const listener = (_, state) => handler(state);
    ipcRenderer.on('runtime:stateChanged', listener);
    return () => ipcRenderer.removeListener('runtime:stateChanged', listener);
  }
});
