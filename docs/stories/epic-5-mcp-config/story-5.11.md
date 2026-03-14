# Story 5.11: Universal Gates & Final Stabilization

## Status
- **Status:** Approved
- **Spec Status:** ✅ APPROVED
- **Executor:** `@qa`
- **Quality Gate:** `@architect`
- **Epic:** [Epic 5 — MCP-CONFIG](./epic.md)

## Story
**As a** QA Agent,
**I want** to execute a full integration test sweep across all MCPs and perform the final system pruning,
**so that** the AIOX environment is 100% functional, lean, and free of legacy baggage.

## Acceptance Criteria
1. [x] Execução física do `prune` aprovado na Story 5.8 (Remoção de imagens, volumes e configs inúteis).
2. [x] Validação JSON-RPC completa: Todas as `tools` registradas.
3. [x] Todos os MCPs rodando com padrões AIOX (Lite/Standard/Heavy).
4. [x] Secrets migration completa: Nenhuma chave em texto plano.

## 📐 Spec Pipeline Artifacts
> **Status:** COMPLETED ✅

| Artifact | Path | Details |
|----------|------|---------|
| Requirements | [requirements.json](../story-5.11/spec/requirements.json) | Final Prune Scope |
| Complexity | [complexity.json](../story-5.11/spec/complexity.json) | STANDARD (10) |
| Specification | [spec.md](../story-5.11/spec/spec.md) | Stabilization Plan |

## Tasks / Subtasks
- [x] **Task 1: Final Cleanup (Ação Física)**
  - [x] Remover Assets Docker identificados como obsoletos.
  - [x] Saneamento do arquivo `docker-mcp.yaml` local.
- [x] **Task 2: Sweep de Testes JSON-RPC**
  - [x] Registro e validação via `mcp:registry`.
- [x] **Task 3: Otimização de Recursos**
  - [x] Aplicar padrões de imagem (Base Node-Slim / Playwright-Jammy).

## Instructions for Executor
> **Agent:** `@qa`
> **Mandatory:** Read [spec.md](../story-5.11/spec/spec.md) before starting.
- All stabilization gates MUST pass with zero critical errors.
- Final report must consolidate both VPS and Local health status.
