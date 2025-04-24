#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

const argv = yargs(hideBin(process.argv))
  .option("config", {
    type: "string",
    describe: "Path to config file",
  })
  .option("name", {
    type: "string",
    describe: "Project name",
  })
  .option("path", {
    type: "string",
    describe: "Directory to create the project in",
  })
  .help()
  .argv;

function isValidName(name) {
  const regex = /^[a-zA-Z0-9_-]+$/;
  return regex.test(name);
}

// Load config
let config = {};
if (argv.config) {
  const configPath = path.resolve(argv.config);
  if (!fs.existsSync(configPath)) {
    console.error("❌ Config file not found at", configPath);
    process.exit(1);
  }
  config = JSON.parse(fs.readFileSync(configPath, "utf8"));
}

// Merge CLI args over config
config = { ...config, ...argv };

// Defaults
config.name = config.name || "my-electron-app";
config.path = path.resolve(config.path || process.cwd());

// Validate name
if (!isValidName(config.name)) {
  console.error(`❌ "${config.name}" is not a valid project name. Only alphanumeric characters, hyphens, and underscores are allowed.`);
  process.exit(1);
}

// Determine final project directory with collision handling
let projectDir = path.join(config.path, config.name);
const baseName = config.name;
let counter = 1;
while (fs.existsSync(projectDir)) {
  const newName = `${baseName}-${counter++}`;
  projectDir = path.join(config.path, newName);
}
const finalName = path.basename(projectDir);

// Create project
console.log(`🚀 Creating Electron app in "${projectDir}"...`);
fs.mkdirSync(projectDir, { recursive: true });
process.chdir(projectDir);

// Initialize npm and install Electron
execSync("npm init -y", { stdio: "inherit" });
execSync("npm install electron", { stdio: "inherit" });

// Create main Electron file
fs.writeFileSync("main.js", `
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  win.loadURL('http://localhost:5173');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
`);

// Write package.json with script and Electron dependency
const packageJsonPath = path.join(projectDir, "package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
packageJson.name = finalName;
packageJson.main = "main.js";
packageJson.scripts.start = "electron .";
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

console.log("✅ Electron app setup complete!");
console.log(`🚀 To run the Electron app, ensure your React app is running on http://localhost:5173 and then use:`);
console.log(`    cd "${projectDir}"`);
console.log(`    npm start`);
