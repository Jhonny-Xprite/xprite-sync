# PRD - Epic 4: Easypanel VPS & Infrastructure Orchestration

**Status:** 🏗️ Aprovado
**Autor:** @architect via @aiox-master

---

## 1. Visão Geral e Objetivos

Evoluir o AIOX-CORE para atuar como **Orquestrador de Plataforma**. Este épico estabelece um túnel seguro entre o ambiente local do AIOX e a VPS (gerenciada via Easypanel), permitindo:

1. Gerenciamento remoto via SSH.
2. Resource Bridging: Exposição do Ollama ↔ Obsidian.
3. Automação DevSecOps.

### 1.1. Especificações do Ambiente Alvo (VPS)

Para garantir orquestração otimizada:

- **IP / Host:** `92.112.176.118` (`srv832609.hstgr.cloud`)
- **OS:** Ubuntu 24.04 com Easypanel
- **Hardware:** 2 Núcleos CPU, 8 GB RAM, 100 GB Disco.
- **Acesso Nativo:** Usuário `root` via SSH.

---

## 2. Arquitetura de Solução

### 2.1. Camada de Controle (A Ponte)

- **Controle de SO (SSH Nativo):** MCP Server configurado como Client SSH com chaves (ED25519) operando na pasta `aios-core`.
- **Controle de Infraestrutura:** Token de API restrito do Easypanel para saúde de containers.

### 2.2. Resource Bridging & Model Strategy (Ollama ↔ Obsidian)

- O AIOX desinstalará modelos pesados antigos na VPS e fará pull restrito da **Família Qwen (0.8B, 2B, 4B)**.
- A variável `OLLAMA_KEEP_ALIVE=5m` será aplicada para poupar os 8GB de RAM.
- Túnel Cloudflare provisionado internamente garantirá HTTPS + Token pro Obsidian.

---

## 3. Requisitos Não-Funcionais (NFRs)

- **Zero Trust:** Nenhuma porta do Ollama exposta diretamente na rede pública.
- **Resiliência:** Tratamento de erros caso o SSH sofra timeout.
