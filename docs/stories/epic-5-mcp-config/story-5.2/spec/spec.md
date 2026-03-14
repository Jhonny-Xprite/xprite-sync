# Spec: AIOX MCP CLI Generator

> **Story ID:** 5.2
> **Complexity:** STANDARD
> **Generated:** 2026-03-14T11:45:00Z
> **Status:** Approved

---

## 1. Overview
Automação da criação de novos servidores MCP via CLI para garantir que todos sigam o Blueprint definido na 5.1.

### 1.1 Goals
- Reduzir tempo de setup de um novo MCP.
- Garantir conformidade estrutural.

---

## 2. Requirements Summary
- FR-1: Comando npm run mcp:create.
- FR-2: Scaffolding via templates.
- FR-3: Suporte políglota.

---

## 3. Technical Approach
Script em Node.js localizado em `.aiox-core/development/scripts/mcp-generator.js` que lê templates e injeta variáveis (nome, versão) nos arquivos destino.

---

## 9. Implementation Checklist
- [ ] Criar script `mcp-generator.js`.
- [ ] Adicionar comando ao `package.json`.
- [ ] Validar geração de MCP Node.
- [ ] Validar geração de MCP Python.
