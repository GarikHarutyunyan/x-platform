import { useEffect, useState } from 'react';
import { FileNode } from '../../App';
import './FileTree.css';

type Props = {
  node: FileNode;
};

function FileTree({ node }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [isStartable, setIsStartable] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (node.type === 'folder') {
      window.electronAPI.isStartableProject?.(node.path).then(setIsStartable);
    }
  }, [node.path, node.type]);

  const handleClick = () => {
    if (node.type === 'file') {
      window.electronAPI.openFile(node.path);
    } else {
      setExpanded(!expanded);
    }
  };

  const handleStart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await window.electronAPI.startProject?.(node.path);
      setIsRunning(true);
    } catch (err) {
      console.error('Failed to start project:', err);
    }
  };

  const handleStop = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await window.electronAPI.stopProject?.(node.path);
      setIsRunning(false);
    } catch (err) {
      console.error('Failed to stop project:', err);
    }
  };
  
  return (
    <div className="file-tree__node">
      <div className="file-tree__label" onClick={handleClick}>
        {node.type === 'folder' ? (expanded ? '📂' : '📁') : '📄'} {node.name}
        {isStartable && (
          <button
            className="file-tree__start-button"
            onClick={isRunning ? handleStop : handleStart}
            title={isRunning ? 'Stop project' : 'Start project'}
            style={{ border: 'none', outline: 'none' }}
            onFocus={(e) => e.currentTarget.style.outline = 'none'}
          >
            {isRunning ? '⏹' : '▶️'}
          </button>
        )}
      </div>
      {expanded &&
        node.children?.map((child) => (
          <FileTree key={child.path} node={child} />
        ))}
    </div>
  );
}

export default FileTree;
