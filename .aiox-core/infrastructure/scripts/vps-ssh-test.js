/**
 * @file vps-ssh-test.js
 * @description Script de infraestrutura para testar a ponte de comunicação SSH entre o AIOX e a VPS.
 * @epic Epic 4: Easypanel VPS Orchestration (Story 4.1 / 4.3)
 */

const { executeOnVps, VPS_CONFIG } = require('./ssh-executor');

const TARGET_FOLDER = '/';
const TEST_COMMAND = `ls -la ${TARGET_FOLDER} && echo "\\n[AIOX] -> Bridge de Comunicacao Ativa e Autenticada!"`;

async function testSshConnection() {
  console.log(`\n[AIOX-CORE] Iniciando handshake SSH com ${VPS_CONFIG.user}@${VPS_CONFIG.host}...`);
  
  try {
    const { stdout, stderr } = await executeOnVps(TEST_COMMAND);
    
    if (stderr && !stderr.includes('Warning: Permanently added')) {
        console.warn(`[Aviso SSH]: ${stderr}`);
    }

    console.log(`\n✅ Sucesso! Resposta da VPS recebida:\n`);
    console.log(stdout);
    console.log(`[AIOX-CORE] Teste de conectividade finalizado. O AIOX pode operar na VPS.\n`);
  } catch (error) {
    console.error(`\n❌ Falha critica na conexao SSH!`);
    console.error(`Detalhes técnicos: ${error.message}`);
    if (error.stderr) console.error(`Stderr: ${error.stderr}`);
    
    console.log(`\n[Ação Corretiva Necessária]:`);
    console.log(`1. Certifique-se de que sua chave publica foi adicionada na VPS.`);
    console.log(`2. Verifique se o IP ${VPS_CONFIG.host} está correto no seu .env.`);
    process.exit(1);
  }
}

testSshConnection();