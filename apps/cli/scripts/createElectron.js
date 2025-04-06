#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Function to validate project name (only alphanumeric, hyphens, and underscores)
function isValidName(name) {
  const regex = /^[a-zA-Z0-9_-]+$/;
  return regex.test(name);
}

// Read the config file
const configPath = path.join(__dirname, "../config.json");
if (!fs.existsSync(configPath)) {
  console.error("❌ Config file not found!");
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
let projectDir = config.directory || "my-electron-app";

// Validate project name
if (!isValidName(projectDir)) {
  console.error(`❌ "${projectDir}" is not a valid project name. Only alphanumeric characters, hyphens, and underscores are allowed.`);
  process.exit(1);
}

// Check if the project directory exists, and increment the name if it does
let counter = 1;
let originalProjectDir = projectDir;
while (fs.existsSync(projectDir)) {
  projectDir = `${originalProjectDir}-${counter}`;
  counter++;
}

// Create the Electron app
console.log(`🚀 Creating Electron app in "${projectDir}"...`);

// Initialize a new directory for the Electron app
fs.mkdirSync(projectDir);

// Change directory to the new project directory
process.chdir(projectDir);

// Initialize npm project
execSync("npm init -y", { stdio: "inherit" });

// Install Electron
execSync("npm install electron", { stdio: "inherit" });

// Create basic Electron files (main.js, package.json modifications, etc.)
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

  // Load the React app (ensure it's running on port 5173)
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
console.log(`    npm start`);  // Start the Electron app
