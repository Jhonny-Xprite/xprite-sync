const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');

const REGISTRY_PATH = path.join(process.cwd(), 'extensions', 'mcp-registry.json');

async function testMcpServer(mcp) {
    let child;
    let timeoutHandle;
    
    return new Promise((resolve) => {
        console.log(chalk.blue(`\n🧪 Testing MCP: ${mcp.id}...`));
        
        const absolutePath = path.join(process.cwd(), mcp.localPath);
        const indexPath = path.join(absolutePath, 'dist', 'index.js');
        
        if (!fs.existsSync(indexPath)) {
            console.log(chalk.red(`  ❌ Index not found at ${indexPath}. Base: ${mcp.localPath}. Build needed?`));
            return resolve(false);
        }

        child = spawn('node', [indexPath], {
            cwd: absolutePath,
            env: { ...process.env, ...mcp.env }, 
            stdio: ['pipe', 'pipe', 'pipe']
        });

        let output = '';
        let errorOutput = '';
        let finished = false;

        const finish = (result) => {
            if (finished) return;
            finished = true;
            clearTimeout(timeoutHandle);
            if (child && !child.killed) child.kill();
            resolve(result);
        };

        child.stdout.on('data', (data) => {
            output += data.toString();
            try {
                // Try to find a JSON-RPC response in the stream
                const lines = output.split('\n');
                for (const line of lines) {
                    if (line.trim().startsWith('{')) {
                        const response = JSON.parse(line);
                        if (response.result && response.result.tools) {
                            console.log(chalk.green(`  ✅ Received tools list from ${mcp.id} (${response.result.tools.length} tools)`));
                            return finish(true);
                        }
                    }
                }
            } catch (e) {}
        });

        child.stderr.on('data', (data) => {
            const msg = data.toString();
            errorOutput += msg;
            if (msg.toLowerCase().includes('running') || msg.toLowerCase().includes('stdio')) {
                child.stdin.write(JSON.stringify({
                    jsonrpc: "2.0",
                    method: "tools/list",
                    id: 1,
                    params: {}
                }) + '\n');
            }
        });

        child.on('error', (err) => {
            console.log(chalk.red(`  ❌ Spawn error: ${err.message}`));
            finish(false);
        });

        child.on('exit', (code) => {
            if (!finished) {
                console.log(chalk.red(`  ❌ Process exited with code ${code}`));
                finish(false);
            }
        });

        timeoutHandle = setTimeout(() => {
            if (!finished) {
                console.log(chalk.yellow(`  ⚠️ Timeout for ${mcp.id}. Checking error logs...`));
                if (errorOutput) console.log(chalk.gray(`    Logs: ${errorOutput.split('\n').slice(-3).join('\n')}`));
                finish(false);
            }
        }, 8000);
    });
}

async function runTestBattery() {
    console.log(chalk.bold.cyan('--- 🔋 AIOX INTEGRATED MCP TEST BATTERY ---'));
    
    if (!fs.existsSync(REGISTRY_PATH)) {
        console.error(chalk.red('Registry not found!'));
        process.exit(1);
    }

    const registry = await fs.readJson(REGISTRY_PATH);
    const results = [];

    // Filter out test/boilerplate MCPs for the core battery if needed
    const coreMcps = registry.mcps.filter(m => !m.id.includes('test'));

    for (const mcp of coreMcps) {
        if (mcp.runtime !== 'node') continue;
        const success = await testMcpServer(mcp);
        results.push({ id: mcp.id, success });
    }

    console.log(chalk.bold.cyan('\n--- 📊 TEST SUMMARY ---'));
    results.forEach(r => {
        const icon = r.success ? chalk.green('✅') : chalk.red('❌');
        console.log(`${icon} ${r.id}`);
    });

    const allPassed = results.every(r => r.success);
    if (results.length > 0 && allPassed) {
        console.log(chalk.bold.green('\n🔥 ALL CORE MCPs ARE FUNCTIONAL!'));
    } else {
        console.log(chalk.bold.red('\n🚨 SOME MCPs FAILED THE PULSE TEST!'));
    }
}

runTestBattery().catch(console.error);
