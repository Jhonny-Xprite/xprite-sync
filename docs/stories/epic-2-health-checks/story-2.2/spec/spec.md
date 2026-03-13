# Specification: Story 2.2 - Porting Official Framework Health Tests

**Date:** 2026-03-13
**Status:** APPROVED (Critique Round 1)
**Complexity:** Standard (Score: 12/20)

## Requirements Summary

Port the official AIOX-CORE health-check test suite to establish a zero-regression stability gate, validating framework integrity across agent definitions, paths, dependencies, and configuration.

## Functional Requirements

### FR-1: Test Suite Porting
- Port agent definition validation tests
- Port framework path validation tests
- Port dependency resolution tests
- Port configuration integrity tests
- Adapt all paths to local brownfield structure

### FR-2: Test Implementation
- Create `tests/health-check/` directory structure
- Implement agent validation tests (12 agents, syntax, required fields)
- Implement path validation tests (critical .aiox-core/ dirs)
- Implement dependency validation tests (agent dependencies resolvable)
- Implement configuration validation tests (.aiox-core/core-config.yaml)
- Implement script execution tests (validate:agents, validate:structure)

### FR-3: Configuration & npm Scripts
- Create `tests/health-check/config.js` with test configuration
- Add npm script: `test:health-check`
- Ensure test execution in <30 seconds

### FR-4: Code Coverage
- Achieve ≥80% code coverage on framework code
- Generate coverage reports via jest/mocha

### FR-5: Documentation
- Create `tests/health-check/README.md` documenting test scenarios
- Document all assumptions about framework structure
- Include examples of expected test output

## Non-Functional Requirements

### NFR-1: Performance
- Full health check suite execution: < 30 seconds
- Memory usage: < 200MB
- No side effects (tests are idempotent)

### NFR-2: Reliability
- Tests fail fast on missing critical paths
- Tests work on Windows (WSL) and macOS
- No race conditions or flaky tests

### NFR-3: Maintainability
- Clear test naming convention
- Well-documented test scenarios
- Easy to extend with new checks

## Test Scope

| Area | Tests | Coverage |
|------|-------|----------|
| Agent Definitions | Validate 12 agents present, YAML syntax, required fields | Critical |
| Framework Paths | Verify .aiox-core/ structure completeness | Critical |
| Dependency Resolution | Check all dependencies resolvable | High |
| Configuration | Validate core-config.yaml structure | High |
| Script Execution | Test core validation scripts work | High |

## Success Metrics

- 100% test pass rate
- ≥80% code coverage
- < 30 second execution time
- Zero hardcoded absolute paths
- Cross-platform compatibility verified

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| False positives/negatives | Extensive testing on different environments |
| Path normalization issues | Use relative paths; test on Windows/macOS |
| Performance degradation | Profile test execution; optimize slow tests |

---

**Complexity Score: 12/20 (Standard)**
- Scope: 3 (multiple test areas)
- Integration: 3 (integrates with jest/mocha)
- Infrastructure: 3 (test configs, npm scripts)
- Knowledge: 2 (testing patterns)
- Risk: 1 (porting existing tests, well-understood)
