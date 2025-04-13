import { useEffect, useState } from 'react';

type FileNode = {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileNode[];
};

function FileTree({ node }: { node: FileNode }) {
  const [expanded, setExpanded] = useState(false);

  const handleClick = () => {
    if (node.type === 'file') {
      window.electronAPI.openFile(node.path);
    } else {
      setExpanded(!expanded);
    }
  };

  return (
    <div style={{ marginLeft: 16 }}>
      <div onClick={handleClick} style={{ cursor: 'pointer' }}>
        {node.type === 'folder' ? (expanded ? '📂' : '📁') : '📄'} {node.name}
      </div>
      {expanded &&
        node.children?.map((child) => (
          <FileTree key={child.path} node={child} />
        ))}
    </div>
  );
}

function App() {
  const [root, setRoot] = useState<FileNode | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [projectName, setProjectName] = useState('');

  const [logs, setLogs] = useState<string[]>([]);

useEffect(() => {
  window.electronAPI.onCommandLog((msg) => {
    setLogs((prev) => [...prev, msg]);
  });
}, []);

  useEffect(() => {
    const path = 'C:/Users/Lenovo/My Projects/FullStack/X-Platform';
    window.electronAPI.readDirectory(path).then(setRoot);
  }, []);

  const handleCreateProject = () => {
    setShowDialog(true);
  };

  const confirmCreate = () => {
    if (projectName.trim()) {
      window.electronAPI.createProject(projectName.trim());
      setProjectName('');
      setShowDialog(false);
    }
  };

  return (
    <div style={{ padding: 20, height: '100vh' }}>
      <h2>📁 Project Explorer</h2>
      <button onClick={handleCreateProject} style={{ marginBottom: 16 }}>
        🚀 Create Project
      </button>
      {showDialog && (
        <div style={{
          background: '#00000088',
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ background: '#fff', padding: 20, borderRadius: 8, minWidth: 300 }}>
            <h3>Enter Project Name</h3>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              style={{ width: '100%', padding: 8, marginBottom: 12 }}
            />
            <button onClick={confirmCreate}>Create</button>{' '}
            <button onClick={() => setShowDialog(false)}>Cancel</button>
          </div>
        </div>
      )}
      {root ? <FileTree node={root} /> : 'Loading...'}
      <div style={{ marginTop: 20, background: '#111', color: '#0f0', padding: 10, fontFamily: 'monospace', height: 200, overflowY: 'auto' }}>
  <strong>Logs:</strong>
  <pre>{logs.join('\n')}</pre>
</div>
    </div>
  );
}

export default App;
