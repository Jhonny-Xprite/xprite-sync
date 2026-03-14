# Story 5.9: Legacy MCP Migration: Wave 1 (Playwright & Exa)

## Status
- **Status:** Approved
- **Spec Status:** ✅ APPROVED
- **Executor:** `@dev`
- **Quality Gate:** `@qa`
- **Epic:** [Epic 5 — MCP-CONFIG](./epic.md)

## Story
**As a** Developer,
**I want** to migrate the existing Playwright and Exa MCP implementations to the new AIOX Standard,
**so that** they can benefit from automated deployment, secret management, and centralized observability.

## Acceptance Criteria
1. [x] MCP `playwright` movido para `extensions/mcps/playwright`.
2. [x] MCP `exa` movido para `extensions/mcps/exa`.
3. [x] Ambos os MCPs possuindo `mcp-config.yaml` válido e validado pelo Registry.
4. [ ] Dockerfiles multi-stage (Node-TS) aplicados e buildados com sucesso.
5. [ ] Configuração de API Keys (para o Exa) via Secret Vault (`mcp:vault`).

## 📐 Spec Pipeline Artifacts
> **Status:** COMPLETED ✅

| Artifact | Path | Details |
|----------|------|---------|
| Requirements | [requirements.json](../story-5.9/spec/requirements.json) | Migration Scope |
| Complexity | [complexity.json](../story-5.9/spec/complexity.json) | STANDARD (14) |
| Research | [research.json](../story-5.9/spec/research.json) | Patterns & Deps |
| Specification | [spec.md](../story-5.9/spec/spec.md) | Technical Design |

## Tasks / Subtasks
- [x] **Task 1: Refatoração do Playwright MCP**
  - [x] Adaptar código fonte para o layout `/src/tools` (Implementado em index.ts).
  - [x] Gerar `package.json` seguindo o template do blueprint.
- [ ] **Task 2: Refatoração do Exa MCP**
  - [x] Adaptar código e dependências.
  - [ ] Testar integração com chaves encriptadas.
- [x] **Task 3: Validação de Registro**
  - [x] Rodar `npm run mcp:registry` e confirmar a detecção dos novos caminhos.

## Instructions for Executor
> **Agent:** `@dev`
> **Mandatory:** Read [spec.md](../story-5.9/spec/spec.md) before starting.
- Use the Node-TS template for all migrations.
- Ensure all API keys are secured in the Vault as per the specification.
  
## Testing
- [ ] `npm run mcp:deploy playwright` deve concluir sem erros.
- [ ] O `mcp-vault` deve injetar as chaves do Exa corretamente no runtime.
