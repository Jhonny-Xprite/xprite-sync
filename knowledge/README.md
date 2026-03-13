# Knowledge Hub

## Overview
This directory stores unstructured or semi-structured information used to ground AIOX agents. While `docs/` is for official project records, `knowledge/` is for context, patterns, and guidelines.

## Directory Structure
- `active/`: Files currently in use by agents (e.g., technical-preferences.md).
- `archive/`: Deprecated or historical context files.
- `patterns/`: Extracted code or workflow patterns.

## Current Knowledge Assets (active/)
- `aiox-kb.md`: Master framework knowledge.
- `technical-preferences.md`: Project-specific technical rules.
- `database-best-practices.md`: SQL and RLS patterns.
- `elicitation-methods.md`: Requirements gathering guide.
- *(And 14 other specialized architectural guides)*

## Governance
- Agents should refer to this directory when the `*kb` command is invoked.
- Maintainers should periodically curate the `active/` folder to prevent context bloat.
