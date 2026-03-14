# Story 5.0: Audit, Cleanup & Standardization (Docker & MCP Sanitation)

## Status
- **Status:** ✅ DONE
- **Executor:** `@devops`
- **Quality Gate:** `@architect`
- **Epic:** [Epic 5 — MCP-CONFIG](./epic.md)

## Story

**As a** DevOps Agent (@devops),
**I want** to audit the current Docker environment and MCP configurations,
**so that** I can remove unused/orphaned assets, standardize nomenclatures, and ensure that all existing MCPs are functional, secure, and properly documented.

> **Contexto:** O ambiente Docker atual possui diversas imagens `<none>`, volumes sem etiquetas e configurações de MCP espalhadas que o usuário não sabe se funcionam ou para que servem. Esta story limpa a "casa" antes de construirmos o novo ecossistema.

## Acceptance Criteria

1. [x] Inventário completo de imagens, containers e volumes Docker mapeado para suas respectivas funções.
2. [x] Todas as imagens `<none>` (dangling) removidas.
3. [x] Volumes órfãos (não utilizados) identificados e saneados.
4. [x] Configurações de MCP atuais em `~/.docker/mcp/` e `.claude/rules/mcp-usage.md` validadas (testar se cada um funciona).
5. [x] Padrão de nomenclatura inicial aplicado às imagens mantidas (ex: `mcp/{name}:stable`).
6. [x] Relatório de "Saúde de Extensões" gerado, listando o que está ok e o que foi removido.

## 📐 Spec Pipeline Artifacts
> **Status:** APPROVED (Critique Round 1) ✅
> - **Complexity:** SIMPLE (Score: 8/25)
> - **Verdict:** APPROVED
> - **Generated:** 2026-03-14

| Artifact | Path | Details |
|----------|------|---------|
| Specification | [spec.md](./story-5.0/spec/spec.md) | Full technical design |
| Requirements | [requirements.json](./story-5.0/spec/requirements.json) | Functional requirements |
| Plan | [implementation.yaml](./story-5.0/spec/implementation.yaml) | Execution subtasks |


## Tasks / Subtasks

- [x] **Task 1 — Auditoria Profunda de Docker:**
  - [x] Listar todos os containers (ativos e parados): `docker ps -a`.
  - [x] Listar todas as imagens com detalhes de criação: `docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.ID}}\t{{.CreatedAt}}"`.
  - [x] Listar todos os volumes: `docker volume ls`.
  - [x] Mapear o volume `supabase_edge_runtime` e confirmar sua necessidade para o Epic 3.

- [x] **Task 2 — Saneamento do Ambiente (Cleanup):**
  - [x] Remover imagens órfãs: `docker image prune -f`.
  - [x] Remover volumes não utilizados: `docker volume prune -f`.
  - [x] Remover containers parados que não possuem persistência relevante.

- [x] **Task 3 — Validação de MCPs Atuais:**
  - [x] Testar `playwright` via CLI/utilitário.
  - [x] Testar `exa`, `context7` e `apify` via `docker-gateway`.
  - [x] Verificar se os tokens em `~/.docker/mcp/catalogs/docker-mcp.yaml` ainda são válidos.

- [x] **Task 4 — Padronização de Nomenclaturas:**
  - [x] Renomear/Tagar imagens `mcp/*` que estão com `<none>` para um padrão rastreável.
  - [x] Documentar a versão atual de cada servidor MCP em uso.

- [x] **Task 5 — Consolidação de Documentação:**
  - [x] Atualizar `.claude/rules/mcp-usage.md` removendo o que for obsoleto.
  - [x] Criar arquivo `docs/infrastructure/mcp-inventory.md` com o estado real após a limpeza.

## Dev Notes

- **Atenção:** Cuidado ao remover volumes do Supabase se houver dados de teste importantes para o Epic 3.
- **Docker MCP Secrets Bug:** Durante a validação, confirmar se o workaround do workaround (edição direta do yaml) ainda é o padrão necessário.
- **Imagens `<none>`:** Geralmente são builds intermediários ou versões antigas que perderam o marcador após um novo build. Elas ocupam muito espaço (vimos IDs de 1.4GB a 1.9GB).

## Validation
- [x] `docker images` não mostra nenhuma imagem `<none>`.
- [x] `docker volume ls` mostra apenas volumes reconhecidos e necessários.
- [x] Todos os MCPs listados em `mcp-inventory.md` foram auditados.
