# Spec: Secure Secret Vault

> **Story ID:** 5.6
> **Complexity:** STANDARD
> **Generated:** 2026-03-14T11:45:00Z
> **Status:** Approved

---

## 1. Overview
Centraliza a gestão de chaves de API para servidores MCP, resolvendo o bug de injeção de segredos no Docker.

---

## Technical Approach
Implementação de um cofre local (JSON criptografado) e um gerador de `docker-mcp.yaml` que as injeta no local correto para o gateway.

---

## 9. Implementation Checklist
- [ ] Implementar módulo de criptografia CLI.
- [ ] Criar gerenciador de `docker-mcp.yaml`.
- [ ] Validar injeção de chaves no Exa e Playwright.
