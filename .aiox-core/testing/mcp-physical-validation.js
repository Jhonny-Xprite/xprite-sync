const { spawn } = require('child_process');
const path = require('path');
const chalk = require('chalk');

async function callMcpTool(mcpPath, method, params = {}) {
    return new Promise((resolve) => {
        const absolutePath = path.join(process.cwd(), mcpPath);
        const indexPath = path.join(absolutePath, 'dist', 'index.js');
        
        const child = spawn('node', [indexPath], {
            cwd: absolutePath,
            stdio: ['pipe', 'pipe', 'pipe']
        });

        let output = '';
        let errLog = '';
        let finished = false;

        child.stdout.on('data', (data) => {
            output += data.toString();
            try {
                const lines = output.split('\n');
                for(const line of lines) {
                    if (line.trim().startsWith('{')) {
                        const res = JSON.parse(line);
                        if (res.id === 1 || (res.result && !res.id)) {
                            finished = true;
                            child.kill();
                            resolve(res);
                        }
                    }
                }
            } catch (e) {}
        });

        child.stderr.on('data', (data) => {
            const msg = data.toString();
            errLog += msg;
            if (msg.toLowerCase().includes('running') || msg.toLowerCase().includes('stdio')) {
                 child.stdin.write(JSON.stringify({
                    jsonrpc: "2.0",
                    method: "tools/call",
                    id: 1,
                    params: {
                        name: method,
                        arguments: params
                    }
                }) + '\n');
            }
        });

        setTimeout(() => { 
            if (!finished) {
                if (!child.killed) child.kill(); 
                resolve(null); 
            }
        }, 15000);
    });
}

async function runPhysicalValidation() {
    console.log(chalk.bold.magenta('\n--- 🧠 AIOX PHYSICAL IQ VALIDATION ---'));

    // 1. Memory Test
    console.log(chalk.blue('Testing Memory Store...'));
    const memRes = await callMcpTool('extensions/mcps/memory', 'create_entities', {
        entities: [{ name: 'TestEntity', type: 'Validation', observations: ['AIOX is active'] }]
    });
    console.log(memRes ? chalk.green('  ✅ Memory Store OK') : chalk.red('  ❌ Memory Store Failed'));

    // 2. Sequential Thinking Test
    console.log(chalk.blue('Testing Sequential Thinking...'));
    const logicRes = await callMcpTool('extensions/mcps/sequential-thinking', 'sequentialthinking', {
        thought: 'Testing AIOX reasoning loop',
        thoughtNumber: 1,
        totalThoughtNumber: 1,
        nextThoughtNeeded: false
    });
    console.log(logicRes ? chalk.green('  ✅ Reasoning Loop OK') : chalk.red('  ❌ Reasoning Loop Failed'));

    // 3. Automation Test (Puppeteer)
    console.log(chalk.blue('Testing Puppeteer Navigation...'));
    const browserRes = await callMcpTool('extensions/mcps/puppeteer', 'puppeteer_navigate', {
        url: 'about:blank'
    });
    console.log(browserRes ? chalk.green('  ✅ Browser Automation OK') : chalk.red('  ⚠️ Browser Automation Skipped or Failed locally (Likely No Chromium)'));

    console.log(chalk.bold.magenta('\n--- PHYSICAL VALIDATION COMPLETE ---'));
}

runPhysicalValidation().catch(console.error);
