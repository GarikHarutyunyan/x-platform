import {useEffect, useRef, useState} from 'react';
import './App.css';
import FileTree from './components/FileTree/FileTree';
import ProjectDialog from './components/ProjectDialog/ProjectDialog';

export type FileNode = {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileNode[];
};

function App() {
  const [root, setRoot] = useState<FileNode | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const logsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.electronAPI.onCommandLog((msg) => {
      setLogs((prev) => {
        const newLogs = [...prev];
        if (msg !== newLogs.at(-1)) {
          return [...prev, msg];
        }
        return newLogs;
      });
    });

    window.electronAPI.onProjectCreated((projectDir) => {
      setShowDialog(false);
      window.electronAPI.readDirectory(projectDir).then((newRoot) => {
        setRoot(newRoot);
        setIsLoading(false);
      });
    });
  }, []);

  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop =
        logsContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const handleCreateProject = () => setShowDialog(true);

  const confirmCreate = (projectConfig: any) => {
    const config: any = {...projectConfig, name: projectConfig.name.trim()};

    if (projectConfig.name.trim()) {
      window.electronAPI.createProject(config);
      setShowDialog(false);
      setIsLoading(true);
    }
  };

  const handleOpenFolder = async () => {
    const selectedPath = await window.electronAPI.selectDirectory();

    if (selectedPath) {
      const newRoot = await window.electronAPI.readDirectory(selectedPath);
      setRoot(newRoot);
    }
  };

  return (
    <div className="app-container">
      <div style={{display: 'flex', gap: '1rem'}}>
        <button onClick={handleCreateProject} className="app-button">
          🚀 Create Project
        </button>
        <button onClick={handleOpenFolder} className="app-button">
          📂 Open Folder
        </button>
      </div>
      <br />
      {isLoading && 'Loading...'}
      {!isLoading && root && (
        <>
          <h2>📁 Project Explorer</h2>
          <FileTree node={root} />
        </>
      )}
      {showDialog && (
        <ProjectDialog
          onCancel={() => setShowDialog(false)}
          onConfirm={confirmCreate}
        />
      )}
      {isLoading && (
        <div ref={logsContainerRef} className="app-log-container">
          <strong>Logs:</strong>
          <pre>{logs.join('\n')}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
