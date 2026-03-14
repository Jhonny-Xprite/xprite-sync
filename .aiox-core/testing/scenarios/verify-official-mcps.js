/**
 * AIOX MCP Verification — Tests OFFICIAL NPM MCP packages
 * This spawns the real NPM binaries, NOT custom Docker containers.
 */
const { spawn } = require('child_process');
const chalk = require('chalk');
require('dotenv').config();

function testMcp(name, command, args, env = {}) {
  return new Promise((resolve) => {
    console.log(chalk.cyan(`\n🔍 Testing: ${chalk.bold(name)}`));
    console.log(chalk.gray(`   Command: ${command} ${args.join(' ')}`));

    const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
    const actualCmd = command === 'npx' ? npxCmd : command;
    
    const child = spawn(actualCmd, args, {
      env: { ...process.env, ...env },
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true
    });

    let stdout = '';
    let toolCount = 0;
    let resolved = false;

    const request = JSON.stringify({
      jsonrpc: "2.0",
      method: "tools/list",
      id: 1,
      params: {}
    }) + '\n';

    child.stderr.on('data', (d) => {
      const msg = d.toString().trim();
      if (msg && !resolved) {
        // Server started, send the request
        child.stdin.write(request);
      }
    });

    child.stdout.on('data', (d) => {
      stdout += d.toString();
      try {
        const lines = stdout.split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('{')) {
            const res = JSON.parse(trimmed);
            if (res.result && res.result.tools) {
              toolCount = res.result.tools.length;
              const toolNames = res.result.tools.map(t => t.name);
              resolved = true;
              child.kill();
              resolve({ name, status: 'OK', toolCount, tools: toolNames });
              return;
            }
          }
        }
      } catch (e) {}
    });

    setTimeout(() => {
      if (!resolved) {
        child.kill();
        resolve({ name, status: 'TIMEOUT', toolCount: 0, tools: [] });
      }
    }, 15000);
  });
}

async function main() {
  console.log(chalk.bold.magenta('\n══════════════════════════════════════════════'));
  console.log(chalk.bold.magenta('   AIOX REAL MCP VERIFICATION (Official NPM) '));
  console.log(chalk.bold.magenta('══════════════════════════════════════════════\n'));

  const tests = [
    { name: 'Playwright (@playwright/mcp)', cmd: 'npx', args: ['-y', '@playwright/mcp@latest', '--headless'] },
    { name: 'Memory (@modelcontextprotocol/server-memory)', cmd: 'npx', args: ['-y', '@modelcontextprotocol/server-memory'] },
    { name: 'Sequential Thinking', cmd: 'npx', args: ['-y', '@modelcontextprotocol/server-sequential-thinking'] },
    { name: 'Brave Search', cmd: 'npx', args: ['-y', '@modelcontextprotocol/server-brave-search'], env: { BRAVE_API_KEY: process.env.BRAVE_API_KEY } },
    { name: 'GitHub', cmd: 'npx', args: ['-y', '@modelcontextprotocol/server-github'], env: { GITHUB_PERSONAL_ACCESS_TOKEN: process.env.GITHUB_PESSOAL_ACESS_TOKEN } },
    { name: 'Fetch', cmd: 'npx', args: ['-y', '@modelcontextprotocol/server-fetch'] },
    { name: 'Context7', cmd: 'npx', args: ['-y', '@upstash/context7-mcp@latest'] },
  ];

  const results = [];

  for (const t of tests) {
    const result = await testMcp(t.name, t.cmd, t.args, t.env || {});
    results.push(result);

    if (result.status === 'OK') {
      console.log(chalk.green(`   ✅ ${result.toolCount} tools found: ${result.tools.slice(0, 5).join(', ')}${result.toolCount > 5 ? ` (+${result.toolCount - 5} more)` : ''}`));
    } else {
      console.log(chalk.red(`   ❌ ${result.status}`));
    }
  }

  console.log(chalk.bold.white('\n══════════════════════════════════════════════'));
  console.log(chalk.bold.white('   SUMMARY'));
  console.log(chalk.bold.white('══════════════════════════════════════════════\n'));

  let total = 0;
  for (const r of results) {
    const icon = r.status === 'OK' ? '✅' : '❌';
    console.log(`  ${icon} ${r.name.padEnd(45)} ${r.toolCount} tools`);
    total += r.toolCount;
  }

  const passed = results.filter(r => r.status === 'OK').length;
  console.log(chalk.bold(`\n  Total: ${passed}/${results.length} MCPs active, ${total} tools available.`));

  if (passed === results.length) {
    console.log(chalk.bold.green('\n  🏆 ALL MCPs VERIFIED — REAL, OFFICIAL, FUNCTIONAL.'));
  } else {
    console.log(chalk.yellow(`\n  ⚠️ ${results.length - passed} MCPs need attention.`));
  }
}

main();
