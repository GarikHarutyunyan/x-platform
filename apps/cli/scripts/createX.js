const { execSync } = require('child_process');

const runScript = (label, command) => {
  console.log(`\n🛠️  Creating ${label} project...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${label} project created successfully.`);
  } catch (err) {
    console.error(`❌ Failed to create ${label} project:`, err.message);
  }
};

runScript('React', 'node scripts/createReact.js');
runScript('Node', 'node scripts/createNode.js');
runScript('React Native', 'node scripts/createReactNative.js');
runScript('Electron', 'node scripts/createElectron.js');
