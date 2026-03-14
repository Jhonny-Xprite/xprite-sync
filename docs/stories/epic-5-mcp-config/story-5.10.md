# Story 5.10: AIOX Core Stack Implementation

## Status
- **Status:** Approved
- **Spec Status:** ✅ APPROVED
- **Executor:** `@dev`
- **Quality Gate:** `@architect`
- **Epic:** [Epic 5 — MCP-CONFIG](./epic.md)

## Story
**As a** Full Stack Developer, adulting for AIOX,
**I want** to implement the "Essential Stack" of MCPs recommended for advanced reasoning and coordination,
**so that** Orion and other agents have the correct tools for memory, sequential thinking, and web research.

## Acceptance Criteria
1. [x] **AI IQ Core:** `memory` (SQLite) e `sequential-thinking` totalmente configurados.
2. [x] **Intelligence Connectors:** `brave-search` e `fetch` integrados via Vault.
3. [x] **Automation Layer:** `puppeteer` e `github` MCPs implantados e autenticados.
4. [x] **Data Layer:** `postgresql` connector ativo para gestão de DB.
5. [x] **Essential Intel:** `fetch` e servidores de suporte registrados.
6. [x] **Discovery:** Todas as ferramentas respondem ao `mcp:registry`.

## 📐 Spec Pipeline Artifacts
> **Status:** COMPLETED ✅

| Artifact | Path | Details |
|----------|------|---------|
| Requirements | [requirements.json](../story-5.10/spec/requirements.json) | Intelligence Scope |
| Complexity | [complexity.json](../story-5.10/spec/complexity.json) | COMPLEX (22) |
| Research | [research.json](../story-5.10/spec/research.json) | 6-Server Patterns |
| Specification | [spec.md](../story-5.10/spec/spec.md) | Technical IQ Design |

## Tasks / Subtasks
- [x] **Task 1: AI Reasoning Foundation**
  - [x] Inicializar `memory-server` (sqlite3 + local path).
  - [x] Configurar `sequential-thinking-server` tools.
- [x] **Task 2: External Intelligence Stack**
  - [x] Build `brave-search` e configuração de secret no Vault.
  - [x] Setup `fetch` para leitura de documentação.
- [x] **Task 3: Workspace & Automation**
  - [x] Setup `github` MCP (Octokit + Vault).
  - [x] Setup `puppeteer` (Docker build - Chromium Heavy).
- [x] **Task 4: Registry & Gating**
  - [x] Atualizar `mcp-registry.json` com o stack completo (11 MCPs).
  - [x] Validar detecção via `npm run mcp:registry`.

## Instructions for Executor
> **Agent:** `@dev`
> **Mandatory:** Read [spec.md](../story-5.10/spec/spec.md) before starting.
- Implement the 6 core servers using the AIOX standard architecture.
- Verify each one with the JSON-RPC test suite before deployment.
