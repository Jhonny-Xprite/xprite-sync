# AIOX-CORE Story Index

Este documento centraliza o status de todos os Epics e User Stories do projeto, servindo como o histórico oficial do backlog.

## 📊 Resumo do Projeto
- **Total de Epics**: 5
- **Epics Completos**: 3 ✅ (60%)
- **Epics em Execução**: 2 🏗️ (Epic 3, Epic 5)
- **Total de Stories**: 25
- **Stories Completas (Done)**: 9 ✅
- **Status Geral**: 🟦 PROGRESSING — Infrastructure & VPS Ready; Dashboard & MCP Config Pending.

---

## 📂 Epic 5: MCP-CONFIG — Orquestrador de Ecossistemas MCP
**Goal**: Padronização e automação da criação de novos servidores MCP.
**Status**: 🏗️ PLANNING (PRD & Plan Ready)
**Execution Plan**: [execution-plan.yaml](./epic-5-mcp-config/execution-plan.yaml)

| Story ID | Title | Wave | Status | 
|----------|-------|------|--------|
| **5.0 - 5.7** | Audit, Standards, Scaffolding, Security & Pulse | 0-6 | ⏳ Pending |

---


## 📂 Epic 1: Asset Restoration & Operational Compliance
**Goal**: Restaurar 100% dos assets de infraestrutura ausentes.
**Status**: ✅ DONE
**Execution Plan**: [execution-plan.md](./epic-1-asset-restoration/execution-plan.md)

| Story ID | Title | Executor | Quality Gate | Status |
|----------|-------|----------|--------------|--------|
| [Story 1.1](./epic-1-asset-restoration/story-1.1.md) | Core Skill & Agent Checklist Restoration | @analyst | @pm | ✅ Done |
| [Story 1.2](./epic-1-asset-restoration/story-1.2.md) | Infrastructure Utility Script Porting | @dev | @architect | ✅ Done |
| [Story 1.3](./epic-1-asset-restoration/story-1.3.md) | Final Compliance Validation | @qa | @architect | ✅ Done |

---

## 📂 Epic 2: Stability Gate & Health Monitoring
**Goal**: Implementar suite de health-check para garantir regressão zero.
**Status**: ✅ DONE
**Execution Plan**: [execution-plan.md](./epic-2-health-checks/execution-plan.md)

| Story ID | Title | Executor | Quality Gate | Status |
|----------|-------|----------|--------------|--------|
| [Story 2.1](./epic-2-health-checks/story-2.1.md) | Health-Check Environment Setup (Jest/Mocha) | @devops | @architect | ✅ Done |
| [Story 2.2](./epic-2-health-checks/story-2.2.md) | Porting Official Framework Health Tests | @dev | @qa | ✅ Done |
| [Story 2.3](./epic-2-health-checks/story-2.3.md) | Integration of Health-Gates in Pre-Commit | @devops | @architect | ✅ Done |

---

## 📂 Epic 4: VPS como Extensão Inteligente do AIOX
**Goal**: Transformar a VPS em um braço operacional do AIOX (SSH + Ollama + Health).
**Status**: ✅ DONE (2026-03-14)
**Execution Plan**: [execution-plan.yaml](./epic-4-easypanel-integration/execution-plan.yaml)

| Story ID | Title | Executor | Quality Gate | Status |
|----------|-------|----------|--------------|--------|
| [Story 4.1](./epic-4-easypanel-integration/story-4.1.md) | Ponte SSH Base — AIOX Ganha Acesso à VPS | @devops | @architect | ✅ Done |
| [Story 4.2](./epic-4-easypanel-integration/story-4.2.md) | Gestão de Modelos & Resource Bridging (Ollama) | @devops | @architect | ✅ Done |
| [Story 4.3](./epic-4-easypanel-integration/story-4.3.md) | Consciência & Saúde da VPS (DevSecOps) | @devops | @architect | ✅ Done |

---

## 📂 Epic 3: Dashboard Integration with Real Project Data
**Goal**: Dashboard 100% funcional com dados reais do projeto (não stubs/demo).
**Status**: 🟡 READY FOR IMPLEMENTATION (All 8 stories drafted, 5-phase plan ready)
**PRD**: [Epic 3 Dashboard](../prd/epic-3-dashboard.md)
**Execution Plan**: [IMPLEMENTATION_PLAN.md](./epic-3-dashboard-integration/IMPLEMENTATION_PLAN.md)
**Stories**: 8 total (3.10–3.17) — All drafted and ready for dev

### Current Situation
- **2 API services are stubs** (EngineService, WorkflowsService) → returning hardcoded data
- **3 routes missing** (/api/agents, /api/squads, /api/analytics/*) → dashboard shows DEMO fallbacks
- **Supabase empty** → agent_metrics never receives real data
- **GitHub hardcoded wrong repo** → SynkraAI/aiox-core vs actual project
- **No .env files** → API cannot connect to Supabase
- **RLS blocked** → team_members table missing

### What Epic 3 Delivers
✅ All 19 API endpoints return real OR empty data (NEVER demo)
✅ Dashboard displays actual project stories (from docs/stories/)
✅ Real workflows from .aiox-core/development/workflows/
✅ 12 AIOX agents from .aiox-core/development/agents/
✅ Squads and MCPs from project registry
✅ GitHub commits from correct (configurable) repository
✅ System metrics flowing into Supabase
✅ Zero DEMO fallback data — only real data or "No data available"

| Story ID | Title | SP | Status |
|----------|-------|----|----|
| [3.10](./epic-3-dashboard-integration/3.10.story.md) | Agent Metrics Real-Time | 5-8 | 🟡 Ready for Draft |
| [3.11](./epic-3-dashboard-integration/3.11.story.md) | Stories & Squads Real Reading | 8-13 | 🟡 Ready for Draft |
| [3.12](./epic-3-dashboard-integration/3.12.story.md) | GitHub Integration | 5-8 | 🟡 Ready for Draft |
| [3.13](./epic-3-dashboard-integration/3.13.story.md) | Engine/Tasks/Workflows | 13-21 | 🟡 Ready for Draft |
| [3.14](./epic-3-dashboard-integration/3.14.story.md) | Hand-offs Monitoring | 5-8 | 🟡 Ready for Draft |
| [3.15](./epic-3-dashboard-integration/3.15.story.md) | Agent Memory Visualization | 8-13 | 🟡 Ready for Draft |
| [3.16](./epic-3-dashboard-integration/3.16.story.md) | Missing Analytics & Routes | 13-21 | 🟡 Ready for Draft |
| [3.17](./epic-3-dashboard-integration/3.17.story.md) | Complete Data Integration | 8-13 | 🟡 Ready for Draft |

**Total Epic 3 Effort**: ~80-100 story points across 8 stories
**Timeline**: 5 implementation phases + QA
**Blockers**: None (all planning complete, ready for Phase 0)

---

## 📅 Histórico de Sprints

### Sprint 1 (Completed)
- **Foco**: Restauração de base e conformidade técnica (Epics 1 & 2).

### Sprint 2 (Completed)
- **Foco**: Expansão para Infraestrutura Remota (Epic 4).

### Sprint 3 (Next)
- **Foco**: Visualização e Monitoramento (Epic 3).

---
*Última atualização: 2026-03-14 11:25 — Orion, AIOX Master 👑*
