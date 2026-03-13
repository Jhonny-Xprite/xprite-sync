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

## Git Pre-Commit Hooks

Pre-commit hooks automatically run health checks before each commit, preventing broken code from being committed to the repository.

### Setup

The first time you clone or work on this repository, install the pre-commit hooks:

```bash
./scripts/install-hooks.sh
```

This copies the hook scripts to `.git/hooks/` and makes them executable.

### How It Works

When you run `git commit`, the pre-commit hook:

1. Runs `npm run test:health-check` automatically
2. **If tests PASS**: Commit proceeds normally
3. **If tests FAIL**: Commit is **BLOCKED** with a helpful error message

### Pre-Commit Flow

```
git commit -m "message"
  ↓
.git/hooks/pre-commit (executes automatically)
  ↓
npm run test:health-check
  ↓
Tests pass? → Commit allowed → exit 0
Tests fail? → Commit blocked → exit 1
```

### Bypassing Pre-Commit (Not Recommended)

In rare cases, you may need to bypass the hook:

```bash
git commit --no-verify -m "message"
```

⚠️ **Only use `--no-verify` when:**
- You're debugging a flaky test
- You're on a temporary branch
- You plan to fix the failing tests immediately after
- You've notified the team

### Hook Output

When the hook runs, you'll see:

**✅ Success:**
```
╔════════════════════════════════════════════════════════════════╗
║        AIOX Framework Health-Check Pre-Commit Gate              ║
╚════════════════════════════════════════════════════════════════╝

Running health-check tests...
✅ All health checks PASSED
Commit is allowed to proceed.
```

**❌ Failure:**
```
╔════════════════════════════════════════════════════════════════╗
║        AIOX Framework Health-Check Pre-Commit Gate              ║
╚════════════════════════════════════════════════════════════════╝

Running health-check tests...
❌ Health checks FAILED
Commit is BLOCKED - Fix failing tests and try again.

To bypass this check (NOT recommended):
  git commit --no-verify
```

### Log File

All hook executions are logged to `.git/logs/health-check.log`:

```bash
cat .git/logs/health-check.log
```

Use this to debug failures or track when health checks were run.

### Troubleshooting

**Q: Hook doesn't run**
- Run `./scripts/install-hooks.sh` to install/reinstall
- Check permissions: `ls -la .git/hooks/pre-commit`

**Q: Permission denied when running hook**
- Make the hook executable: `chmod +x .git/hooks/pre-commit`

**Q: Hook is slow**
- Health checks should complete in <30 seconds
- Check `.git/logs/health-check.log` for timing details

**Q: I need to skip the hook temporarily**
- Use `git commit --no-verify` (but fix the issues afterwards!)

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
