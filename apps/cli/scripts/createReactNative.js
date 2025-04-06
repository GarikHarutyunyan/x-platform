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
let projectDir = config.directory || "my-expo-app";

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

// Prepare the TypeScript flag if set in the config
let tsFlag = "";
if (config.useTypeScript) {
  tsFlag = "--template expo-template-blank-typescript";
} else {
  tsFlag = "--template expo-template-blank";
}

// Create the project using Expo CLI (local version)
console.log(`🚀 Creating Expo app in "${projectDir}"...`);

// Use the local npx expo command for initialization
const command = `npx expo init ${projectDir} ${tsFlag}`;
execSync(command, { stdio: "inherit" });

console.log("✅ Expo app setup complete!");
console.log(`🚀 To run the app, navigate to the ${projectDir} directory and use:`);
console.log(`    cd ${projectDir}`);
console.log(`    npx expo start`);  // Start the Expo development server
