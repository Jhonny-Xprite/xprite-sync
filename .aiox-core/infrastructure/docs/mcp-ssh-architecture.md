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
    B -->|Invokes: executeSsh(cmd)| C(SSH Executor - JS)
    C -->|Instancia child_process: ssh -o BatchMode=yes ...| D[Terminal do Host (Windows)]
    D -->|ED25519 Handshake| E[VPS: 92.112.176.118]
    E -.->|Stdout: 'Mem: 12GB Free'| C
    C -.->|Retorno parseado da Tool| A
```

## 4. O Wrapper SSH (Módulo Padrão)
Um script modular que encapsula a lógica repetitiva `child_process.exec()` para retornar sempre Promise de `{ stdout, stderr, code }`. O script base definido na Story 4.1 (`vps-ssh-test.js`) evoluirá para um helper universal exportável.

## 5. Próximos Passos
Na Story 4.3, este wrapper se tornará o gateway para injetar scripts Bash "DevSecOps" pesados (Health Checks de discos, Ollama Service Check, Uptime) sem necessitar que o LLM digite comandos complexos manualmente.
