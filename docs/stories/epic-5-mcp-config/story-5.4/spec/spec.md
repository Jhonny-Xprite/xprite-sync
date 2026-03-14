# Spec: MCP Registry & Schema Validation

> **Story ID:** 5.4
> **Complexity:** STANDARD
> **Generated:** 2026-03-14T11:45:00Z
> **Status:** Approved

---

## 1. Overview
Implementa a governança dos MCPs através de um registro centralizado e validação rigorosa de metadados.

---

## Technical Approach
Script que percorre `extensions/mcps`, valida cada `mcp-config.yaml` contra o schema oficial e gera um `mcp-registry.json` consolidado.

---

## 9. Implementation Checklist
- [ ] Implementar validador Ajv.
- [ ] Criar script de scanner de diretórios.
- [ ] Gerar `mcp-registry.json`.
- [ ] Integrar no processo de lint global.
