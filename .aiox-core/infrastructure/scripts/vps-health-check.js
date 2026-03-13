/**
 * @file vps-health-check.js
 * @description Script de monitoramento semafórico da saúde da VPS.
 * @epic Epic 4 (Story 4.3)
 */

const { executeOnVps } = require('./ssh-executor');

const RAM_THRESHOLD = parseInt(process.env.VPS_RAM_THRESHOLD || '80');
const DISK_THRESHOLD = parseInt(process.env.VPS_DISK_THRESHOLD || '75');

async function getHealth() {
  const timestamp = new Date().toLocaleString();
  console.log(`\n[AIOX] VPS Health Report ─────────────────────── ${timestamp}`);
  console.log(`══════════════════════════════════════════════════════════════════════`);

  try {
    // Coleta em paralelo para otimizar tempo de SSH
    const commands = [
      "free -m | grep Mem | awk '{print $3,$2}'", // RAM (Used, Total)
      "df -m / | tail -1 | awk '{print $3,$2}'",  // Disco (Used, Total)
      "top -bn1 | grep 'Cpu(s)' | awk '{print $2}'", // CPU
      "uptime -p",                                 // Uptime
      "docker ps --format '{{.Names}}' | grep ollama || echo 'stopped'", // Ollama container
      "systemctl is-active cloudflared || echo 'inactive'",             // Cloudflared service
      "docker ps --format '{{.Names}}' | grep easypanel || echo 'stopped'", // Easypanel container
    ];

    const results = await Promise.all(commands.map(cmd => executeOnVps(cmd)));

    const ram = results[0].stdout.split(' ');
    const ramUsed = parseInt(ram[0]);
    const ramTotal = parseInt(ram[1]);
    const ramPerc = Math.round((ramUsed / ramTotal) * 100);

    const disk = results[1].stdout.split(' ');
    const diskUsed = parseInt(disk[0]);
    const diskTotal = parseInt(disk[1]);
    const diskPerc = Math.round((diskUsed / diskTotal) * 100);

    const cpuUsage = results[2].stdout.replace(',', '.');
    const cpuPerc = Math.round(parseFloat(cpuUsage));

    const uptime = results[3].stdout.replace('up ', '');
    const ollamaStatus = results[4].stdout.includes('ollama') ? '✅ Rodando' : '❌ Parado';
    const cloudflareStatus = results[5].stdout === 'active' ? '✅ Ativo' : '❌ Inativo';
    const easypanelStatus = results[6].stdout.includes('easypanel') ? '✅ Ativo' : '⚠️ Verifique';

    // Helper semafórico
    const getIcon = (perc, threshold) => {
      if (perc >= threshold) return '❌';
      if (perc >= threshold * 0.8) return '⚠️';
      return '✅';
    };

    console.log(`  RAM       ${getIcon(ramPerc, RAM_THRESHOLD)}  ${(ramUsed/1024).toFixed(1)} GB / ${(ramTotal/1024).toFixed(1)} GB (${ramPerc}%)`);
    console.log(`  Disco     ${getIcon(diskPerc, DISK_THRESHOLD)}  ${(diskUsed/1024).toFixed(1)} GB / ${(diskTotal/1024).toFixed(1)} GB (${diskPerc}%)`);
    console.log(`  CPU       ${getIcon(cpuPerc, 90)}  ${cpuPerc}%`);
    console.log(`  Uptime    ✅  ${uptime}`);
    console.log(` ──────────────────────────────────────────────────────────────────────`);
    console.log(`  Ollama    ${ollamaStatus}`);
    console.log(`  Cloudflr  ${cloudflareStatus}`);
    console.log(`  Easypanel ${easypanelStatus}`);
    console.log(`══════════════════════════════════════════════════════════════════════`);

    // Recomendações
    let issues = [];
    if (ramPerc >= RAM_THRESHOLD) {
      issues.push(`❌ RAM Crítica (${ramPerc}%)! Ação: npm run vps:ssh "docker service update --force aios-core_ollama"`);
    }
    if (diskPerc >= DISK_THRESHOLD) {
      issues.push(`⚠️ Disco em ${diskPerc}%. Ação: npm run vps:ssh "docker image prune -af"`);
    }
    if (ollamaStatus.includes('Parado')) {
      issues.push(`❌ Ollama Parado! Ação: npm run vps:ssh "docker service update --force aios-core_ollama"`);
    }

    if (issues.length > 0) {
      console.log(`\n🚨 ALERTAS DETECTADOS:`);
      issues.forEach(issue => console.log(`💡 ${issue}`));
      process.exit(1);
    } else {
      console.log(`\n💡 VPS operando dentro dos limites. Nenhuma ação necessária.`);
    }

  } catch (error) {
    console.error(`\n❌ Falha ao coletar dados de saúde:`, error.message);
    process.exit(1);
  }
}

getHealth();
