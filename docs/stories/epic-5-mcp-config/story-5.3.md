# Story 5.3: Integrated Docker Build & Deploy

## Status
- **Status:** ✅ DONE
- **Executor:** `@devops`
- **Quality Gate:** `@architect`
- **Epic:** [Epic 5 — MCP-CONFIG](./epic.md)

## Story
**As a** DevOps Agent,
**I want** to automate the build and deployment process of MCP containers,
**so that** new custom tools are instantly available on the VPS environment.

## Acceptance Criteria
1. [x] Script `mcp-deployer.js` criado e funcional.
2. [x] Build local via Docker validado no pipeline.
3. [x] Verificação de conectividade SSH com a VPS integrada.
4. [x] Automação via `npm run mcp:deploy <name>` integrada ao root.
5. [x] Uso de Docker multi-stage builds (conforme templates da 5.1).
6. [x] Rodar o container com usuário não-root (conforme padrão de segurança).

## 🤖 CodeRabbit Integration
**CodeRabbit Integration**: Disabled

## 📐 Spec Pipeline Artifacts
> **Status:** APPROVED (Critique Round 1) ✅
> - **Complexity:** STANDARD (Score: 13/25)
> - **Verdict:** APPROVED
> - **Generated:** 2026-03-14

| Artifact | Path | Details |
|----------|------|---------|
| Specification | [spec.md](./story-5.3/spec/spec.md) | Full technical design |
| Requirements | [requirements.json](./story-5.3/spec/requirements.json) | Functional requirements |
| Plan | [implementation.yaml](./story-5.3/spec/implementation.yaml) | Execution subtasks |

## Tasks / Subtasks
- [x] **Task 1: Definir Dockerfile Base Otimizado**
  - [x] Criar templates Docker no blueprint (Story 5.1).
  - [x] Implementar caching de camadas (package-lock.json).
- [x] **Task 2: Lógica de Deploy Remoto**
  - [x] Reutilizar `ssh-executor.js` para enviar a imagem ou disparar o build na VPS.
  - [x] Atualizar o registro do Easypanel para reconhecer o novo container.
- [x] **Task 3: Validação de Segurança**
  - [x] Verificar permissões de arquivos dentro do container.

## Dev Notes
- **Reciclagem:** Consultar `.aiox-core/development/tasks/setup-mcp-docker.md`.
- **Hardware:** Considerar os limites de RAM da VPS (8GB) ao definir o setup.

## Testing
- [x] Realizar build e deploy de um MCP "Hello World" e verificar status na VPS.
- [x] `docker ps` na remota deve mostrar o container saudável.

## Change Log
| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-03-14 | 1.0.0 | Initial draft creation | River (SM) |
