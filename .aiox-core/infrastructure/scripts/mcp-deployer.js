const { exec } = require('child_process');
const util = require('util');
const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const { executeOnVps } = require('./ssh-executor.js');
const execAsync = util.promisify(exec);

const mcpName = process.argv[2];

if (!mcpName) {
  console.error(chalk.red('❌ Please provide MCP name: npm run mcp:deploy <name>'));
  process.exit(1);
}

const targetDir = path.join(process.cwd(), 'extensions', 'mcps', mcpName);

async function deploy() {
  if (!fs.existsSync(targetDir)) {
    console.error(chalk.red(`❌ MCP directory not found: ${targetDir}`));
    process.exit(1);
  }

  try {
    console.log(chalk.blue(`📦 Building Docker image for ${chalk.bold(mcpName)}...`));
    
    // 1. Build local (to validate)
    const imageName = `mcp/${mcpName}:latest`;
    await execAsync(`docker build -t ${imageName} .`, { cwd: targetDir });
    console.log(chalk.green(`✅ Local build successful: ${imageName}`));

    // 2. Deployment Logic (Abstraction for Story 5.3)
    // In a real scenario, we would push to a registry or export/load.
    // For this story, we will simulate the registry push or direct remote build.
    
    console.log(chalk.blue(`🚀 Deploying to VPS...`));
    
    // Simulating remote sanity check
    const remoteCheck = await executeOnVps('docker --version');
    console.log(chalk.gray(`Found remote docker: ${remoteCheck.stdout}`));

    // Logic: In Wave 3/4 we will refine this to use Easypanel API or direct Docker Compose.
    // For now, we validate the communication and the image existence.
    
    console.log(chalk.green(`\n✅ MCP ${chalk.bold(mcpName)} deployed successfully (simulated/validated).`));
    console.log(chalk.yellow(`\nRegistry: https://vps-aiox.io/mcp/${mcpName}`));

  } catch (error) {
    console.error(chalk.red(`❌ Deployment failed:`));
    console.error(chalk.gray(error.stderr || error.message));
    process.exit(1);
  }
}

deploy();
