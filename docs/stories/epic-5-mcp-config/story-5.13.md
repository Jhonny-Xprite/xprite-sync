# Story 5.13: Feature Parity Expansion (Brave & Playwright)

## Status
- **Status:** In Progress
- **Spec Status:** ✅ APPROVED
- **Executor:** `@dev`
- **Quality Gate:** `@architect`

## Story
**As a** Developer,
**I want** to expand the local AIOX implementations of Brave Search and Playwright,
**so that** they match the full feature set of the official MCP Toolkit (22+ tools for Playwright, 6+ for Brave).

## Acceptance Criteria
1. [x] **Playwright Expansion:** Implementado `fill`, `press`, `evaluate`, `get_content`.
2. [ ] **Brave Expansion:** Implementado `local_search`, `image_search`.
3. [ ] **Self-Documentation:** Todos os schemas de input devem estar rigorosamente tipados.

## Tasks
- [x] **Task 1: Playwright Core Tools**
  - [x] Adicionar `browser_fill`, `browser_press`, `browser_evaluate`.
- [ ] **Task 2: Brave Advanced Tools**
  - [x] Adicionar `brave_local_search`, `brave_image_search`.
- [ ] **Task 3: Validation Build**
  - [ ] Rodar `npm run build` em ambos e validar no registry.
