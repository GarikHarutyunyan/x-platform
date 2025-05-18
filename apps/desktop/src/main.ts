// main.ts
import {exec, spawn} from 'child_process';
import {app, BrowserWindow, dialog, ipcMain} from 'electron';
import fs from 'fs';
import open from 'open';
import path from 'path';

const runningProcesses = new Map<string, number>();

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
  win.loadURL('http://localhost:3001');
};

app.whenReady().then(createWindow);

ipcMain.handle('read-directory', async (_, dirPath: string) => {
  const walk = (dir: string): any => {
    const result = {
      name: path.basename(dir),
      path: dir,
      type: 'folder',
      children: [] as any[],
    };
    for (const item of fs.readdirSync(dir)) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        result.children.push(walk(fullPath));
      } else {
        result.children.push({name: item, path: fullPath, type: 'file'});
      }
    }
    return result;
  };
  return walk(dirPath);
});

ipcMain.handle('is-startable-project', async (_, dirPath: string) => {
  try {
    const pkgPath = path.join(dirPath, 'package.json');
    if (!fs.existsSync(pkgPath)) return false;
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    return !!pkg.scripts?.start || !!pkg.scripts?.dev;
  } catch {
    return false;
  }
});

ipcMain.on('start-project', (event, dirPath: string) => {
  if (runningProcesses.has(dirPath)) return;
  let command = 'start';
  const pkgPath = path.join(dirPath, 'package.json');
  if (!fs.existsSync(pkgPath)) return;
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

  if (!pkg.scripts?.start && !!pkg.scripts?.dev) {
    command = 'run dev';
  }

  const child = spawn('npm', [command], {
    cwd: dirPath,
    shell: true,
    stdio: ['pipe', 'pipe', 'pipe'],
    windowsHide: true,
  });
  child.stdout.setEncoding('utf8');

  child.stdout.on('data', (data) => {
    const output = data.toString();
    console.log('Expo Output:', output);
    event.sender.send('command-log', output);

    const match = output.match(/exp:\/\/\S+/);
    if (match) {
      event.sender.send('expo-url', match[0]);
    }
  });

  runningProcesses.set(dirPath, child.pid ?? 0);
  child.unref();

  try {
    const pkgPath = path.join(dirPath, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    const devDependencies = Object.keys(pkg.devDependencies || {});
    const dependencies = Object.keys(pkg.dependencies || {});
    const isVite = devDependencies.includes('vite');
    const isExpress = dependencies.includes('express');

    let port: number | null = null;
    if (isVite) port = 5173;
    else if (isExpress) port = 3000;

    if (port) {
      setTimeout(() => {
        open(`http://localhost:${port}`);
      }, 2000);
    }
  } catch (err) {
    console.warn('Could not parse package.json for port detection');
  }
});

ipcMain.on('stop-project', (_, dirPath: string) => {
  const pid = runningProcesses.get(dirPath);
  if (pid) {
    try {
      exec(`taskkill /PID ${pid} /T /F`, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error terminating process: ${error.message}`);
          return;
        }
        console.log(`Process terminated: ${stdout}`);
        runningProcesses.delete(dirPath);
      });
    } catch (err) {
      console.error('Failed to stop process:', err);
    }
  }
});

app.on('before-quit', () => {
  for (const pid of runningProcesses.values()) {
    try {
      process.kill(-pid);
    } catch {}
  }
});

ipcMain.on('open-file', (_, filePath: string) => {
  const platform = process.platform;
  if (platform === 'win32') exec(`start "" "${filePath}"`);
  else if (platform === 'darwin') exec(`open "${filePath}"`);
  else exec(`xdg-open "${filePath}"`);
});

ipcMain.on(
  'create-project',
  (event, config: {name: string; [key: string]: any}) => {
    const {name, ...projectConfig} = config;
    const tempConfigPath = path.join(__dirname, '.temp-config.json');
    fs.writeFileSync(tempConfigPath, JSON.stringify(projectConfig, null, 2));

    const child = spawn(
      'npm',
      ['run', 'create:x', '--', '--config', `"${tempConfigPath}"`],
      {
        cwd: 'C:/Users/Lenovo/My Projects/FullStack/X-Platform/apps/cli',
        shell: true,
        env: {...process.env, PROJECT_NAME: name},
      }
    );

    child.stdout.on('data', (data) => {
      event.sender.send('command-log', data.toString());
    });

    child.on('close', (code) => {
      fs.unlinkSync(tempConfigPath);
      console.log(`create:x exited with code ${code}`);
      if (code === 0) {
        event.sender.send(
          'project-created',
          path.join(
            'C:/Users/Lenovo/My Projects/FullStack/X-Platform/apps/cli',
            name
          )
        );
      }
    });
  }
);

ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'],
  });
  return result.canceled ? null : result.filePaths[0];
});
