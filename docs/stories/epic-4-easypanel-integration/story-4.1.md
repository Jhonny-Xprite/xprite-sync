# Story 4.1: Ponte SSH Base — AIOX Ganha Acesso à VPS

## Status
- **Status:** In Progress 🏃
- **Executor:** `@devops`
- **Quality Gate:** `@architect`
- **Epic:** [Epic 4 — VPS como Extensão Inteligente do AIOX](./epic.md)
- **PRD:** [epic-4-easypanel.md](../../prd/epic-4-easypanel.md)

## Story

**As a** AIOX Orchestrator (Orion),
**I want** to establish a secure, passwordless SSH bridge to the VPS (`root@92.112.176.118`),
**so that** the AIOX can execute any remote command on the VPS programmatically — as the first and foundational step to treating the VPS as an intelligent extension of itself.

> **Contexto:** Esta é a story fundacional do Epic 4. Sem a ponte SSH, nenhuma outra story é possível. O objetivo não é só "conectar" — é dar ao AIOX a sua primeira capacidade de *agir* remotamente, de forma autônoma, segura e rastreável.

## Acceptance Criteria

1. [ ] Chaves SSH ED25519 verificadas/geradas no ambiente local (`~/.ssh/id_ed25519` + `~/.ssh/id_ed25519.pub`).
2. [ ] Chave pública adicionada ao `authorized_keys` do root na VPS (`root@92.112.176.118`).
3. [ ] Script `vps-ssh-test.js` executa `ls -la /` na VPS e retorna saída sem nenhum prompt de senha.
4. [ ] Script `vps-ssh-test.js` trata falha de conexão com mensagem acionável (sem stack trace bruto).
5. [ ] Nenhuma chave privada ou arquivo sensível aparece em `git status` como untracked/modified.
6. [ ] Arquitetura de como o AIOX irá encapsular chamadas SSH em Tools futuras documentada em `mcp-ssh-architecture.md`.
7. [ ] Fingerprint da VPS salvo em `~/.ssh/known_hosts` (conexão não prompta após primeira autenticação).

## Tasks / Subtasks

- [ ] **Task 1 — Auditoria de Chaves SSH:**
  - Verificar se `~/.ssh/id_ed25519` existe no ambiente local.
  - Se não existir: `ssh-keygen -t ed25519 -C "aiox-core-vps" -f ~/.ssh/id_ed25519`
  - Documentar o caminho da chave encontrada/gerada para referência nos próximos scripts.

- [ ] **Task 2 — Autorizar Chave na VPS:**
  - Copiar `~/.ssh/id_ed25519.pub` para a VPS:
    ```bash
    ssh-copy-id -i ~/.ssh/id_ed25519.pub root@92.112.176.118
    # Se não disponível: ssh root@92.112.176.118 "cat >> ~/.ssh/authorized_keys" < ~/.ssh/id_ed25519.pub
    ```
  - Alternativa via Easypanel: Settings → SSH Keys → Add Public Key.

- [ ] **Task 3 — Validar Script vps-ssh-test.js:**
  - Executar: `node .aiox-core/infrastructure/scripts/vps-ssh-test.js`
  - Confirmar output: `✅ Sucesso! Resposta da VPS recebida` + listagem de `/`.
  - Confirmar que **não há prompt de senha** durante a execução.
  - Registrar output de sucesso no Change Log desta story.

- [ ] **Task 4 — Robustez do Script:**
  - Revisar `vps-ssh-test.js`: mensagem de erro deve ser clara e acionável (ex: sugerir `ssh-keygen`, verificar `authorized_keys`).
  - Mudar `StrictHostKeyChecking=no` para `StrictHostKeyChecking=accept-new` após primeira conexão bem-sucedida (mais seguro).
  - Adicionar timeout explícito e código de saída `1` em caso de falha.

- [ ] **Task 5 — Segurança Git:**
  - Verificar `.gitignore` na raiz do projeto. Confirmar cobertura de: `id_ed25519`, `id_rsa`, `*.pem`, `*.key`, `.env`.
  - Adicionar entradas ausentes se necessário.
  - Executar `git status` e confirmar zero arquivos sensíveis rastreados.

- [ ] **Task 6 — Arquitetura MCP (Documento Técnico):**
  - Criar `.aiox-core/infrastructure/docs/mcp-ssh-architecture.md` com:
    - Diagrama de como um Tool AIOX irá encapsular chamadas SSH
    - Interface proposta: `executeOnVps(command: string): Promise<{ stdout: string, stderr: string }>`
    - Padrão de tratamento de erros (timeouts, host inacessível, comando inválido)
    - Considerações de segurança (escopo de comandos permitidos, auditoria de chamadas)
    - Roadmap: de `child_process` para MCP Server dedicado em releases futuros

## Dev Notes

- **Script existente** em `.aiox-core/infrastructure/scripts/vps-ssh-test.js` — já implementado, precisa apenas ser validado e endurecido.
- **Parâmetros SSH críticos para automação:**
  - `BatchMode=yes` — nunca prompta (falha silenciosa se chave não funcionar)
  - `ConnectTimeout=10` — fail-fast (não travar por 60s+ em timeout)
  - `StrictHostKeyChecking=accept-new` — salva fingerprint na primeira conexão, rejeita mudanças futuras (anti-MITM)
- **Após esta story:** o módulo `ssh-executor.js` (Story 4.3) irá extrair a lógica de conexão SSH em um utilitário reutilizável. A Story 4.1 é a prova de conceito; a Story 4.3 é a versão production-ready.
- VPS: `srv832609.hstgr.cloud` → `92.112.176.118` — ambos devem funcionar como host.

## Spec Pipeline Artifacts
> **Status:** ✅ Completo — spec-pipeline aprovado @qa

| Artifact | Path |
|----------|------|
| Specification | [spec.md](./story-4.1/spec/spec.md) |
| Requirements | [requirements.json](./story-4.1/spec/requirements.json) |
| Critique | [critique.json](./story-4.1/spec/critique.json) |

## File List
- `.aiox-core/infrastructure/scripts/vps-ssh-test.js` *(existente — validar e endurecer)*
- `.aiox-core/infrastructure/docs/mcp-ssh-architecture.md` *(a criar — Task 6)*
- `.gitignore` *(validar e atualizar — Task 5)*

## Validation
- [ ] `node .aiox-core/infrastructure/scripts/vps-ssh-test.js` → `✅ Sucesso!` + listagem de `/` sem prompt
- [ ] `git status` → zero arquivos com chaves/credenciais rastreados
- [ ] `mcp-ssh-architecture.md` criado e aprovado por `@architect`
- [ ] Script falha gracefully com mensagem acionável (sem senha ou host inacessível)

## Change Log
| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-03-13 | 1.0.0 | Story draft inicial criado | @aiox-master |
| 2026-03-13 | 1.1.0 | Reescrita completa — alinhada à visão "VPS como extensão do AIOX"; tasks detalhadas; AC robustecidos | @aiox-master |
