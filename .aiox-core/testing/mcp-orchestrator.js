const { spawn } = require('child_process');
const path = require('path');
const chalk = require('chalk');
const fs = require('fs-extra');
require('dotenv').config();

const REGISTRY_PATH = path.join(process.cwd(), 'extensions', 'mcp-registry.json');

class AioxOrchestrator {
    constructor() {
        this.registry = fs.readJsonSync(REGISTRY_PATH);
    }

    async callTool(mcpId, toolName, args) {
        const mcp = this.registry.mcps.find(m => m.id === mcpId);
        if (!mcp) throw new Error(`MCP ${mcpId} not found in registry.`);

        const image = `mcp/${mcp.id}:latest`;
        const id = Math.floor(Math.random() * 100000);

        console.log(chalk.cyan.bold(`\n[AIOX ORCHESTRATOR] Routing call to ${chalk.yellow(mcpId)} via Container`));
        console.log(chalk.gray(`  Container: ${image}`));
        console.log(chalk.gray(`  Tool: ${toolName}`));

        const dockerArgs = ['run', '--rm', '-i'];
        
        // Inject Envs from .env based on MCP config
        if (mcp.env) {
            for (const key of Object.keys(mcp.env)) {
                if (process.env[key]) {
                    dockerArgs.push('-e', `${key}=${process.env[key]}`);
                }
            }
        }

        // Special handling for memory volume
        if (mcpId === 'memory') {
            const dataPath = path.join(process.cwd(), '.tmp', 'memory');
            fs.ensureDirSync(dataPath);
            dockerArgs.push('-v', `${dataPath}:/app/data`);
            dockerArgs.push('-e', 'MEMORY_DB_PATH=/app/data/memory.db');
        }

        dockerArgs.push(image);

        return new Promise((resolve, reject) => {
            const container = spawn('docker', dockerArgs);
            let responseReceived = false;
            let stdout = '';

            container.stderr.on('data', (d) => {
                const msg = d.toString();
                // If it's a "running" message, send the request
                if (msg.includes('running') || msg.includes('stdio') || msg.includes('Server')) {
                    if (!responseReceived) {
                        container.stdin.write(JSON.stringify({
                            jsonrpc: "2.0",
                            method: "tools/call",
                            id,
                            params: { name: toolName, arguments: args }
                        }) + '\n');
                    }
                }
            });

            container.stdout.on('data', (d) => {
                const chunk = d.toString();
                stdout += chunk;
                try {
                    const lines = stdout.split('\n');
                    for (const line of lines) {
                        const trimmed = line.trim();
                        if (trimmed.startsWith('{')) {
                            const res = JSON.parse(trimmed);
                            if (res.id === id || res.result || res.error) {
                                responseReceived = true;
                                container.kill();
                                if (res.error) {
                                  resolve({ content: [{ type: 'text', text: `ERROR: ${JSON.stringify(res.error)}` }] });
                                } else {
                                  resolve(res.result);
                                }
                                return;
                            }
                        }
                    }
                } catch (e) {}
            });

            setTimeout(() => {
                if (!responseReceived) {
                    container.kill();
                    resolve({ content: [{ type: 'text', text: 'TIMEOUT' }] });
                }
            }, 60000);
        });
    }
}

module.exports = { AioxOrchestrator };
