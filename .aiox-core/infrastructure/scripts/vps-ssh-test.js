/**
 * @file vps-ssh-test.js
 * @description Script de infraestrutura para testar a ponte de comunicação SSH entre o AIOX e a VPS.
 * @epic Epic 4: Easypanel VPS Orchestration (Story 4.1)
 */

const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

const VPS_IP = '92.112.176.118';
const VPS_USER = 'root';
const TARGET_FOLDER = '/'; // Posteriormente testaremos acessando /aios-core
const TEST_COMMAND = `ls -la ${TARGET_FOLDER} && echo "\\n[AIOX] -> Bridge de Comunicacao Ativa e Autenticada!"`;

async function testSshConnection() {
  console.log(`\n[AIOX-CORE] Iniciando handshake SSH com ${VPS_USER}@${VPS_IP}...`);
  
  try {
    // Parametros vitais para automacao: BatchMode nao permite prompts de senha; StrictHostKey previne breaks
    const sshCommand = `ssh -o BatchMode=yes -o ConnectTimeout=10 -o StrictHostKeyChecking=accept-new ${VPS_USER}@${VPS_IP} "${TEST_COMMAND}"`;
    
    const { stdout, stderr } = await execAsync(sshCommand);
    
    if (stderr && !stderr.includes('Warning: Permanently added')) {
        console.warn(`[Aviso SSH]: ${stderr}`);
    }

    console.log(`\n✅ Sucesso! Resposta da VPS recebida:\n`);
    console.log(stdout);
    console.log(`[AIOX-CORE] Teste de Task 2 finalizado. O AIOX pode operar na VPS.\n`);
  } catch (error) {
    console.error(`\n❌ Falha critica na conexao SSH!`);
    console.error(`Detalhes técnicos: ${error.message}`);
    console.log(`\n[Ação Corretiva Necessária]:`);
    console.log(`1. Certifique-se de que sua chave publica foi adicionada na VPS (easypanel/ssh).`);
    console.log(`2. Se não possuir chaves, gere com: ssh-keygen -t ed25519 -C "aiox-core"`);
    process.exit(1);
  }
}

testSshConnection();