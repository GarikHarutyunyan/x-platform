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
  .option("directory", {
    alias: "d",
    type: "string",
    describe: "Project directory name",
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
debugger
if (argv.config) {
  const configPath = path.resolve(argv.config);
  if (!fs.existsSync(configPath)) {
    console.error(`❌ Config file not found at "${configPath}"`);
    process.exit(1);
  }
  config = JSON.parse(fs.readFileSync(configPath, "utf8"));
}

// Step 2: Override config with CLI flags
config.directory = argv.directory || config.directory || "my-react-app";
config.useTypeScript = argv.useTypeScript ?? config.useTypeScript ?? false;
config.framework = argv.framework || config.framework || "vite";

// Step 3: Validate project name
let projectDir = config.directory;
if (!isValidName(projectDir)) {
  console.error(`❌ "${projectDir}" is not a valid project name.`);
  process.exit(1);
}

// Step 4: Handle name collisions
let counter = 1;
const originalProjectDir = projectDir;
while (fs.existsSync(projectDir)) {
  projectDir = `${originalProjectDir}-${counter++}`;
}

// Step 5: Build command
let createCommand;
if (config.framework === "vite") {
  createCommand = `npx create-vite@latest ${projectDir} --template ${config.useTypeScript ? "react-ts" : "react"}`;
} else if (config.framework === "next") {
  const tsFlag = config.useTypeScript ? "--typescript" : "";
  createCommand = `npx create-next-app@latest ${projectDir} ${tsFlag}`;
} else if (config.framework === "remix") {
  const tsFlag = config.useTypeScript ? "--typescript" : "--javascript";
  createCommand = `npx create-remix@latest ${projectDir} ${tsFlag}`;
} else {
  console.error("❌ Invalid framework. Choose vite, next, or remix.");
  process.exit(1);
}

// Step 6: Run commands
console.log(`🚀 Creating React app in "${projectDir}"...`);
execSync(createCommand, { stdio: "inherit" });

process.chdir(projectDir);
console.log(`🔄 Installing dependencies...`);
execSync("npm install", { stdio: "inherit" });

console.log("✅ Setup complete!");
console.log(`📂 cd ${projectDir}`);
console.log(`▶️ npm run dev`);
