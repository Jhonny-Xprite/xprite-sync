/**
 * @module mcp-pulse-core
 * @description Core de monitoramento de saúde para containers MCP.
 */

const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

async function checkContainersPulse() {
    try {
        const { stdout } = await execAsync('docker ps --filter "name=mcp-" --format "{{.Names}}\t{{.Status}}\t{{.Image}}"');
        const lines = stdout.split('\n').filter(l => l.trim());
        
        return lines.map(line => {
            const [name, status, image] = line.split('\t');
            return {
                name,
                status: status.includes('Up') ? 'HEALTHY' : 'UNHEALTHY',
                uptime: status,
                image
            };
        });
    } catch (error) {
        console.error('[Pulse] Erro ao consultar Docker:', error.message);
        return [];
    }
}

if (require.main === module) {
    checkContainersPulse().then(res => console.log(JSON.stringify(res, null, 2)));
}

module.exports = { checkContainersPulse };
