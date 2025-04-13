export { };

declare global {
  interface Window {
    electronAPI: {
      readDirectory: (path: string) => Promise<any>;
      openFile: (filePath: string) => void;
    };
  }
}
