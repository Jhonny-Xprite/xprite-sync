# 🛠️ Hub do Epic 5: MCP-CONFIG

> **"Modularidade é a chave para a inteligência expansível."**

Este épico gerencia a padronização e a automação do ecossistema de servidores MCP (Model Context Protocol) dentro do projeto, seguindo os padrões do repositório de referência da SynkraAI.

## 📚 Documentação Central

| Documento | Descrição |
|-----------|-----------|
| 🗺️ [Epic Overview](./epic.md) | Estratégia, DoD, Mitigação de Riscos |
| 📐 [PRD Epic 5](../../prd/epic-5-mcp-config.md) | Visão de produto, requisitos e referências |
| 🛠️ [MCP Blueprint (Draft)](./blueprint.md) | Padronização de pastas e nomes |

---

## 📋 Progresso das Histórias

| ID | Story | Status | Executor |
|----|-------|--------|----------|
| **5.0** | [Audit, Cleanup & Standardization](./story-5.0.md) | ✅ DONE | `@devops` |
| **5.1** | [AIOX MCP Blueprint & Standards](./story-5.1.md) | ✅ DONE | `@architect` |
| **5.2** | [AIOX MCP CLI Generator](./story-5.2.md) | ✅ DONE | `@dev` |
| **5.3** | [Integrated Docker Build & Deploy](./story-5.3.md) | ✅ DONE | `@devops` |
| **5.4** | [MCP Registry & Schema Validation](./story-5.4.md) | ✅ DONE | `@dev` |
| **5.5** | [MCP Observability & Pulse](./story-5.5.md) | ✅ DONE | `@devops` |
| **5.6** | [Secure Secret Vault](./story-5.6.md) | ✅ DONE | `@dev` |
| **5.7** | [Path Translation Layer](./story-5.7.md) | ✅ DONE | `@architect` |
| **5.8** | [Deep Audit: VPS & Local Assets](./story-5.8.md) | 🔄 APPROVED | `@devops` |
| **5.9** | [Legacy Migration: Wave 1](./story-5.9.md) | 🔄 APPROVED | `@dev` |
| **5.10** | [AIOX Core Stack Implementation](./story-5.10.md) | 🔄 APPROVED | `@dev` |
| **5.11** | [Universal Gates & Stabilization](./story-5.11.md) | 🔄 APPROVED | `@qa` |

---

## 🏗️ Estrutura Alvo (Layout MCP)

Todos os novos MCPs devem seguir este layout em `/extensions/mcps/`:

1. `{mcp-name}/src/` - Código fonte organizado por tools/resources/prompts.
2. `{mcp-name}/test/` - Testes JSON-RPC.
3. `{mcp-name}/Dockerfile` - Build imutável.
4. `{mcp-name}/README.md` - Documentação de capabilities.

---

## 🎯 Definition of Done (Epic)

- [ ] Escalonamento automático: `npm run mcp:create <name>` gera estrutura funcional.
- [ ] Validação: `npm run mcp:validate <name>` checa conformidade com o Blueprint.
- [ ] Docker: Build multi-stage otimizado para produção.
- [ ] Dokumentação: Guia completo para desenvolvedores criarem extensões.
- [ ] Registro: AIOX detecta e usa as novas ferramentas sem configuração manual.

---
_Epic 5 — MCP-CONFIG | AIOX-CORE v2.1.0 | 2026-03-14_
