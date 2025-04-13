#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const configPath = path.join(__dirname, "../config.json");
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

  const tempConfigPath = path.join(__dirname, `../.temp-${configKey}-config.json`);
  fs.writeFileSync(tempConfigPath, JSON.stringify(config, null, 2));

  console.log(`\n🛠️  Creating ${label} project...`);
  try {
    execSync(`npm run ${command} -- --config "${tempConfigPath}"`, { stdio: "inherit" });
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
