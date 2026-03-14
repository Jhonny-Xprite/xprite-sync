# Story 5.1: AIOX MCP Blueprint & Standards

## Status
- **Status:** ✅ DONE
- **Executor:** `@architect`
- **Quality Gate:** `@qa`
- **Epic:** [Epic 5 — MCP-CONFIG](./epic.md)

## Story
**As an** Architect,
**I want** to define the standard metadata schemas, directory structures, and naming conventions for AIOX-native MCPs,
**so that** we have a consistent and modular ecosystem that clones the excellence of SynkraAI's patterns.

## Acceptance Criteria
1. [x] Estrutura de diretórios padrão definida (`/extensions/mcps/{name}`).
2. [x] Schema JSON para `mcp-config.yaml` criado e validado.
3. [x] Convenções de nomenclatura (`kebab-case`, `snake_case`) estabelecidas.
4. [x] Templates base (Node/TS e Python) criados em `.aiox-core/templates/mcps/`.
5. [x] Padrão de build Docker multi-stage definido nos templates.

## 🤖 CodeRabbit Integration
**CodeRabbit Integration**: Disabled

## 📐 Spec Pipeline Artifacts
> **Status:** APPROVED (Critique Round 1) ✅
> - **Complexity:** STANDARD (Score: 12/25)
> - **Verdict:** APPROVED
> - **Generated:** 2026-03-14

| Artifact | Path | Details |
|----------|------|---------|
| Specification | [spec.md](./story-5.1/spec/spec.md) | Full technical design |
| Requirements | [requirements.json](./story-5.1/spec/requirements.json) | Functional requirements |
| Plan | [implementation.yaml](./story-5.1/spec/implementation.yaml) | Execution subtasks |

## Tasks / Subtasks
- [x] **Task 1: Definir Estrutura de Diretórios**
  - [x] Mapear pastas `/src/tools`, `/src/resources`, `/src/prompts`.
  - [x] Definir localização de testes e Dockerfile.
- [x] **Task 2: Especificar Metadata Schema**
  - [x] Criar draft do `mcp-config.schema.json`.
  - [x] Garantir campos como `features`, `runtime`, `dependencies` e `api_keys_required`.
- [x] **Task 3: Guia de Boas Práticas**
  - [x] Documentar padrão de retorno de erro (JSON-RPC).
  - [x] Definir limites de memória e timeout recomendados por preset.

## Dev Notes
- **Referência:** Utilizar arquivos em `repositories/external/mcp-ecosystem/servers/` como base.
- **Conformidade:** O blueprint deve viabilizar a automação da Story 5.2.

## Testing
- [x] Validar o schema contra os JSONs existentes da SynkraAI.
- [x] Revisão técnica do Architect para garantir escalabilidade.

## Change Log
| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-03-14 | 1.0.0 | Initial draft creation | River (SM) |
