# Story 5.4: MCP Registry & Schema Validation

## Status
- **Status:** ✅ DONE
- **Executor:** `@dev`
- **Quality Gate:** `@qa`
- **Epic:** [Epic 5 — MCP-CONFIG](./epic.md)

## Story
**As a** Developer,
**I want** a centralized registry that scans and validates available MCPs,
**so that** the AIOX system can automatically discover new tools and ensure they follow the established schemas.

## Acceptance Criteria
1. [x] Script `mcp-registry.js` implementado com Ajv e js-yaml.
2. [x] Validação automática de `mcp-config.yaml` contra o schema oficial.
3. [x] Geração do arquivo `extensions/mcp-registry.json` consolidado.
4. [x] Comando `npm run mcp:registry` funcional e integrado ao root.

## 🤖 CodeRabbit Integration
**CodeRabbit Integration**: Disabled

## 📐 Spec Pipeline Artifacts
> **Status:** APPROVED (Critique Round 1) ✅
> - **Complexity:** STANDARD (Score: 11/25)
> - **Verdict:** APPROVED
> - **Generated:** 2026-03-14

| Artifact | Path | Details |
|----------|------|---------|
| Specification | [spec.md](./story-5.4/spec/spec.md) | Full technical design |
| Requirements | [requirements.json](./story-5.4/spec/requirements.json) | Functional requirements |
| Plan | [implementation.yaml](./story-5.4/spec/implementation.yaml) | Execution subtasks |

## Tasks / Subtasks
- [x] **Task 1: Desenvolver o Scanner de Diretórios**
  - [x] Implementar leitura recursiva e detecção de arquivos de configuração em `extensions/mcps/`.
- [x] **Task 2: Lógica de Validação**
  - [x] Integrar biblioteca de validação de schema (ajv).
  - [x] Validar URLs, comandos e argumentos.
- [x] **Task 3: Geração do Registro Central**
  - [x] Criar arquivo consolidado `extensions/mcp-registry.json` que mapeie Nomes -> Capacidades/IDs.

## Dev Notes
- **Referência:** Utilizar a lógica de busca do `.aiox-core/development/tasks/search-mcp.md`.
- **Interoperabilidade:** O registro deve ser legível por qualquer agente que precise consumir ferramentas.

## Testing
- [x] Criar um MCP propositalmente inválido e verificar se o `mcp:registry` barra a execução.
- [x] Verificar se novos MCPs aparecem no `mcp-registry.json` após a criação.

## Change Log
| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-03-14 | 1.0.0 | Initial draft creation | River (SM) |
