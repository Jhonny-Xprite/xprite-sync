# Spec: Integrated Docker Build & Deploy

> **Story ID:** 5.3
> **Complexity:** STANDARD
> **Generated:** 2026-03-14T11:45:00Z
> **Status:** Approved

---

## 1. Overview
Automação do ciclo de vida de build e deploy de containers MCP.

### 1.1 Goals
- Criar imagens Docker otimizadas.
- Deploy contínuo para a VPS.

---

## Technical Approach
Scripts shell/js que executam `docker build` localmente e usam a ponte SSH para atualizar o container na VPS Hostinger.

---

## 9. Implementation Checklist
- [ ] Criar script `mcp-builder.js`.
- [ ] Implementar lógica de deploy via SSH.
- [ ] Validar build de um MCP real (ex: context7).
