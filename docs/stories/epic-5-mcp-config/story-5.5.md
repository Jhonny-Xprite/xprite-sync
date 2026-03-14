# Story 5.5: MCP Observability & Pulse

## Status
- **Status:** ✅ DONE
- **Executor:** `@devops`
- **Quality Gate:** `@qa`
- **Epic:** [Epic 5 — MCP-CONFIG](./epic.md)

## Story
**As a** DevOps Agent,
**I want** to monitor the state and usage of MCP servers,
**so that** I can ensure system reliability, track performance, and identify failed tools automatically.

## Acceptance Criteria
1. [x] Implementação do `mcp-pulse-core.js` para coleta de status Docker.
2. [x] Dashboard CLI `mcp-pulse-ui.js` funcional.
3. [x] Filtro automático para containers com prefixo `mcp-`.
4. [x] Integração no `package.json` raiz via `npm run mcp:pulse`.

## 🤖 CodeRabbit Integration
**CodeRabbit Integration**: Disabled

## 📐 Spec Pipeline Artifacts
> **Status:** APPROVED (Critique Round 1) ✅
> - **Complexity:** STANDARD (Score: 12/25)
> - **Verdict:** APPROVED
> - **Generated:** 2026-03-14

| Artifact | Path | Details |
|----------|------|---------|
| Specification | [spec.md](./story-5.5/spec/spec.md) | Full technical design |
| Requirements | [requirements.json](./story-5.5/spec/requirements.json) | Functional requirements |
| Plan | [implementation.yaml](./story-5.5/spec/implementation.yaml) | Execution subtasks |

## Tasks / Subtasks
- [x] **Task 1: Camada de Logging**
  - [x] Implementar coleta de status Docker em `mcp-pulse-core.js`.
- [x] **Task 2: Script de Monitoramento**
  - [x] Criar lógica de health check baseado em containers Docker.
- [x] **Task 3: Relatórios de Saúde**
  - [x] Integrar resultados ao painel CLI `mcp-pulse-ui.js`.

## Dev Notes
- **Performance:** O logging não deve adicionar latência significativa às chamadas de ferramentas.
- **Integração:** Usar os dados do registro (Story 5.4) como base para a lista de monitoramento.

## Testing
- [x] Verificar se o `mcp:pulse` detecta o status dos containers.
- [x] Validar dashboard CLI formatado.

## Change Log
| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-03-14 | 1.0.0 | Initial draft creation | River (SM) |
