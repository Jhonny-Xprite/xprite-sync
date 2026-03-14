# Spec: Path Translation Layer

> **Story ID:** 5.7
> **Complexity:** STANDARD
> **Generated:** 2026-03-14T11:45:00Z
> **Status:** Approved

---

## 1. Overview
Resolve o problema de compatibilidade de caminhos entre o Host Windows e os containers MCP rodando em Linux.

---

## Technical Approach
Um middleware centralizado que detecta paths Windows em payloads JSON-RPC e os converte para o mountpoint correspondente no container.

---

## 9. Implementation Checklist
- [ ] Desenvolver `path-resolver.js`.
- [ ] Implementar regex de detecção de paths.
- [ ] Validar tradução `D:\` para `/data`.
