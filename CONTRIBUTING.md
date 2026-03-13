# Contributing to AIOX-CORE

This guide explains how to contribute to the AIOX-CORE project, including setting up your development environment and running tests.

## Development Environment

### Prerequisites

- Node.js 18.0.0 or higher
- npm 9.0.0 or higher

### Setup

```bash
npm install
```

## Testing

AIOX-CORE uses **Jest** as the test framework for comprehensive testing and validation.

### Running Tests

#### Execute all tests
```bash
npm test
```

#### Watch mode (re-run tests on file changes)
```bash
npm test:watch
```

#### Generate coverage report
```bash
npm test:coverage
```

### Test Framework Configuration

Jest is configured via `jest.config.js` at the project root. Key configuration:

- **Test location:** `tests/` directory
- **Test files:** Files matching `*.test.js` pattern
- **Environment:** Node.js
- **Coverage threshold:** 60% (can be adjusted in jest.config.js)

### Writing Tests

#### Test Structure
```javascript
describe('Feature Name', () => {
  it('should do something specific', () => {
    // Test code here
    expect(result).toBe(expectedValue);
  });
});
```

#### Directory Structure
- `tests/unit/` - Unit tests for isolated components
- `tests/integration/` - Integration tests for component interactions
- `tests/__fixtures__/` - Mock data and test fixtures

### Test Examples

See `tests/unit/sample.test.js` for a basic example of Jest tests.

## Code Quality

### Validation Scripts

```bash
# Validate project structure
npm run validate:structure

# Validate agent definitions
npm run validate:agents
```

### IDE Synchronization

```bash
# Sync IDE configurations
npm run sync:ide

# Check IDE sync status
npm run sync:ide:check
```

## Health Checks

Health checks are critical validations that ensure framework integrity. Once implemented, run:

```bash
npm run test:health-check
```

This command validates:
- Framework paths integrity
- Agent definitions validity
- Dependencies resolution
- Configuration consistency

## Git Workflow

Before committing, ensure:

1. ✅ All tests pass: `npm test`
2. ✅ Structure validation: `npm run validate:structure`
3. ✅ Agent validation: `npm run validate:agents`

## Reporting Issues

Found a bug or have a feature request? Please open an issue in the repository with:

- Clear description of the problem/feature
- Steps to reproduce (for bugs)
- Expected vs. actual behavior
- Your environment (Node.js version, OS)

## Questions?

Check the main [README.md](./README.md) for project overview and additional resources.

---

**Last Updated:** 2026-03-13
**Test Framework:** Jest v30.3.0
