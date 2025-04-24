import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  readDirectory: (path: string) => ipcRenderer.invoke('read-directory', path),
  openFile: (filePath: string) => ipcRenderer.send('open-file', filePath),
  createProject: (name: string) => ipcRenderer.send('create-project', name),
   onCommandLog: (callback: (msg: string) => void) => {
    ipcRenderer.on('command-log', (_, msg) => callback(msg));
  },
  onProjectCreated: (callback: (projectDir:string) => void) => {
  ipcRenderer.on('project-created',(_, projectDir) =>  callback(projectDir));
}
});