# Story 2.2: Porting Official Framework Health Tests

## Status
- **Status**: Draft
- **Executor**: @dev
- **Quality Gate**: @qa

## Story
**As a** Developer,
**I want** to port the official AIOX-CORE health-check test suite to our project,
**so that** we can validate framework integrity and ensure zero regressions in core agentic systems.

## Acceptance Criteria
1. [ ] Health-check test suite ported to `tests/health-check/`.
2. [ ] All tests adapted to local brownfield environment (paths normalized).
3. [ ] 100% of core framework paths validated by tests.
4. [ ] All health tests passing (`npm run test:health-check` returns 0 failures).
5. [ ] Test coverage includes agent validation, path checks, and dependency resolution.

## 🤖 CodeRabbit Integration
> **CodeRabbit Integration**: Disabled
>
> CodeRabbit CLI is not enabled in `core-config.yaml`.
> Quality validation will use manual review process only.

## Tasks / Subtasks
- [ ] Identify core framework health checks in official AIOX-CORE repo.
- [ ] Port agent definition validation tests.
- [ ] Port framework path validation tests.
- [ ] Port dependency resolution tests.
- [ ] Adapt all paths to local brownfield structure (relative paths).
- [ ] Create test configuration file (`tests/health-check/config.js`).
- [ ] Add npm script: `test:health-check`.
- [ ] Achieve ≥80% code coverage on framework code.
- [ ] Document test scenarios in `tests/health-check/README.md`.

## 📐 Spec Pipeline Artifacts
> **Status:** To be generated during implementation

| Artifact | Path |
|----------|------|
| Specification | [spec.md](./story-2.2/spec/spec.md) |
| Requirements | [requirements.json](./story-2.2/spec/requirements.json) |
| Critique | [critique.json](./story-2.2/spec/critique.json) |

## Dev Notes
- Health checks must be idempotent (no side effects)
- Tests should fail fast if any critical path is missing
- Consider parallel test execution for performance
- Mock file system only if necessary; prefer real file checks when possible
- Document all assumptions about framework structure

## Test Scope
1. **Agent Definitions** - Validate all 12 agents present and correctly defined
2. **Framework Paths** - Verify critical `.aiox-core/` directories exist
3. **Dependency Resolution** - Check agent dependencies are resolvable
4. **Configuration** - Validate `.aiox-core/core-config.yaml` structure
5. **Scripts** - Test that core scripts (validate:agents, validate:structure) execute

## File List
- `tests/health-check/` (new directory)
- `tests/health-check/agent-validation.test.js`
- `tests/health-check/path-validation.test.js`
- `tests/health-check/dependency-validation.test.js`
- `tests/health-check/config-validation.test.js`
- `tests/health-check/README.md`
- `package.json` (updated with test:health-check script)

## Validation
- [ ] All tests passing without warnings
- [ ] Code coverage ≥80%
- [ ] Tests run in <30 seconds
- [ ] No hardcoded paths (all relative)
- [ ] Tests work on Windows (WSL) and macOS

## Change Log
| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-03-13 | 1.0.0 | Story created and approved for implementation | @pm |
