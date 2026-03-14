# AIOX MCP Infrastructure Inventory

## 📊 Docker Environment (Local)
**Audit Date:** 2026-03-14

### Containers
- **Supabase Edge Runtime:** Active (Required for Epic 3)
- **AIOX MCP Containers:** None active (awaiting Wave 3 deployment)

### Images
- **Base Images:** 
  - `node:20-slim`
  - `python:3.11-alpine`
- **MCP Standards Image (Wave 2/3):**
  - `mcp/aiox-test-node:latest`
  - `mcp/aiox-test-python:latest`
- **Legacy Images (Identified for cleanup):**
  - `mcp/playwright` (untagged)
  - `mcp/desktop-commander` (untagged)
  - `mcp/n8n` (untagged)

### Volumes
- `supabase_edge_runtime_...` (Maintained)

---

## ☁️ Docker Environment (VPS - Hostinger)
**Managed by:** Easypanel

### Active Services
- **n8n:** (Latest and v1.123.6)
- **OpenClaw / Moltbot:** Active
- **Evolution API:** Active
- **Chatwoot:** Active
- **Plane (Frontend, Backend, Migrator, etc):** Active
- **Infrastructure:**
  - `traefik:3.3.3`
  - `redis:7` / `valkey:7.2.11`
  - `postgres:15, 16, 17`

### Governance Notes
- VPS health is stable.
- Volumes are sharded by service name (prefix `jhonny-testes_`, `jhonny-xprite_`).
- All services running under Easypanel orchestration.

---

## 🧩 MCP Catalog (Pre-Standardization)
Found in `~/.docker/mcp/catalogs/docker-mcp.yaml`:
- **Zerodha Kite:** (Financial Tools)
- **Wikipedia MCP:** (Information Tools)
- **Wix Velo:** (Development Tools)
- **Vectra AI:** (Security Tools)

**Action:** Standardize these tools into the AIOX format in Epic 5 / Wave 3.
