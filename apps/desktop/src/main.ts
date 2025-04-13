// main.ts
import { exec, spawn } from 'child_process';
import { app, BrowserWindow, ipcMain } from 'electron';
import fs from 'fs';
import path from 'path';

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
    preload: path.join(__dirname, 'preload.js'),
    contextIsolation: true,
    nodeIntegration: false,
  },
  });

  win.loadURL('http://localhost:5173');
  // if (process.env.NODE_ENV === 'development') {
  // } else {
  //   win.loadFile(join(__dirname, '../renderer/dist/index.html'));
  // }
};


app.whenReady().then(createWindow);

ipcMain.handle('read-directory', async (_, dirPath: string) => {
  const walk = (dir: string): any => {
    const result = { name: path.basename(dir), path: dir, type: 'folder', children: [] as any[] };
    for (const item of fs.readdirSync(dir)) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        result.children.push(walk(fullPath));
      } else {
        result.children.push({ name: item, path: fullPath, type: 'file' });
      }
    }
    return result;
  };

  return walk(dirPath);
});

ipcMain.on('open-file', (_, filePath: string) => {
  const platform = process.platform;
  if (platform === 'win32') exec(`start "" "${filePath}"`);
  else if (platform === 'darwin') exec(`open "${filePath}"`);
  else exec(`xdg-open "${filePath}"`);
});

ipcMain.on('create-project', (event, name) => {
  const child = spawn('npm', ['run', 'create:x'], {
    cwd: 'C:/Users/Lenovo/My Projects/FullStack/X-Platform/apps/cli', // path to your CLI
    shell: true,
    env: { ...process.env, PROJECT_NAME: name }, // optionally pass name
  });

  child.stdout.on('data', (data) => {
    console.log(`[create:x] ${data}`);
    event.sender.send('command-log', data.toString());

  });

  child.stderr.on('data', (data) => {
    console.error(`[create:x error] ${data}`);
    event.sender.send('command-log', `[ERROR] ${data.toString()}`);

  });

  child.on('close', (code) => {
    console.log(`create:x exited with code ${code}`);
    event.sender.send('command-log', `Command finished with code ${code}`);

  });
});

// ipcMain.handle('create-project', async (event, projectName: string) => {
//   return new Promise((resolve, reject) => {
//     const child = spawn('npm', ['run', 'create:x', '--', projectName], {
//       cwd: 'C:/Users/Lenovo/My Projects/FullStack/X-Platform/apps/cli',
//       shell: true,
//     });

//     child.stdout.on('data', (data) => {
//       event.sender.send('command-log', data.toString());
//     });

//     child.stderr.on('data', (data) => {
//       event.sender.send('command-log', `[ERROR] ${data.toString()}`);
//     });

//     child.on('close', (code) => {
//       event.sender.send('command-log', `Command finished with code ${code}`);
//       resolve(code);
//     });
//   });
// });