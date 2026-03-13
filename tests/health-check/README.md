# Framework Health Checks

Comprehensive test suite that validates AIOX-CORE framework integrity and ensures zero regressions in core agentic systems.

## Overview

The health-check test suite performs five key validations:

1. **Agent Definitions** - Validates all 12 agents are present and correctly defined
2. **Framework Paths** - Verifies critical `.aiox-core/` directories exist
3. **Dependency Resolution** - Checks agent dependencies are resolvable
4. **Configuration** - Validates `.aiox-core/core-config.yaml` structure
5. **Scripts** - Verifies core validation scripts can execute

## Running Health Checks

### All Tests
```bash
npm run test:health-check
```

### Specific Test File
```bash
npm run test:health-check -- agent-validation.test.js
npm run test:health-check -- path-validation.test.js
npm run test:health-check -- dependency-validation.test.js
npm run test:health-check -- config-validation.test.js
```

### Watch Mode
```bash
npm run test:health-check -- --watch
```

### With Coverage
```bash
npm run test:health-check -- --coverage
```

## Test Scenarios

### 1. Agent Definition Validation (`agent-validation.test.js`)

Validates the 12 required agents:
- po (Product Owner)
- qa (Quality Assurance)
- dev (Developer)
- pm (Product Manager)
- architect (Architecture)
- sm (Scrum Master)
- aiox-master (Framework Master)
- analyst (Business Analyst)
- data-engineer (Data Engineer)
- ux-design-expert (UX/Design Expert)
- devops (DevOps)
- squad-creator (Squad Creator)

**Checks:**
- All 12 agent files exist
- Each file contains valid YAML
- Required agent fields present (agent, persona_profile, commands, dependencies)
- Agent name and id are defined
- At least one command per agent
- Persona profile includes archetype and zodiac

### 2. Framework Path Validation (`path-validation.test.js`)

Validates critical directories and files in `.aiox-core/` structure.

**Critical Directories:**
- `.aiox-core/` - Framework root
- `.aiox-core/core/` - Core framework code
- `.aiox-core/development/` - Development resources (agents, tasks, templates, etc.)
- `.aiox-core/infrastructure/` - Infrastructure resources
- `.aiox-core/data/` - Framework data files
- `docs/stories/` - Story definitions
- `docs/prd/` - Product requirements
- `docs/architecture/` - Architecture documentation

**Critical Files:**
- `.aiox-core/constitution.md` - Framework constitution
- `.aiox-core/core-config.yaml` - Framework configuration
- `.claude/CLAUDE.md` - Project instructions
- `jest.config.js` - Test configuration
- `package.json` - Project manifest

### 3. Dependency Resolution Validation (`dependency-validation.test.js`)

Validates that all agent dependencies are resolvable.

**Checks:**
- Task dependencies reference existing files
- Template dependencies reference existing files
- Checklist dependencies reference existing files
- No circular dependencies between agents
- All dependencies sections properly defined
- Valid command references

### 4. Configuration Validation (`config-validation.test.js`)

Validates `.aiox-core/core-config.yaml` structure and settings.

**Checks:**
- Valid YAML syntax
- Required root properties present:
  - project (type, version)
  - user_profile
  - ide (configuration)
  - devLoadAlwaysFiles
  - devStoryLocation
- CodeRabbit integration configured
- Framework protection settings valid
- Lazy loading configuration valid
- MCP configuration present
- Decision logging enabled

### 5. Coverage & Performance

The health checks are designed to:
- Execute in under 30 seconds total
- Achieve ≥80% code coverage on framework code
- Use relative paths (no hardcoded absolute paths)
- Work on Windows (WSL), macOS, and Linux

## Configuration

Test configuration is centralized in `config.js`:
- Project root paths
- Framework directory mappings
- Required agent list
- Test timeouts
- Coverage thresholds
- Performance targets

## Success Criteria

All health checks pass when:
- [ ] All 12 agents defined and valid
- [ ] Framework directory structure verified
- [ ] All paths use relative references
- [ ] Dependencies resolvable
- [ ] Configuration valid and consistent
- [ ] Tests complete in <30 seconds
- [ ] Code coverage ≥80%
- [ ] No errors on Windows/macOS/Linux

## Idempotency

Health checks are fully idempotent with no side effects:
- No file creation/modification
- No external API calls
- No environment variable changes
- Safe to run multiple times
- No cleanup required

## Troubleshooting

### Tests Fail on Windows
Ensure WSL2 with Unix line endings:
```bash
git config core.autocrlf false
npm test
```

### Missing YAML Parser
Install required dependencies:
```bash
npm install --save-dev yaml
```

### Timeout Errors
Increase Jest timeout:
```bash
npm run test:health-check -- --testTimeout=60000
```

## Integration

Health checks are part of the pre-commit validation gate:
```bash
npm run validate:structure  # Full framework validation
npm run test:health-check  # Health checks only
```

Recommended to run before each commit to catch framework integrity issues early.

## Related Documentation

- [AIOX Framework](../../.aiox-core/constitution.md) - Framework constitution
- [Agent Definitions](../../.aiox-core/development/agents/) - All agent personas
- [Configuration](../../.aiox-core/core-config.yaml) - Framework configuration
- [Contributing](../../CONTRIBUTING.md) - Development guidelines
