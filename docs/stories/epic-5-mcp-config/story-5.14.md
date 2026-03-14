# Story 5.14: Context7 Integration

## Status
- **Status:** In Progress
- **Spec Status:** ✅ APPROVED
- **Executor:** `@dev`
- **Quality Gate:** `@architect`

## Story
**As a** Developer,
**I want** to integrate the Context7 MCP into the AIOX Core Stack,
**so that** agents can read up-to-date documentation for any library or framework.

## Acceptance Criteria
1. [x] **Implementation:** Servidor `aiox-context7` criado e registrado.
2. [x] **Tools:** Implementado `get-library-docs` e `resolve-library-id`.
3. [ ] **Registry:** Adicionado ao `mcp-registry.json`.

## Tasks
- [x] **Task 1: MCP Generation**
  - [x] Rodar `mcp:create` para context7.
- [x] **Task 2: Coding tools**
  - [x] Implementar handlers no `src/index.ts`.
- [ ] **Task 3: Production Build**
  - [ ] Finalizar build e registro.
