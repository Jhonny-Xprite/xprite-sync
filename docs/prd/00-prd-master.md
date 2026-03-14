# AIOX-CORE Stabilization PRD

## 01. Global Objective
🎯 Stabilize the AIOX-CORE framework by establishing a clear documentation layer, restoring automated validation gates, and aligning local assets with the official v5.0.3 repository standards.

## 02. Requirements (Simplified)
📋
1. **Validation**: Framework MUST validate its own structure (`npm run validate:structure`) and agent integrity (`npm run validate:agents`).
2. **Guidance**: All agents MUST use the `docs/` folder as the absolute source of truth.
3. **Health Checks**: Implement the official triple-layered testing strategy (Jest/Mocha/Gates).
4. **Asset Integrity**: Resolve 100% of the "Missing Dependency" warnings identified in research (121 missing assets).

## 03. Research Benchmarks (Alignment v5.0.3)
📊
| Feature | Target State | Logic |
|---------|--------------|-------|
| Test Layer | Jest + Mocha | Unit/Integration + Health Checks |
| Assets | 120+ checklists/scripts | Restore from official clone as needed |
| Automation | Husky + Lint-staged | Restore to package.json |

---

## 04. Execution Roadmap (Step-by-Step)
🚀

### Phase 1: Infrastructure Foundations
**Step 1.1: Restore Validation Scripts [x]**
- Task: Add missing `validate:structure` and `validate:agents` to `.aiox-core/package.json`.
- Goal: Enable automated integrity checks.

### Phase 2: Knowledge Layer Alignment
**Step 2.1: Synchronize Root Files [x]**
- Task: Update root `README.md` and `AGENTS.md`.
- Goal: Ensure consistency across all entry points.

### Phase 3: Asset & Testing Restoration (Epic 1)
**Step 3.1: Import Missing Checklists & Scripts**
- Task: Selectively restore the 121 missing assets identified during research.
- Goal: Provide agents with complete operational guidelines.

### Phase 4: Stability Guarding (Epic 2) [x]
**Step 4.1: Implement Health-Check Suite**
- Task: Port official `tests/health-check` logic to ensure continuous framework stability.
- Goal: Zero-regression environment.

### Phase 5: Remote Infrastructure (Epic 4) [x]
**Step 5.1: VPS Intelligence Bridge**
- Task: SSH, Ollama management, and VPS health monitoring.
- Goal: VPS as an operational arm.

### Phase 6: Real-time Dashboard (Epic 3) [🏗️]
**Step 6.1: Synkra AIOX Integration**
- Task: Real-time monitoring UI, caching, and tracing.
- Goal: Full observability.

### Phase 7: MCP Ecosystem Configuration (Epic 5) [🏗️]
**Step 7.1: MCP Automation & Standards**
- Task: MCP Blueprint, Scaffolding CLI, and Docker Orchestration.
- Goal: Scalable extension system.


