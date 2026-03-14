# Story 5.8: Deep Audit: VPS & Local Assets

## Status
- **Status:** Approved
- **Spec Status:** ✅ APPROVED
- **Executor:** `@devops`
- **Quality Gate:** `@architect`
- **Epic:** [Epic 5 — MCP-CONFIG](./epic.md)

## Story
**As a** DevOps Engineer,
**I want** to perform a deep technical audit of both local Docker Desktop and VPS infrastructure,
**so that** I can identify non-functional MCPs, orphaned images, and bloated configurations (like the 500KB catalog) to prune the system.

## Acceptance Criteria
1. [x] Inventário local de imagens e caminhos `~/.docker/mcp/` auditado.
2. [x] Relatório `docs/infrastructure/vps-audit-report.md` com status real de containers e volumes na Hostinger.
3. [x] Identificação de MCPs no catálogo `docker-mcp.yaml` que estão sem chaves ou mal configurados.
4. [x] Mapeamento de containers "Zombie" (rodando sem função ou falhando silenciados).
5. [x] Lista de exclusão aprovada pelo usuário para limpeza física (Task 5.0 complementar).

## 📐 Spec Pipeline Artifacts
> **Status:** COMPLETED ✅

| Artifact | Path | Details |
|----------|------|---------|
| Requirements | [requirements.json](../story-5.8/spec/requirements.json) | Audit objectives |
| Complexity | [complexity.json](../story-5.8/spec/complexity.json) | STANDARD (12) |
| Specification | [spec.md](../story-5.8/spec/spec.md) | Audit plan |

## Tasks / Subtasks
- [x] **Task 1: Auditoria VPS (SSH)**
  - [x] Mapear todos os volumes EA e containers Easypanel.
  - [x] Identificar databases ociosos.
- [x] **Task 2: Auditoria Local (Docker Desktop)**
  - [x] Analisar imagens `<none>` e seu impacto em disco (GBs).
  - [x] Validar o arquivo `secrets.env` local para ver redundâncias.
- [x] **Task 3: Consolidação de Governança**
  - [x] Criar arquivo de recomendações "Keep/Remove" (vps-audit-report.md).

## Instructions for Executor
> **Agent:** `@devops`
> **Mandatory:** Read [spec.md](../story-5.8/spec/spec.md) before starting.
- All scan commands must be cross-referenced with the technical approach defined in the spec.
- Generate the final report in `docs/infrastructure/vps-audit-report.md`.
