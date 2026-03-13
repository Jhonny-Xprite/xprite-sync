# Managed Repositories

## Overview
This directory acts as a workspace for local clones and internal sub-modules. It keeps external source code isolated from the main project logic.

## Directory Structure
- `external/`: Clones of official repositories (AIOX-CORE, official libs).
- `internal/`: Local repositories, microservices, or shared internal packages.

## Governance
- **Git State:** Repositories in `external/` should keep their original `.git` directories but should NOT be tracked by the main project's git (added to `.gitignore` if necessary).
- **Updates:** Use the `*sync-repos` task (to be defined) to update all external dependencies.
