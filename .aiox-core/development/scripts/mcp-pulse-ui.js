/**
 * @module mcp-pulse-ui
 * @description Dashboard CLI para monitoramento do ecossistema MCP.
 */

const chalk = require('chalk');
const { checkContainersPulse } = require('./mcp-pulse-core');

async function showDashboard() {
    console.clear();
    console.log(chalk.cyan.bold('\n--- 💓 AIOX MCP PULSE DASHBOARD ---'));
    console.log(chalk.gray(`Última atualização: ${new Date().toLocaleTimeString()}\n`));

    const pulses = await checkContainersPulse();

    if (pulses.length === 0) {
        console.log(chalk.yellow('  Nenhum container MCP ativo detectado.'));
    } else {
        console.log(chalk.bold('  NAME'.padEnd(25) + 'STATUS'.padEnd(15) + 'UPTIME'));
        console.log(chalk.gray('  ' + '-'.repeat(60)));

        pulses.forEach(p => {
            const statusColor = p.status === 'HEALTHY' ? chalk.green : chalk.red;
            console.log(
                `  ${p.name.replace('/','').padEnd(23)} ` +
                `${statusColor(p.status.padEnd(14))} ` +
                `${chalk.white(p.uptime)}`
            );
        });
    }

    console.log(chalk.gray('\n[Pressione Ctrl+C para sair]'));
}

if (require.main === module) {
    showDashboard();
    // Em produção, rodaríamos em loop (setInterval)
}
