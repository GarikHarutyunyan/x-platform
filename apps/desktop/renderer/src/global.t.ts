export {};

declare global {
  interface Window {
    electronAPI: {
      readDirectory: (path: string) => Promise<any>;
      openFile: (filePath: string) => void;
      createProject: (name: any) => void;
      startProject: (path: string) => void;
      stopProject: (path: string) => void;
      openTerminal: (path: string) => void;
      isStartableProject: (path: string) => Promise<boolean>;
      onCommandLog: (callback: (msg: string) => void) => void;
      onExpoUrl: (callback: (url: string) => void) => void;
      selectDirectory: () => Promise<string | null>;
      onProjectCreated: (callback: (projectDir: string) => void) => void;
    };
  }
}
