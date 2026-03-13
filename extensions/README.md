# Extensions Hub

## Overview
This directory is the "Extensibility Layer" of the project. It contains custom integrations, tools, and skills that extend the AIOX framework's capabilities without modifying its core (`.aiox-core`).

## Directory Structure
- `mcps/`: Local Model Context Protocol (MCP) servers and configurations.
- `tools/`: Standalone CLI tools and utility scripts specific to this project's needs.
- `skills/`: Specialized skill definitions (e.g., Codex Skills) for agents.

## Governance
- **Internal vs External:** Tools that are shared across projects should ideally be moved to `repositories/`. Tools specific to Xprite-Sync belong here.
- **MCP Standards:** Every MCP server in `mcps/` should include a `package.json` (if JS) or a `docker-compose.yml` for isolation.
