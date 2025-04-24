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
  .option("useTypeScript", {
    alias: "ts",
    type: "boolean",
    describe: "Use TypeScript template",
  })
  .option("framework", {
    alias: "f",
    type: "string",
    describe: "React framework (vite, next, remix)",
  })
  .help()
  .argv;

// Step 1: Load config from file if provided
let config = {};
if (argv.config) {
  const configPath = path.resolve(argv.config);
  if (!fs.existsSync(configPath)) {
    console.error(`❌ Config file not found at "${configPath}"`);
    process.exit(1);
  }
  config = JSON.parse(fs.readFileSync(configPath, "utf8"));
}

// Step 2: Override config with CLI flags
config.name = argv.name || config.name || "my-react-app";
config.path = path.resolve(argv.path || config.path || process.cwd());
config.useTypeScript = argv.useTypeScript ?? config.useTypeScript ?? false;
config.framework = argv.framework || config.framework || "vite";

// 🔧 Ensure that the path exists
if (!fs.existsSync(config.path)) {
  fs.mkdirSync(config.path, { recursive: true });
}

// Step 3: Validate project name
if (!isValidName(config.name)) {
  console.error(`❌ "${config.name}" is not a valid project name.`);
  process.exit(1);
}

// Step 4: Determine full project directory and handle collisions
let projectDir = path.join(config.path, config.name);
const baseName = config.name;
let counter = 1;
while (fs.existsSync(projectDir)) {
  const bumpedName = `${baseName}-${counter++}`;
  projectDir = path.join(config.path, bumpedName);
}
const finalName = path.basename(projectDir); // used in CLI commands

// Step 5: Build the correct create command
let createCommand;
if (config.framework === "vite") {
  createCommand = `npx create-vite@latest "${finalName}" --template ${config.useTypeScript ? "react-ts" : "react"}`;
} else if (config.framework === "next") {
  const tsFlag = config.useTypeScript ? "--typescript" : "";
  createCommand = `npx create-next-app@latest "${finalName}" ${tsFlag}`;
} else if (config.framework === "remix") {
  const tsFlag = config.useTypeScript ? "--typescript" : "--javascript";
  createCommand = `npx create-remix@latest "${finalName}" ${tsFlag}`;
} else {
  console.error("❌ Invalid framework. Choose vite, next, or remix.");
  process.exit(1);
}

// Step 6: Create project in temp dir, then move to final location
const tempDir = path.join(process.cwd(), finalName);
console.log(`🚀 Creating React app in "${projectDir}"...`);
execSync(createCommand, { stdio: "inherit" });

// Move project if not created directly in target
if (tempDir !== projectDir) {
  fs.renameSync(tempDir, projectDir);
}

// Step 7: Final setup
process.chdir(projectDir);
console.log(`🔄 Installing dependencies...`);
execSync("npm install", { stdio: "inherit" });

console.log("✅ Setup complete!");
console.log(`📂 cd "${projectDir}"`);
console.log(`▶️ npm run dev`);
