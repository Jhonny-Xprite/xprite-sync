# Spec: AIOX Core Stack Implementation

> **Story ID:** story-5.10
> **Complexity:** COMPLEX
> **Generated:** 2026-03-14

---

## 1. Overview
Deployment of the "Essential Brain Stack" for AIOX. This story transforms a standard IDE into an autonomous orchestrator by providing memory, reasoning, and multi-platform automation tools.

### 1.1 Goals
- Establish persistent long-term memory for agents.
- Enable high-order reasoning via sequential thinking.
- Integrate Web (Brave), Code (GitHub), and Data (Postgres) nodes.

---

## 3. Technical Approach
- Deploy 6 core MCPs as Docker containers or local Node processes.
- All secrets (GitHub Tokens, Brave API Keys, Postgres URLs) MUST be stored in the AIOX Vault.
- Puppeteer deployment requires the "Heavy" resource preset due to Chromium overhead.

## 6. Testing Strategy
- **Acceptance Test:** Every tool in the stack must be callable by `@aiox-master` and return structured data.
- **Security Check:** Verify no API keys are visible in `docker inspect` or log files.
