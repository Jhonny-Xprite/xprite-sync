# Story 2.1: Health-Check Environment Setup (Jest/Mocha)

## Status
- **Status**: Draft
- **Executor**: @devops
- **Quality Gate**: @architect

## Story
**As a** DevOps Engineer,
**I want** to set up a modern test framework (Jest or Mocha) for the project,
**so that** we can establish a foundation for implementing health-check tests and a zero-regression stability gate.

## Acceptance Criteria
1. [ ] Jest or Mocha installed and configured correctly.
2. [ ] Test configuration files created (jest.config.js or .mocharc.json).
3. [ ] `npm test` command executes test runner successfully.
4. [ ] Basic test file structure created (tests/ or __tests__/ directory).
5. [ ] Test runner produces clear output with pass/fail results.

## 🤖 CodeRabbit Integration
> **CodeRabbit Integration**: Disabled
>
> CodeRabbit CLI is not enabled in `core-config.yaml`.
> Quality validation will use manual review process only.

## Tasks / Subtasks
- [ ] Choose test framework (Jest recommended for Node.js projects).
- [ ] Install dependencies (jest or mocha + chai).
- [ ] Create configuration file with sensible defaults.
- [ ] Set up test directory structure.
- [ ] Add npm scripts: `test`, `test:watch`, `test:coverage`.
- [ ] Verify test runner executes without errors.
- [ ] Document configuration in project README or CONTRIBUTING guide.

## 📐 Spec Pipeline Artifacts
> **Status:** To be generated during implementation

| Artifact | Path |
|----------|------|
| Specification | [spec.md](./story-2.1/spec/spec.md) |
| Requirements | [requirements.json](./story-2.1/spec/requirements.json) |
| Critique | [critique.json](./story-2.1/spec/critique.json) |

## Dev Notes
- Jest is modern and zero-config friendly; Mocha requires more setup
- Consider code coverage reporting via nyc or jest built-in coverage
- Node.js 18+ LTS recommended for best compatibility
- Configuration must work in both Windows (WSL) and macOS environments

## File List
- `jest.config.js` or `.mocharc.json`
- `tests/` or `__tests__/` directory structure
- `package.json` (updated scripts section)
- `README.md` or `CONTRIBUTING.md` (testing instructions added)

## Validation
- [ ] `npm test` runs without errors
- [ ] Test output is clear and actionable
- [ ] Configuration is properly documented
- [ ] No hardcoded paths (use relative paths only)

## Change Log
| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-03-13 | 1.0.0 | Story created and approved for implementation | @pm |
