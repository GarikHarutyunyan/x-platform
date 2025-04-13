#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

// Parse CLI arguments
const argv = yargs(hideBin(process.argv))
  .option("config", {
    alias: "c",
    type: "string",
    describe: "Path to JSON config file",
  })
  .option("directory", {
    alias: "d",
    type: "string",
    describe: "Project directory name",
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
config.directory = argv.directory || config.directory || "my-node-app";

let projectDir = config.directory;

// Check if the project directory exists, and increment the name if it does
let counter = 1;
const originalProjectDir = projectDir;
while (fs.existsSync(projectDir)) {
  projectDir = `${originalProjectDir}-${counter}`;
  counter++;
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

fs.writeFileSync("index.js", serverCode);

// Create a `.gitignore` file
const gitignore = `
node_modules/
.env
`;
fs.writeFileSync(".gitignore", gitignore);

// Modify package.json to add start script
const packageJsonPath = path.join(process.cwd(), "package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
packageJson.scripts = {
  ...packageJson.scripts,
  start: "node index.js",
};

// Write the updated package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

console.log("✅ Node.js + Express project setup complete!");
console.log(`🚀 To start the server, run: cd ${projectDir} && npm start`);
