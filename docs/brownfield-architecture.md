# AIOX-CORE Brownfield Architecture Document

## 01. Introduction
This document captures the CURRENT STATE of the AIOX-CORE codebase. It serves as the authoritative technical reference for all agents contributing to this framework.

## 02. Quick Reference
- **Main Entry**: `.aiox-core/index.js`
- **CLI Entry**: `.aiox-core/bin/aiox-core.js`
- **Configuration**: `.aiox-core/core-config.yaml`
- **Rules/Constitution**: `.aiox-core/constitution.md`
- **Agent Definitions**: `.aiox-core/development/agents/`
- **Task Definitions**: `.aiox-core/development/tasks/`
- **Workflow Definitions**: `.aiox-core/development/workflows/`

## 03. High Level Architecture
AIOX-CORE follows a **CLI-First** architecture where the CLI orchestrates specialized agents, tasks, and workflows.

### Technical Stack
| Category | Technology | Notes |
|----------|------------|-------|
| Runtime | Node.js (>=18) | Core execution environment |
| CLI | Commander.js | Command-line interface orchestration |
| Validation | Ajv | Schema validation for YAML artifacts |
| Data | JS-YAML | Config and definition parsing |

## 04. Source Tree (Actual & Complete)
```text
.
├── .agent/              # Agent engine local configuration
├── .aiox/               # System runtime data (e.g., handoffs)
├── .aiox-core/          # AIOX Framework (Core, bin, development, product)
│   ├── bin/             # CLI executables
│   ├── core/            # Framework business logic
│   ├── development/     # Agent personas, tasks, and workflows
│   ├── product/         # Templates and checklists
│   └── constitution.md  # Governance principles
├── .codex/              # Codex skill definition (agents/ workflows/)
├── docs/                # THE SOURCE OF TRUTH (PRD, Architecture shards)
├── .github/             # CI/CD Workflows
├── Recursos/            # External assets and cloned repositories
│   └── Github/          # Local clones of official sources
├── AGENTS.md            # Entry point for agent shortcut mapping
└── .env                 # Environment configuration (Keys and paths)
```

## 05. Technical Debt and Constraints
1. **Missing Root Documentation**: The `docs/` folder in the root was found empty, requiring this mapping task.
2. **Local-First Pattern**: Skill and agent loading prioritizes local definitions over global ones.
3. **Agent Authority**: Exclusive commands are enforced by persona definitions (e.g., only @devops for git push).

## 06. Appendices
- Run `npm run validate:structure` to verify compliance.
- Run `npm run validate:agents` to check agent YAML integrity.
