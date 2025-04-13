export { };

declare global {
  interface Window {
    electronAPI: {
      readDirectory: (path: string) => Promise<any>;
      openFile: (filePath: string) => void;
      createProject: (name: string) => void;
      onCommandLog: (callback: (msg: string) => void) => void;
    };
  }
}
