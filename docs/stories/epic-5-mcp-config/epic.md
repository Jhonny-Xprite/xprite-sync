# Epic 5: MCP-CONFIG — Orquestrador de Ecossistemas MCP

## Epic Goal
Estabelecer o padrão Synkra AIOX para desenvolvimento, gestão e orquestração de servidores **Model Context Protocol (MCP)**. O foco é fornecer uma infraestrutura incremental e eficiente para que o AIOX possa "aprender" novas capacidades através de MCPs modulares, 100% funcionais e organizados.

> **Princípio central:** Facilitar a extensibilidade do sistema usando os padrões de excelência da SynkraAI.

## Existing System Context
- **Base:** O AIOX-CORE já suporta execução de ferramentas, mas falta uma camada de automação para criação e registro de MCPs.
- **Infra:** A ponte SSH e o ambiente VPS (Epic 4) estão prontos para hospedar esses servidores em containers Docker.
- **Referência:** `https://github.com/SynkraAI/mcp-ecosystem` — o blueprint padrão.

## Enhancement Details
- **Escopo:** Criação de padrões (Blueprint), Gerador CLI, Pipeline de Dockerização e Registro de Capacidades.
- **Primary Success Criteria:** Um novo MCP pode ser criado, testado, Dockerizado e registrado no AIOX em menos de 5 minutos usando comandos `npm run mcp:*`.

## PRD de Referência
📐 [PRD Epic 5: MCP-CONFIG](../../prd/epic-5-mcp-config.md)

## Planned Stories
| Story ID | Título | Executor | Quality Gate | Status |
|----------|--------|----------|--------------|--------|
| Story 5.0 | Audit, Cleanup & Standardization | `@devops` | `@architect` | ⏳ PENDING |
| Story 5.1 | AIOX MCP Blueprint & Standards | `@architect` | `@qa` | ⏳ PENDING |
| Story 5.2 | AIOX MCP CLI Generator | `@dev` | `@architect` | ⏳ PENDING |
| Story 5.3 | Integrated Docker Build & Deploy | `@devops` | `@architect` | ⏳ PENDING |
| Story 5.4 | MCP Registry & Schema Validation | `@dev` | `@qa` | ⏳ PENDING |
| Story 5.5 | MCP Observability & Pulse | `@devops` | `@qa` | ⏳ PENDING |
| Story 5.6 | Secure Secret Vault | `@dev` | `@architect` | ⏳ PENDING |
| Story 5.7 | Path Translation Layer | `@architect` | `@dev` | ⏳ PENDING |

## Risk Mitigation
- **Risco:** Incompatibilidade com versões futuras da especificação MCP.
  - **Mitigação:** Isolar dependências do SDK MCP e manter o blueprint atualizado com o `mcp-ecosystem` da SynkraAI.
- **Risco:** Fragmentação de nomes e estruturas.
  - **Mitigação:** Enforcement via CLI generator e validação automática de estrutura no registry.
- **Risco:** Complexidade no deploy Docker.
  - **Mitigação:** Usar templates Docker multi-stage pré-configurados para Node/Python.

## Definition of Done
- [ ] Padrão de pastas e nomenclaturas definido em `Blueprint.md`.
- [ ] CLI `mcp:create` gera código que passa em testes de schema.
- [ ] Dockerfiles seguem os presets de performance da SynkraAI.
- [ ] Registro do AIOX atualiza automaticamente ao detectar novo MCP em `/extensions/mcps/`.
- [ ] Zero dependências manuais para rodar um novo MCP gerado.
