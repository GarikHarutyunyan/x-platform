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
  .option("directory", {
    type: "string",
    describe: "Project directory name",
  })
  .help()
  .argv;

function isValidName(name) {
  const regex = /^[a-zA-Z0-9_-]+$/;
  return regex.test(name);
}

let config = {};
if (argv.config) {
  const configPath = path.resolve(argv.config);
  if (!fs.existsSync(configPath)) {
    console.error("❌ Config file not found at", configPath);
    process.exit(1);
  }
  config = JSON.parse(fs.readFileSync(configPath, "utf8"));
}

config = { ...config, ...argv }; // Override config values with CLI flags

let projectDir = config.directory || "my-electron-app";

if (!isValidName(projectDir)) {
  console.error(`❌ "${projectDir}" is not a valid project name. Only alphanumeric characters, hyphens, and underscores are allowed.`);
  process.exit(1);
}

let counter = 1;
let originalProjectDir = projectDir;
while (fs.existsSync(projectDir)) {
  projectDir = `${originalProjectDir}-${counter}`;
  counter++;
}

console.log(`🚀 Creating Electron app in "${projectDir}"...`);

fs.mkdirSync(projectDir);
process.chdir(projectDir);

execSync("npm init -y", { stdio: "inherit" });
execSync("npm install electron", { stdio: "inherit" });

fs.writeFileSync('main.js', `
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

fs.writeFileSync('package.json', JSON.stringify({
  name: projectDir,
  version: "1.0.0",
  main: "main.js",
  scripts: {
    start: "electron .",
  },
  dependencies: {
    electron: "^latest"
  }
}, null, 2));

console.log("✅ Electron app setup complete!");
console.log(`🚀 To run the Electron app, ensure your React app is running on http://localhost:5173 and then use:`);
console.log(`    cd ${projectDir}`);
console.log(`    npm start`);
