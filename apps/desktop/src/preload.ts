import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  readDirectory: (path: string) => ipcRenderer.invoke('read-directory', path),
  openFile: (filePath: string) => ipcRenderer.send('open-file', filePath),
  createProject: (config: { name: string; [key: string]: any }) => ipcRenderer.send('create-project', config),
  startProject: (path: string) => ipcRenderer.send('start-project', path),
  stopProject: (path: string) => ipcRenderer.send('stop-project', path),
  openTerminal: (path: string) => ipcRenderer.send('open-terminal', path),
  isStartableProject: (path: string) => ipcRenderer.invoke('is-startable-project', path),
  onCommandLog: (callback: (msg: string) => void) => {
    ipcRenderer.on('command-log', (_, msg) => callback(msg));
  },
  onProjectCreated: (callback: (projectDir: string) => void) => {
    ipcRenderer.on('project-created', (_, projectDir) => callback(projectDir));
  },
  onExpoUrl: (callback: (url: string) => void) => {
    ipcRenderer.on('expo-url', (_, url) => callback(url));
  },
});