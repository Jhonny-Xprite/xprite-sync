# Story 5.2: AIOX MCP CLI Generator

## Status
- **Status:** ✅ DONE
- **Executor:** `@dev`
- **Quality Gate:** `@architect`
- **Epic:** [Epic 5 — MCP-CONFIG](./epic.md)

## Story
**As a** Developer,
**I want** a CLI command to automatically generate the boilerplate for new MCP servers,
**so that** I can focus on building logic instead of setting up directory structures and configurations.

## Acceptance Criteria
1. [x] Comando `npm run mcp:create` funcional via `mcp-generator.js`.
2. [x] Scaffolding automático para Node-TS (incluindo `tsconfig.json`, `package.json`, `Dockerfile`).
3. [x] Scaffolding automático para Python (incluindo `requirements.txt`, `main.py`, `Dockerfile`).
4. [x] Injeção dinâmica de variáveis (`{{name}}`, `{{description}}`) nos templates.
5. [x] Configuração inicial de `mcp-config.yaml` preenchida com valores padrão.

## 🤖 CodeRabbit Integration
**CodeRabbit Integration**: Disabled

## 📐 Spec Pipeline Artifacts
> **Status:** APPROVED (Critique Round 1) ✅
> - **Complexity:** STANDARD (Score: 10/25)
> - **Verdict:** APPROVED
> - **Generated:** 2026-03-14

| Artifact | Path | Details |
|----------|------|---------|
| Specification | [spec.md](./story-5.2/spec/spec.md) | Full technical design |
| Requirements | [requirements.json](./story-5.2/spec/requirements.json) | Functional requirements |
| Plan | [implementation.yaml](./story-5.2/spec/implementation.yaml) | Execution subtasks |

## Tasks / Subtasks
- [x] **Task 1: Implementar Script de Scaffolding**
  - [x] Criar lógica de cópia de templates em `.aiox-core/templates/mcps/`.
  - [x] Implementar substituição dinâmica de variáveis (nome do MCP, descrição).
- [x] **Task 2: CLI Interface**
  - [x] Adicionar script ao `package.json` principal.
  - [x] Validar inputs (kebab-case).
- [x] **Task 3: Testar Fluxo de Criação**
  - [x] Gerar um MCP de teste e validar se o build Docker inicial funciona sem erros.

## Dev Notes
- **Reciclagem:** Basear a lógica na task `.aiox-core/development/tasks/add-mcp.md`.
- **Templates:** Criar os templates base em uma pasta organizada dentro do framework.

## Testing
- [x] Executar `npm run mcp:create test-mcp` e verificar a árvore de arquivos.
- [x] Verificar integridade do `package.json` gerado.

## Change Log
| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-03-14 | 1.0.0 | Initial draft creation | River (SM) |
