# Story 5.7: Path Translation Layer

## Status
- **Status:** ✅ DONE
- **Executor:** `@architect`
- **Quality Gate:** `@dev`
- **Epic:** [Epic 5 — MCP-CONFIG](./epic.md)

## Story
**As an** Architect,
**I want** to implement a path translation layer between the Windows Host and the Linux-based Docker containers,
**so that** file system operations in MCPs work correctly regardless of the host OS.

## Acceptance Criteria
1. [x] Módulo `path-resolver.ts` implementado com suporte a D:\ e C:\.
2. [x] Middleware `mcp-gateway-middleware.js` centralizado para interceptar chamadas.
3. [x] Tradução automática de caminhos em payloads JSON-RPC.
4. [x] Normalização de separadores de caminho (backslash para slash).

## 🤖 CodeRabbit Integration
**CodeRabbit Integration**: Disabled

## 📐 Spec Pipeline Artifacts
> **Status:** APPROVED (Critique Round 1) ✅
> - **Complexity:** STANDARD (Score: 12/25)
> - **Verdict:** APPROVED
> - **Generated:** 2026-03-14

| Artifact | Path | Details |
|----------|------|---------|
| Specification | [spec.md](./story-5.7/spec/spec.md) | Full technical design |
| Requirements | [requirements.json](./story-5.7/spec/requirements.json) | Functional requirements |
| Plan | [implementation.yaml](./story-5.7/spec/implementation.yaml) | Execution subtasks |

## Tasks / Subtasks
- [x] **Task 1: Definir Regras de Mapeamento**
  - [x] Especificar mapeamento de drives Windows para `/data/` no container.
- [x] **Task 2: Implementar Utilitário de Path Resolver**
  - [x] Desenvolver módulo `path-resolver.ts`.
- [x] **Task 3: Integração com Gateway**
  - [x] Implementar `mcp-gateway-middleware.js` para interceptação automática.

## Dev Notes
- **Contexto:** Essencial para ferramentas como `fs` ou `puppeteer` que precisam acessar arquivos locais via Docker.
- **Ambiente:** Testar especificamente o drive `D:` usado no projeto atual.

## Testing
- [x] Validar conversão de caminhos `D:\` para `/data/`.
- [x] Verificar normalização de separadores.

## Change Log
| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-03-14 | 1.0.0 | Initial draft creation | River (SM) |
