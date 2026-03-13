# Epic 1: Asset Restoration & Operational Compliance

## Epic Goal
Restore 100% of the 121 missing infrastructure assets (checklists, scripts, templates) identified in research to eliminate framework validation warnings and ensure full operational compliance with AIOX-CORE v5.0.3 standards.

## Existing System Context
- **Current State**: Core infrastructure scripts restored to `package.json`, but underlying dependencies (scripts in `.aiox-core/infrastructure/`) are missing or incomplete.
- **Validation Status**: `npm run validate:agents` report 100+ warnings.

## Enhancement Details
- **Scope**: Selective import of official assets from `Recursos/Github/aiox-core-official`.
- **Primary Success Criteria**: Zero (0) "Missing Dependency" warnings in `npm run validate:agents`.

## Planned Stories
| Story ID | Title | Executor | Quality Gate |
|----------|-------|----------|--------------|
| Story 1.1 | Core Skill & Agent Checklist Restoration | @analyst | @pm |
| Story 1.2 | Infrastructure Utility Script Porting | @dev | @architect |
| Story 1.3 | Final Compliance Validation | @qa | @architect |

## Risk Mitigation
- **Risk**: Importing incompatible or outdated scripts.
- **Mitigation**: Selective manual review before merge; verification against local `brownfield-architecture.md`.
- **Rollback**: Git revert to stable state.

## Definition of Done
- [ ] 121 assets verified as present or intentionally excluded.
- [ ] `npm run validate:agents` passes with 0 warnings.
- [ ] Documentation shards updated to reflect new asset availability.
