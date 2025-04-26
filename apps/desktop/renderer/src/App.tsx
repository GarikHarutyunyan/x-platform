import { useEffect, useRef, useState } from 'react';
import './App.css';
import FileTree from './components/FileTree/FileTree';
import ProjectDialog from './components/ProjectDialog/ProjectDialog';

export type FileNode = {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileNode[];
};

const defaultPorjectConfig = {name: ''};

function App() {
  const [root, setRoot] = useState<FileNode | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [projectConfig, setProjectConfig] = useState<any>(defaultPorjectConfig);
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const logsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.electronAPI.onCommandLog((msg) => {
      setLogs(prev => {
        const newLogs = [...prev];
        if (msg !== newLogs.at(-1)) {
          return [...prev, msg];
        }
        return newLogs;
      });
    });

    window.electronAPI.onProjectCreated((projectDir) => {
      setShowDialog(false);
      setProjectConfig(defaultPorjectConfig);
      window.electronAPI.readDirectory(projectDir).then((newRoot) => {
        setRoot(newRoot);
        setIsLoading(false);
      });
    });

    // window.electronAPI.readDirectory('C:/Users/Lenovo/My Projects/FullStack/X-Platform/apps/cli/a').then((newRoot) => {
    //     setRoot(newRoot);
    //     setIsLoading(false);
    //   });
  }, []);

  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const handleCreateProject = () => setShowDialog(true);
  const confirmCreate = () => {
    const config: any = {name: projectConfig.name.trim()};

    if(projectConfig?.web) {
      config.react =  {
        "name": "web",
        "path": "apps",
        "useTypeScript": true,
        "framework": "vite"
      }
    }
    if(projectConfig?.server) {
      config.node = {
          "name": "server",
          "path": "apps",
          "useTypeScript": true
        }
    }
    if(projectConfig?.mobile) {
      config.reactNative = {
        "name": "mobile",
        "path": "apps",
        "useTypeScript": false
      }
    }
    if(projectConfig?.desktop) {
      config.electron = {
        "name": "desktop",
        "path": "apps",
        "useTypeScript": true
      }
    }

    console.log(projectConfig)
    
    if (projectConfig.name.trim()) {
      window.electronAPI.createProject(config);
      setProjectConfig(defaultPorjectConfig);
      setShowDialog(false);
      setIsLoading(true);
    }
  };

  return (
    <div className="app-container">
      <button onClick={handleCreateProject} className="app-button">
        🚀 Create Project
      </button>
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
          projectConfig={projectConfig}
          onChange={setProjectConfig}
          onCancel={() => setShowDialog(false)}
          onConfirm={confirmCreate}
        />
      )}
      {isLoading && (
        <div
          ref={logsContainerRef}
          className="app-log-container"
        >
          <strong>Logs:</strong>
          <pre>{logs.join('\n')}</pre>
        </div>
      )}
    </div>
  );
}

export default App;