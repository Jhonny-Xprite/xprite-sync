# PRD — Epic 5: MCP-CONFIG (Orquestrador de Ecossistemas MCP)

**Status:** 🏗️ Em Definição
**Versão:** 1.0.0
**Autor:** @aiox-master
**Data:** 2026-03-14
**Epic:** `docs/stories/epic-5-mcp-config/`

---

## 1. Visão Estratégica

> **"Não apenas ferramentas, mas um ecossistema de capacidades extensíveis."**

O **Epic 5** visa transformar o AIOX em uma plataforma modular capaz de gerar, gerenciar e orquestrar servidores **Model Context Protocol (MCP)** seguindo os mais altos padrões de engenharia da **SynkraAI**. O objetivo é que a criação de uma nova "ferramenta" para o AIOX seja um processo incremental, padronizado e 100% automatizado.

Inspirado no repositório `SynkraAI/mcp-ecosystem`, este épico estabelece:
- **Padronização**: Nomenclaturas, estruturas de diretórios e contratos de API consistentes.
- **Eficiência**: Geração automática de boilerplate (presets).
- **Escalabilidade**: Dockerização nativa e fácil deploy no ambiente VPS (Epic 4).
- **Confiabilidade**: Testes e validações de schema automáticos.

---

## 2. Requisitos de Negócio

| ID | Requisito | Descrição |
|---|---|---|
| REQ-1 | **Preset Driven** | A criação de MCPs deve ser baseada em presets (templates) pré-definidos. |
| REQ-2 | **Zero Config Scaffolding** | Um comando deve gerar um MCP funcional, incluindo Dockerfile e configs. |
| REQ-3 | **Plug-and-Play Registry** | O AIOX deve reconhecer novos MCPs automaticamente via registro central. |
| REQ-4 | **Compatibility** | Seguir rigorosamente o padrão `SynkraAI/mcp-ecosystem`. |

---

## 3. Histórias de Usuário (Propostas)

| Story ID | Título | Objetivo | Status |
|----------|--------|----------|--------|
| **5.0** | **Audit, Cleanup & Standardization** | Auditar imagens/volumes Docker e sanear configurações MCP atuais. | ⏳ Pendente |
| **5.1** | **AIOX MCP Blueprint & Standards** | Definir a estrutura base, padrões de código e presets. | ⏳ Pendente |
| **5.2** | **AIOX MCP CLI Generator** | Utilitário para scaffolding automático de novos servidores MCP. | ⏳ Pendente |
| **5.3** | **Integrated Docker Build & Deploy** | Pipeline de build e deploy automático para VPS (Docker/Easypanel). | ⏳ Pendente |
| **5.4** | **MCP Registry & Schema Validation** | Sistema de descoberta, validação e registro de capacidades. | ⏳ Pendente |
| **5.5** | **MCP Observability & Pulse** | Implementar logs de chamadas, monitoramento de status e alertas de falha. | ⏳ Pendente |
| **5.6** | **Secure Secret Vault** | Criar interface segura para gestão de API Keys (fim do workaround manual). | ⏳ Pendente |
| **5.7** | **Path Translation Layer** | Mapeamento automático de caminhos Windows-Host ↔ Linux-Docker. | ⏳ Pendente |

---

## 4. Arquitetura de Referência (Baseada em SynkraAI)

A estrutura sugerida para cada MCP dentro do workspace:
```
/extensions/mcps/
├── {mcp-name}/
│   ├── src/
│   │   ├── tools/      # Definição das ferramentas
│   │   ├── resources/  # Recursos de dados
│   │   └── prompts/    # Prompts estruturados
│   ├── tests/          # Testes de integração (JSON-RPC)
│   ├── Dockerfile      # Dockerização padronizada
│   ├── package.json
│   └── mcp-config.yaml # Configuração específica do preset
```

---

## 5. Definition of Done (Epic)

- [ ] CLI `npm run mcp:create` funcionando e gerando MCPs 100% funcionais.
- [ ] Padrão de nomenclatura e estrutura validado em conformidade com `mcp-ecosystem`.
- [ ] Pelo menos 2 presets base (ex: `standard-typescript`, `docker-python`) disponíveis.
- [ ] Documentação técnica completa de como criar e estender MCPs.
- [ ] Registro dinâmico operacional: AIOX carrega o MCP sem reinicialização manual.
- [ ] Integração com Epic 4: Deploy em 1 clique para a VPS via AIOX.

---

## 6. Referências

- [SynkraAI/mcp-ecosystem](https://github.com/SynkraAI/mcp-ecosystem)
- [Model Context Protocol Specification](https://modelcontextprotocol.io)
- [Epic 4 Overview](../stories/epic-4-easypanel-integration/epic.md)

---

_Documento gerado sob governança AIOX-CORE — Epic 5 v1.0.0_
