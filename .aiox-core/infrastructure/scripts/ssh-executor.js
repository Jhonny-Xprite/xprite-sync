/**
 * @module ssh-executor
 * @description Utilitário SSH reutilizável do AIOX para execução de comandos na VPS.
 */
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

// Configuração centralizada - Prioridade para variáveis de ambiente
const VPS_CONFIG = {
  host: process.env.VPS_IP || '92.112.176.118',
  user: process.env.VPS_USER || 'root',
  connectTimeout: parseInt(process.env.VPS_CONNECT_TIMEOUT || '10'),
};

/**
 * Executa um comando remoto na VPS via SSH.
 * @param {string} command - O comando a ser executado remotamente.
 * @returns {Promise<{ stdout: string, stderr: string }>}
 */
async function executeOnVps(command) {
  // Parâmetros vitais para automação:
  // BatchMode=yes           -> Falha se precisar de interação/senha
  // ConnectTimeout=10       -> Fail-fast se rede cair
  // StrictHostKeyChecking=accept-new -> Confia no host no primeiro toque, protege depois
  const sshCmd = `ssh -o BatchMode=yes -o ConnectTimeout=${VPS_CONFIG.connectTimeout} -o StrictHostKeyChecking=accept-new ${VPS_CONFIG.user}@${VPS_CONFIG.host} "${command}"`;
  
  try {
    const { stdout, stderr } = await execAsync(sshCmd);
    return { stdout: stdout.trim(), stderr: stderr.trim() };
  } catch (error) {
    // Tratamento de erro padronizado para o Orchestrator
    const enhancedError = new Error(`Falha na execução remota: ${error.message}`);
    enhancedError.stdout = error.stdout?.trim() || '';
    enhancedError.stderr = error.stderr?.trim() || '';
    enhancedError.code = error.code;
    throw enhancedError;
  }
}

module.exports = { executeOnVps, VPS_CONFIG };
