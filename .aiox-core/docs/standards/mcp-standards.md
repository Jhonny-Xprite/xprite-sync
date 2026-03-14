# AIOX MCP Naming & Structural Standards
> **Version:** 1.0.0
> **Status:** ACTIVE
> **Target:** /extensions/mcps/

## 1. Naming Conventions

### 1.1 Directory & Project Name
- **Format:** `kebab-case`
- **Prefix:** None (prefix is implicit by being in `/mcps/`)
- **Example:** `brave-search`, `google-drive-sync`

### 1.2 Docker Images
- **Namespace:** `mcp`
- **Format:** `mcp/{id}:{tag}`
- **Tagging:** 
  - `latest`: Current production build on VPS.
  - `stable`: Last validated version.
  - `dev`: Local development builds.
- **Example:** `mcp/brave-search:stable`

### 1.3 Tools & Methods
- **Format:** `snake_case` (MCP Standard requirement)
- **Example:** `search_web`, `get_file_contents`

---

## 2. Directory Structure (Mandatory)

Each MCP MUST contain the following structure:

```text
/extensions/mcps/{name}/
├── src/
│   ├── index.ts (or main.py)  # Entrypoint
│   ├── tools/                 # Tool logic
│   ├── resources/             # Static/Dynamic resources
│   └── prompts/               # Structured prompts
├── tests/                     # JSON-RPC integration tests
├── Dockerfile                 # Standardized multi-stage build
├── mcp-config.yaml            # Metadata based on AIOX Schema
└── README.md                  # Manual usage and tool descriptions
```

---

## 3. Configuration Contract (`mcp-config.yaml`)

Every server must have a `mcp-config.yaml` at its root. This file is used by:
1. **AIOX CLI**: To validate before build.
2. **AIOX Registry**: To populate the tools list.
3. **Docker Deployer**: To set ENV vars and volumes.

---

## 4. Docker Standards

- **Base Image:** Use slim/alpine versions (e.g., `node:20-slim`, `python:3.11-alpine`).
- **User:** Never run as `root`. Use a dedicated user (e.g., `node`).
- **Workdir:** `/app`.
- **Secrets:** NEVER include secrets in the image. Use the `env` block in `mcp-config.yaml`.

---

## 5. JSON-RPC & Error Patterns

- **Standard Success:** Returns a `content` array with `text`, `image`, or `resource` objects.
- **Error Handling:** 
  - Use standard JSON-RPC 2.0 error codes.
  - `-32601`: Method not found (tool name incorrect).
  - `-32602`: Invalid params (schema violation).
  - `-32000` to `-32099`: Custom tool execution errors.
- **Tone:** Errors should be descriptive but avoid leaking system paths.

---

## 6. Resource Limits (Presets)

| Level | RAM Limit | Build Timeout | Runtime Timeout |
|-------|-----------|---------------|-----------------|
| **Lite** | 256MB | 2m | 30s |
| **Standard** | 512MB | 5m | 60s |
| **Heavy** | 2GB | 10m | 5m |

> **Note:** Default is **Standard**. Configure in `mcp-config.yaml`.

---
_AIOX-CORE Standards Module | 2026-03-14_
