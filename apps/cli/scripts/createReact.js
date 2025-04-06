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
let projectDir = config.directory || "my-react-app";

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
  tsFlag = "--template typescript";
} else {
  tsFlag = "--template react";
}

// Create the React project using Vite, Next.js, or Remix based on config
console.log(`🚀 Creating React app in "${projectDir}"...`);

// Update the command to use Vite, Next.js, or Remix
let createCommand;
if (config.framework === "vite") {
  createCommand = `npx create-vite@latest ${projectDir} --template ${config.useTypeScript ? "react-ts" : "react"}`;
} else if (config.framework === "next") {
  createCommand = `npx create-next-app@latest ${projectDir} ${tsFlag}`;
} else if (config.framework === "remix") {
  createCommand = `npx create-remix@latest ${projectDir} ${tsFlag}`;
} else {
  console.error("❌ Invalid framework specified. Please choose either 'vite', 'next', or 'remix'.");
  process.exit(1);
}

// Execute the command to create the project
execSync(createCommand, { stdio: "inherit" });

// Change directory to the newly created project
process.chdir(projectDir);

// Install dependencies
console.log(`🔄 Installing dependencies for "${projectDir}"...`);
execSync("npm install", { stdio: "inherit" });

console.log("✅ React app setup complete!");
console.log(`🚀 To run the app, navigate to the ${projectDir} directory and use:`);
console.log(`    cd ${projectDir}`);
console.log(`    npm run dev`);  // For Vite, Next.js, or Remix development server
