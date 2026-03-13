# MCP SSH Architecture: Encapsulating SSH Calls for AIOX Tools

## 1. Visão Geral
Este documento define a arquitetura pela qual o sistema AIOX encapsulará chamadas remotas à VPS usando SSH. Esta base permite que agentes futuros acionem capacidades reais "como ferramentas" (Tools), emulando as diretrizes do **Model Context Protocol (MCP)**, mas executadas via CLI Node.js segura.

## 2. Princípios de Design (Security-First)
1. **Passwordless Only:** Autenticação guiada exclusivamente por chaves `ED25519` via agente SSH nativo do SO host.
2. **Zero Interaction (BatchMode):** Todas as chamadas SSH rodarão com `BatchMode=yes`. Se a chave falhar, o processo deve "crashar" de forma limpa, não ficar pendurado aguardando prompt no terminal do AI.
3. **Mecanismo de Trust (StrictHostKeyChecking):** Utilizaremos `StrictHostKeyChecking=accept-new` no setup inicial. Após o fingerprint ser consolidado no `known_hosts`, o sistema AIOX fará log das operações remotas e garantirá estabilidade.
4. **Timeouts Agressivos:** `ConnectTimeout=10` para prevenir loops mortos caso a VPS fique inatingível ou firewalls/Cloudflare caiam.
5. **Least Privilege (A longo prazo):** AIOX no root. No futuro criaremos sub-usuários e scripts Bash na VPS acionados via root, limitando o raio de dano.

## 3. Modelo Estrutural (AIOX -> VPS Bridge)

A comunicação acontece em três camadas lógicas:
- **Intenção (LLM):** Agente decide rodar uma Tool (ex: `CheckDiskSpace`).
- **Orquestrador MCP (AIOX):** Transforma `CheckDiskSpace` em um comando shell: `df -h`.
- **SSH Executor CLI:** Envelopa `df -h` e despacha para a máquina.

```mermaid
graph TD;
    A[Agente AIOX] -->|Tool Call: getMemStat()| B(Módulo AIOX Tools)
    B -->|Invokes: executeSsh cmd| C(SSH Executor - JS)
    C -->|Instancia child_process: ssh -o BatchMode=yes ...| D[Terminal do Host - Windows]
    D -->|ED25519 Handshake| E[VPS: 92.112.176.118]
    E -.->|Stdout: Mem 12GB Free| C
    C -.->|Retorno parseado da Tool| A
```

## 4. Interface Proposta: `executeOnVps()`

O módulo público exportável que será utilizado por todos os scripts de infraestrutura do AIOX:

```javascript
/**
 * Executa um comando remoto na VPS via SSH.
 * @param {string} command - Comando bash a ser executado na VPS.
 * @param {object} [options] - Opções de execução.
 * @param {number} [options.timeout=30000] - Timeout em ms.
 * @param {string} [options.host='92.112.176.118'] - IP/hostname da VPS.
 * @param {string} [options.user='root'] - Usuário SSH.
 * @returns {Promise<{ stdout: string, stderr: string, code: number }>}
 */
async function executeOnVps(command, options = {}) {
  const {
    timeout = 30000,
    host = process.env.VPS_HOSTINGER_HOST || '92.112.176.118',
    user = process.env.VPS_HOSTINGER_USER || 'root',
  } = options;

  const sshArgs = [
    '-o', 'BatchMode=yes',
    '-o', 'ConnectTimeout=10',
    '-o', 'StrictHostKeyChecking=accept-new',
  ];

  const sshCommand = `ssh ${sshArgs.join(' ')} ${user}@${host} "${command}"`;

  try {
    const { stdout, stderr } = await execAsync(sshCommand, { timeout });
    return { stdout: stdout.trim(), stderr: stderr.trim(), code: 0 };
  } catch (error) {
    return {
      stdout: error.stdout?.trim() || '',
      stderr: error.stderr?.trim() || error.message,
      code: error.code || 1,
    };
  }
}
```

## 5. Padrão de Tratamento de Erros

| Cenário | Código | Mensagem | Ação Recomendada |
|---------|--------|----------|-----------------|
| Host inacessível (timeout) | `ETIMEDOUT` | `VPS não respondeu em 10s` | Verificar se a VPS está online; checar firewall |
| Chave recusada | `EACCES` / exit 255 | `Permission denied (publickey)` | Verificar `authorized_keys` na VPS |
| Comando inválido | exit 127 | `command not found` | Confirmar que o binário existe na VPS |
| Comando falha | exit != 0 | stderr do comando | Analisar stderr; possivelmente prefixar com `docker exec` se o binário estiver em container |
| Fingerprint mudou | exit 255 | `REMOTE HOST IDENTIFICATION HAS CHANGED` | Possível ataque MITM; remover a entry antiga de `known_hosts` e revalidar manualmente |

**Regra de ouro:** Nunca expor stack traces brutos ao agente LLM. Sempre parsear o stderr e retornar uma mensagem acionável.

## 6. Considerações de Segurança

### 6.1 Escopo de Comandos Permitidos
- **Fase 1 (atual):** Root sem restrição — aceitável para prova de conceito.
- **Fase 2 (Story 4.3+):** Implementar whitelist de comandos via wrapper Bash na VPS.
- **Fase 3 (futuro):** Usuário dedicado `aiox` com sudo limitado por `/etc/sudoers.d/aiox`.

### 6.2 Auditoria de Chamadas
- Todo comando executado via `executeOnVps()` deve ser logado com: timestamp, comando, código de saída, duração.
- Logs salvos em `.aiox-core/local/ssh-audit.log` (gitignored).

### 6.3 Proteção de Credenciais
- Chaves privadas (`id_ed25519`, `id_rsa`) NUNCA no Git (protegido via `.gitignore`).
- Variáveis de ambiente sensíveis (`VPS_HOSTINGER_PASSWORD`) SOMENTE em `.env` (gitignored).
- Scripts NUNCA hardcodam senhas — apenas chaves SSH ou variáveis de ambiente.

### 6.4 VPS com Docker Swarm / Easypanel
- **NUNCA** executar `systemctl restart docker` — derruba todos os containers Easypanel.
- Para reiniciar serviços específicos: usar `docker service update --force <service>`.
- Para configurar env vars: usar o painel Easypanel ou a API tRPC, não manipular arquivos diretamente.

## 7. O Wrapper SSH (Módulo Padrão)
Um script modular que encapsula a lógica repetitiva `child_process.exec()` para retornar sempre Promise de `{ stdout, stderr, code }`. O script base definido na Story 4.1 (`vps-ssh-test.js`) evoluirá para um helper universal exportável.

## 8. Roadmap: De `child_process` para MCP Server

| Fase | Implementação | Story |
|------|--------------|-------|
| **Fase 1** (atual) | `child_process.exec()` com SSH nativo do SO | Story 4.1 |
| **Fase 2** | Módulo `ssh-executor.js` reutilizável com interface `executeOnVps()` | Story 4.3 |
| **Fase 3** | MCP Server dedicado (`@aiox/mcp-vps`) expondo tools formais via JSON-RPC | Post-Epic 4 |
| **Fase 4** | Multi-VPS support com registro dinâmico de hosts | Futuro |

A cada fase, a interface `executeOnVps()` permanece estável — apenas o transport muda por baixo.
