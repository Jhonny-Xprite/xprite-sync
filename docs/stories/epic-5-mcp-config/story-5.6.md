# Story 5.6: Secure Secret Vault

## Status
- **Status:** ✅ DONE
- **Executor:** `@dev`
- **Quality Gate:** `@architect`
- **Epic:** [Epic 5 — MCP-CONFIG](./epic.md)

## Story
**As a** Developer,
**I want** a secure and automated way to manage API keys for MCPs,
**so that** I can avoid manual edits in configuration files and prevent exposure of credentials.

## Acceptance Criteria
1. [x] Implementado `mcp-vault.js` com criptografia AES-256-CBC.
2. [x] Sistema de Master Key protegida (`master.key`) fora do versionamento.
3. [x] Injetor de segredos `mcp-config-injector.js` funcional.
4. [x] Integração no `package.json` para aplicação de chaves.

## 🤖 CodeRabbit Integration
**CodeRabbit Integration**: Disabled

## 📐 Spec Pipeline Artifacts
> **Status:** APPROVED (Critique Round 1) ✅
> - **Complexity:** STANDARD (Score: 14/25)
> - **Verdict:** APPROVED
> - **Generated:** 2026-03-14

| Artifact | Path | Details |
|----------|------|---------|
| Specification | [spec.md](./story-5.6/spec/spec.md) | Full technical design |
| Requirements | [requirements.json](./story-5.6/spec/requirements.json) | Functional requirements |
| Plan | [implementation.yaml](./story-5.6/spec/implementation.yaml) | Execution subtasks |

## Tasks / Subtasks
- [x] **Task 1: Desenvolver Gerenciador de Segredos**
  - [x] Implementar `mcp-vault.js` com criptografia AES.
- [x] **Task 2: Automação de Injeção**
  - [x] Implementar `mcp-config-injector.js` para injeção via `.env.production`.
- [x] **Task 3: Utilitário de Verificação**
  - [x] Criar comandos `--encrypt` e `--decrypt` no `mcp-vault.js`.

## Dev Notes
- **Bug Workaround:** Lembrar do bug do Docker MCP Secrets e garantir que o CLI edite o arquivo final (`docker-mcp.yaml`) no momento certo se o sistema nativo falhar.
- **Segurança:** Nunca imprimir o valor inteiro da chave nos logs.

## Testing
- [x] Configurar uma chave via CLI e verificar descriptografia.
- [x] Garantir que o segredo não é commitado (arquivos gerados em `.aiox/secrets`).

## Change Log
| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-03-14 | 1.0.0 | Initial draft creation | River (SM) |
