# Specification: Story 2.1 - Health-Check Environment Setup (Jest/Mocha)

**Date:** 2026-03-13
**Status:** APPROVED (Critique Round 1)
**Complexity:** Simple (Score: 7/20)

## Requirements Summary

Establish a modern test framework (Jest or Mocha) as the foundation for implementing health-check tests and a zero-regression stability gate for the AIOX framework.

## Functional Requirements

### FR-1: Test Framework Installation
- Install Jest (recommended) or Mocha + Chai
- Jest recommended for modern Node.js projects (zero-config)
- Node.js 18+ LTS required

### FR-2: Configuration Files
- Create `jest.config.js` (if Jest chosen)
- Or create `.mocharc.json` (if Mocha chosen)
- Configuration must support:
  - Test discovery in `tests/` or `__tests__/` directories
  - Clear test output with pass/fail results
  - Code coverage reporting (optional but recommended)

### FR-3: NPM Scripts
- Add `npm test` - executes test runner
- Add `npm run test:watch` - watch mode for development
- Add `npm run test:coverage` - coverage reporting
- Verify scripts work on Windows (WSL) and macOS

### FR-4: Test Directory Structure
- Create `tests/` or `__tests__/` directory
- Create `tests/health-check/` subdirectory (for Story 2.2)
- Create example test file to verify setup works

### FR-5: Documentation
- Update README.md with testing instructions
- Or create CONTRIBUTING.md with testing guidance
- Document framework choice and reasoning

## Non-Functional Requirements

### NFR-1: Performance
- Test runner startup: < 5 seconds
- Test execution (empty suite): < 2 seconds

### NFR-2: Compatibility
- Works on Windows (WSL bash)
- Works on macOS
- Node.js 18+ LTS support

### NFR-3: Developer Experience
- Clear error messages
- Minimal configuration needed
- Easy to extend with new tests

## Acceptance Criteria Mapping

| AC | Requirement | Implementation |
|----|------------|-----------------|
| AC1 | Jest or Mocha installed | `npm install` completes without errors |
| AC2 | Configuration files created | `jest.config.js` or `.mocharc.json` present and valid |
| AC3 | `npm test` executes | Running `npm test` launches test runner successfully |
| AC4 | Test directory structure | `tests/` and `tests/health-check/` directories exist |
| AC5 | Clear output and pass/fail | Test runner output shows test results clearly |

## Success Metrics

- All npm scripts executable without errors
- No hardcoded absolute paths in configuration
- Test framework installed with correct version (Jest >= 29.0.0 or Mocha >= 10.0.0)

## Dependencies

- None (foundation story)
- Node.js 18+ LTS
- npm 8.x or higher

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Jest version incompatibility | Use LTS stable version; test on target Node version |
| Configuration too complex | Start minimal; document all customizations |
| Path issues on Windows | Use relative paths; test on WSL |

## Related Stories

- Story 2.2: Porting Official Framework Health Tests (depends on this story)
- Story 2.3: Integration of Health-Gates in Pre-Commit (depends on 2.2)

---

**Complexity Score: 7/20 (Simple)**
- Scope: 1 (single framework to setup)
- Integration: 1 (no complex integrations)
- Infrastructure: 2 (npm + config files)
- Knowledge: 2 (standard Jest/Mocha setup)
- Risk: 1 (well-established frameworks, low risk)
