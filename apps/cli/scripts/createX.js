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
  .help()
  .argv;

const projectName = process.env.PROJECT_NAME || "my-app";
const baseDir = process.cwd();
let projectDir = path.join(baseDir, projectName);

// If the folder exists, auto-increment the name (e.g., my-app-2, my-app-3, ...)
let counter = 2;
while (fs.existsSync(projectDir)) {
  projectDir = path.join(baseDir, `${projectName}-${counter}`);
  counter++;
}

fs.mkdirSync(projectDir, { recursive: true });
console.log(`📁 Project directory created at: ${projectDir}`);

let configPath = path.join(__dirname, "../config.json");
if (argv.config) {
  console.log("🚀 ~ argv.config:", argv.config)
  configPath = path.resolve(argv.config);
}

if (!fs.existsSync(configPath)) {
  console.error("❌ Main config.json file not found!");
  process.exit(1);
}

const fullConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));

// Utility to run a CLI command with a temp config file
const runWithTempConfig = (label, command, configKey) => {
  const config = fullConfig[configKey];

  if (!config) {
    console.warn(`⚠️  Skipping ${label} — no "${configKey}" config found.`);
    return;
  }

  config.path = projectDir + "/" + config?.path;


  const tempConfigPath = path.join(__dirname, `../.temp-${configKey}-config.json`);
  fs.writeFileSync(tempConfigPath, JSON.stringify(config, null, 2));

  console.log(`\n🛠️  Creating ${label} project...`);
  try {
    execSync(`npm run ${command} -- --config "${tempConfigPath}"`, {
      stdio: "inherit",
      cwd: projectDir, // Run inside the new project directory
    });
    console.log(`✅ ${label} project created successfully.`);
  } catch (err) {
    console.error(`❌ Failed to create ${label} project:`, err.message);
  } finally {
    fs.unlinkSync(tempConfigPath);
  }
};

runWithTempConfig("React", "create:react", "react");
runWithTempConfig("Node", "create:node", "node");
runWithTempConfig("React Native", "create:react-native", "reactNative");
runWithTempConfig("Electron", "create:electron", "electron");
