const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');
const { spawn } = require('child_process');
const chalk = require('chalk');

const REGISTRY_PATH = path.join(process.cwd(), 'extensions', 'mcp-registry.json');
const CATALOG_PATH = 'C:/Users/Jhonn/.docker/mcp/catalogs/docker-mcp.yaml';

async function getToolsForMcp(mcp) {
    return new Promise((resolve) => {
        const absolutePath = path.join(process.cwd(), mcp.localPath);
        const indexPath = path.join(absolutePath, 'dist', 'index.js');
        
        if (!fs.existsSync(indexPath)) {
            return resolve([]);
        }

        const child = spawn('node', [indexPath], {
            cwd: absolutePath,
            stdio: ['pipe', 'pipe', 'pipe']
        });

        let output = '';
        let finished = false;

        const onData = (data) => {
            output += data.toString();
            try {
                const lines = output.split('\n');
                for (const line of lines) {
                    if (line.trim().startsWith('{')) {
                        const res = JSON.parse(line);
                        if (res.result && res.result.tools) {
                            finished = true;
                            child.kill();
                            resolve(res.result.tools);
                            return;
                        }
                    }
                }
            } catch (e) {}
        };

        child.stdout.on('data', onData);
        child.stderr.on('data', (d) => {
            if (d.toString().includes('running') || d.toString().includes('stdio')) {
                child.stdin.write(JSON.stringify({
                    jsonrpc: "2.0",
                    method: "tools/list",
                    id: 1,
                    params: {}
                }) + '\n');
            }
        });

        setTimeout(() => {
            if (!finished) {
                child.kill();
                resolve([]);
            }
        }, 5000);
    });
}

async function updateCatalog() {
    console.log(chalk.bold.magenta('🚀 AIOX REAL CATALOG SYNC: docker-mcp.yaml'));
    
    if (!fs.existsSync(REGISTRY_PATH)) {
        console.error('❌ Registry not found.');
        return;
    }

    const registry = await fs.readJson(REGISTRY_PATH);
    
    const catalog = {
        version: 3,
        name: 'docker-mcp',
        displayName: 'AIOX Managed Docker MCPs',
        registry: {}
    };

    for (const mcp of registry.mcps) {
        console.log(chalk.blue(`📦 Processing ${mcp.id}...`));
        
        const tools = await getToolsForMcp(mcp);
        
        const entry = {
            description: mcp.description,
            title: mcp.id.charAt(0).toUpperCase() + mcp.id.slice(1).replace(/-/g, ' '),
            type: 'server',
            dateAdded: new Date().toISOString(),
            image: `mcp/${mcp.id}:latest`,
            tools: tools.map(t => ({ name: t.name })),
            env: [],
            secrets: []
        };

        if (mcp.env) {
            for (const [key, val] of Object.entries(mcp.env)) {
                if (val.secret) {
                    entry.secrets.push({
                        name: key.toLowerCase().replace(/_/g, '.'),
                        env: key,
                        description: `Secret for ${key}`
                    });
                } else {
                    entry.env.push({
                        name: key,
                        value: '' // User to fill
                    });
                }
            }
        }

        catalog.registry[mcp.id] = entry;
    }

    if (fs.existsSync(CATALOG_PATH)) {
        await fs.copy(CATALOG_PATH, CATALOG_PATH + '.bak', { overwrite: true });
        console.log(chalk.gray(`  Backup created.`));
    }

    await fs.writeFile(CATALOG_PATH, yaml.dump(catalog));
    console.log(chalk.green(`\n✅ REAL CATALOG UPDATED with ${Object.keys(catalog.registry).length} servers.`));
}

updateCatalog().catch(console.error);
