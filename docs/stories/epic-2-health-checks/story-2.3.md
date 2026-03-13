# Story 2.3: Integration of Health-Gates in Pre-Commit

## Status
- **Status**: Draft
- **Executor**: @devops
- **Quality Gate**: @architect

## Story
**As a** DevOps Engineer,
**I want** to integrate health-check tests into Git pre-commit hooks,
**so that** developers cannot commit code that fails framework health validations, ensuring a zero-regression stability gate.

## Acceptance Criteria
1. [ ] Pre-commit hook created in `.git/hooks/pre-commit`.
2. [ ] Hook executes health-check tests before allowing commits.
3. [ ] Hook can be bypassed with `git commit --no-verify` (documented).
4. [ ] Health checks complete in <30 seconds.
5. [ ] Hook output is clear and actionable (pass/fail messages).
6. [ ] Documentation updated in CONTRIBUTING.md guide.

## 🤖 CodeRabbit Integration
> **CodeRabbit Integration**: Disabled
>
> CodeRabbit CLI is not enabled in `core-config.yaml`.
> Quality validation will use manual review process only.

## Tasks / Subtasks
- [ ] Create pre-commit hook script (`.git/hooks/pre-commit`).
- [ ] Hook script calls `npm run test:health-check`.
- [ ] Exit code handling: fail commit if tests fail.
- [ ] Add logging to `.git/logs/health-check.log`.
- [ ] Test hook with intentional failures to verify blocking behavior.
- [ ] Test hook with intentional passes to verify allowing commits.
- [ ] Document pre-commit integration in CONTRIBUTING.md.
- [ ] Document `--no-verify` bypass option and when to use it.
- [ ] Create installation script or document manual setup steps.

## 📐 Spec Pipeline Artifacts
> **Status:** To be generated during implementation

| Artifact | Path |
|----------|------|
| Specification | [spec.md](./story-2.3/spec/spec.md) |
| Requirements | [requirements.json](./story-2.3/spec/requirements.json) |
| Critique | [critique.json](./story-2.3/spec/critique.json) |

## Dev Notes
- Pre-commit hooks are not automatically installed; document setup steps
- Use Bash script for maximum compatibility (Windows WSL + macOS)
- Performance is critical: aim for <30 second execution time
- Consider caching test results if possible (but be careful with staleness)
- Provide clear error messages so developers understand what failed
- Log all hook executions for audit trail

## Hook Behavior
```bash
#!/bin/bash
# .git/hooks/pre-commit
# Exit immediately if any command fails
set -e

# Run health checks
npm run test:health-check

# If we get here, all tests passed
exit 0
```

## Documentation Updates
- **CONTRIBUTING.md**: Add section on pre-commit hooks
- **.git/hooks/pre-commit**: Include clear comments explaining the hook
- **README.md**: Mention health-check integration in development section

## File List
- `.git/hooks/pre-commit` (new hook script)
- `CONTRIBUTING.md` (updated with pre-commit documentation)
- `.git/logs/health-check.log` (auto-created by hook)
- `scripts/install-hooks.sh` (optional: installation helper)

## Validation
- [ ] Hook blocks commits that fail health checks
- [ ] Hook allows commits that pass health checks
- [ ] Hook execution time <30 seconds
- [ ] `--no-verify` bypass works as expected
- [ ] Clear error output on failures
- [ ] Documentation is complete and accurate

## Performance Requirements
- Hook execution: < 30 seconds
- Memory usage: < 200 MB
- CPU: Minimal impact on developer workflow

## Change Log
| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-03-13 | 1.0.0 | Story created and approved for implementation | @pm |
