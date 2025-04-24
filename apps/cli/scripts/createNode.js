#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

// Function to validate project name
function isValidName(name) {
  const regex = /^[a-zA-Z0-9_-]+$/;
  return regex.test(name);
}

// Parse CLI arguments
const argv = yargs(hideBin(process.argv))
  .option("config", {
    alias: "c",
    type: "string",
    describe: "Path to JSON config file",
  })
  .option("name", {
    alias: "n",
    type: "string",
    describe: "Project name (folder name)",
  })
  .option("path", {
    alias: "p",
    type: "string",
    describe: "Path where to create the project",
  })
  .help()
  .argv;

// Load config from file if provided
let config = {};
if (argv.config) {
  const configPath = path.resolve(argv.config);
  if (!fs.existsSync(configPath)) {
    console.error(`❌ Config file not found at "${configPath}"`);
    process.exit(1);
  }
  config = JSON.parse(fs.readFileSync(configPath, "utf8"));
}

// Override config with CLI flags
config.name = argv.name || config.name || "my-node-app";
config.path = path.resolve(argv.path || config.path || process.cwd());

// 🔧 Ensure that the path exists
if (!fs.existsSync(config.path)) {
  fs.mkdirSync(config.path, { recursive: true });
}

// Validate project name
if (!isValidName(config.name)) {
  console.error(`❌ "${config.name}" is not a valid project name.`);
  process.exit(1);
}

// Determine project directory and handle collisions
let projectDir = path.join(config.path, config.name);
const baseName = config.name;
let counter = 1;
while (fs.existsSync(projectDir)) {
  const bumpedName = `${baseName}-${counter++}`;
  projectDir = path.join(config.path, bumpedName);
}

// Create project directory
fs.mkdirSync(projectDir);

// Change working directory to the new project
process.chdir(projectDir);

// Initialize npm and install Express
console.log("🚀 Initializing npm...");
execSync("npm init -y", { stdio: "inherit" });
console.log("🚀 Installing Express...");
execSync("npm install express", { stdio: "inherit" });

// Create a basic server file
const serverCode = `
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

app.listen(PORT, () => {
  console.log(\`Server is running on http://localhost:\${PORT}\`);
});
`;

fs.writeFileSync("index.js", serverCode.trim());

// Create a `.gitignore` file
const gitignore = `
node_modules/
.env
`;
fs.writeFileSync(".gitignore", gitignore.trim());

// Modify package.json to add start script
const packageJsonPath = path.join(projectDir, "package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
packageJson.scripts = {
  ...packageJson.scripts,
  start: "node index.js",
};

// Write the updated package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

console.log("✅ Node.js + Express project setup complete!");
console.log(`🚀 To start the server, run:\n📂 cd "${projectDir}"\n▶️ npm start`);
