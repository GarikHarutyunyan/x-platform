#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Function to validate project name (only alphanumeric, hyphens, and underscores)
function isValidName(name) {
  const regex = /^[a-zA-Z0-9_-]+$/;
  return regex.test(name);
}

// Parse CLI arguments
const args = process.argv.slice(2);
let config = {};
let configPath;

// Extract CLI arguments
args.forEach((arg, i) => {
  if (arg === "--config" && args[i + 1]) {
    configPath = args[i + 1];
  } else if (arg.startsWith("--")) {
    const key = arg.slice(2);
    const value = args[i + 1]?.startsWith("--") ? true : args[i + 1];
    config[key] = value === "true" ? true : value === "false" ? false : value;
  }
});

// Read config file if path is provided
if (configPath) {
  if (!fs.existsSync(configPath)) {
    console.error(`❌ Config file not found at ${configPath}`);
    process.exit(1);
  }
  const fileConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
  config = { ...fileConfig, ...config }; // CLI overrides config file
}

// Defaults
config.name = config.name || "my-expo-app";
config.path = path.resolve(config.path || process.cwd());

// Ensure the path exists
if (!fs.existsSync(config.path)) {
  fs.mkdirSync(config.path, { recursive: true });
}

// Validate project name
if (!isValidName(config.name)) {
  console.error(`❌ "${config.name}" is not a valid project name. Only alphanumeric characters, hyphens, and underscores are allowed.`);
  process.exit(1);
}

// Determine full path and handle collisions
let projectDir = path.join(config.path, config.name);
const baseName = config.name;
let counter = 1;
while (fs.existsSync(projectDir)) {
  const bumpedName = `${baseName}-${counter++}`;
  projectDir = path.join(config.path, bumpedName);
}
const finalName = path.basename(projectDir);

// Prepare the TypeScript flag
const tsFlag = config.useTypeScript
  ? "--template expo-template-blank-typescript"
  : "--template expo-template-blank";

// Create the project using Expo CLI
console.log(`🚀 Creating Expo app in "${projectDir}"...`);
const command = `npx expo init ${finalName} ${tsFlag}`;
execSync(command, { stdio: "inherit" });

// Move the project to final location if needed
const tempDir = path.join(process.cwd(), finalName);
if (tempDir !== projectDir) {
  fs.renameSync(tempDir, projectDir);
}

console.log("✅ Expo app setup complete!");
console.log(`🚀 To run the app, navigate to the directory and use:`);
console.log(`    cd "${projectDir}"`);
console.log(`    npx expo start`);
