# Story 5.15: Visual Stress Test & Verification

## Status
- **Status:** Ready
- **Spec Status:** ✅ APPROVED
- **Executor:** `@qa`
- **Quality Gate:** `@architect`

## Story
**As a** QA Agent,
**I want** to execute a visual test battery that demonstrates the MCPs working in real-world scenarios (e.g., searching, navigating, and saving to memory),
**so that** the user can see the 100% functionality of the system.

## Acceptance Criteria
1. [ ] **[Teste 01] Instagram Intelligence:**
   - **MCP Playwright:** Navegar e extrair `stats`.
   - **MCP Sequential-Thinking:** Analisar se o perfil é "Ativo" ou "Influencer" baseado nos números.
   - **MCP Memory:** Salvar o veredito da análise.
2. [ ] **[Teste 02] Google Meet Orchestration:**
   - **MCP Playwright:** Criar reunião e capturar Link.
   - **MCP GitHub:** Criar uma Issue no repositório com o link da reunião (Simulando agendamento).
   - **MCP Memory:** Registrar o evento da reunião.
3. [ ] **[Teste 03] GitHub Discovery & Docs:**
   - **MCP Playwright:** Listar squads em `SynkraAI/aiox-squads`.
   - **MCP Context7:** Buscar documentação de "MCP" para explicar o que os squads fazem.
   - **MCP Sequential-Thinking:** Sintetizar a relação entre squads e MCPs.

## Tasks
- [ ] **Task 1: Detailed Scenario Scripting**
  - [ ] Refatorar scripts para usar injeção real via `Stdio` e logs decorados `[MCP: NAME] -> Request`.
- [ ] **Task 2: Multi-MCP Execution**
  - [ ] Rodar os fluxos encadeados.
- [ ] **Task 2: Visual Execution**
  - [ ] Rodar o script e capturar logs reais no console.
- [ ] **Task 3: Final Environment Approval**
  - [ ] Assinar o Quality Gate final do Epic 5.
