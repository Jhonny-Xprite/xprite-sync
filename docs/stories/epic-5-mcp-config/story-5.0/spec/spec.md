# Spec: Audit, Cleanup & Standardization

> **Story ID:** 5.0
> **Complexity:** SIMPLE
> **Generated:** 2026-03-14T11:45:00Z
> **Status:** Approved

---

## 1. Overview
Esta história foca no saneamento do ambiente Docker do projeto, identificando e removendo recursos órfãos (imagens e volumes) e protegendo a infraestrutura crítica do Supabase.

### 1.1 Goals
- Limpar imagens `<none>` e volumes órfãos.
- Criar inventário de MCPs em `docs/infrastructure/mcp-inventory.md`.
- Garantir segurança dos volumes do Supabase.

---

## 2. Requirements Summary
### 2.1 Functional Requirements
- FR-1: Listar imagens com metadados.
- FR-2: Identificar imagens dangling.
- FR-3: Mapear containers.
- FR-4: Listar volumes (proteger 'supabase').
- FR-5: Cleanup seguro.

### 2.2 Non-Functional Requirements
- NFR-1: Segurança de dados (Zero deleções acidentais no Supabase).

---

## 3. Technical Approach
### 3.1 Architecture Overview
Uso de comandos nativos do Docker CLI via terminal para auditoria e limpeza seletiva.

### 3.2 Component Design
- Scripts de auditoria manuais ou semi-automáticos.
- Arquivo de inventário Markdown.

---

## 5. Files to Modify/Create
- New: `docs/infrastructure/mcp-inventory.md`

---

## 6. Testing Strategy
### 6.3 Acceptance Tests
Scenario: Cleanup Seguro
Given o ambiente Docker com imagens <none>
When executar docker image prune e validação de volumes
Then imagens <none> devem sumir e volumes do supabase devem persistir.

---

## 9. Implementation Checklist
- [ ] Executar auditoria inicial.
- [ ] Gerar `mcp-inventory.md`.
- [ ] Executar cleanup seletivo.
- [ ] Validar integridade do Supabase.
