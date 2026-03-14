/**
 * @module mcp-sync-ide
 * @description Syncs the centralized mcp-servers.json to all IDE configs.
 * Usage: npm run mcp:sync:ide
 */

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

const ROOT = process.cwd();
const SOURCE = path.join(ROOT, 'extensions', 'mcp-servers.json');

const TARGETS = [
  {
    name: 'AntiGravity',
    path: path.join(ROOT, '.antigravity', 'mcp_config.json'),
    transform: (servers) => servers // Direct copy
  },
  {
    name: 'Claude Code',
    path: path.join(ROOT, '.claude', 'settings.local.json'),
    transform: (servers, existing) => {
      // Merge mcpServers into existing settings
      return { ...existing, mcpServers: servers.mcpServers };
    }
  },
  {
    name: 'Codex',
    path: path.join(ROOT, '.codex', 'codex.json'),
    transform: (servers) => servers // Direct copy
  }
];

async function sync() {
  console.log(chalk.bold.cyan('\n🔄 AIOX MCP IDE Sync'));
  console.log(chalk.gray(`Source: ${SOURCE}\n`));

  if (!fs.existsSync(SOURCE)) {
    console.error(chalk.red('❌ Source mcp-servers.json not found.'));
    process.exit(1);
  }

  const source = await fs.readJson(SOURCE);
  const serverCount = Object.keys(source.mcpServers).length;

  for (const target of TARGETS) {
    try {
      let existing = {};
      if (fs.existsSync(target.path)) {
        existing = await fs.readJson(target.path);
      }

      const result = target.transform(source, existing);
      await fs.ensureDir(path.dirname(target.path));
      await fs.writeJson(target.path, result, { spaces: 2 });
      
      console.log(chalk.green(`✅ ${target.name}: ${serverCount} MCPs synced → ${path.relative(ROOT, target.path)}`));
    } catch (error) {
      console.error(chalk.red(`❌ ${target.name}: ${error.message}`));
    }
  }

  console.log(chalk.bold.green(`\n✅ All IDEs synced with ${serverCount} official MCP servers.`));
}

sync();
