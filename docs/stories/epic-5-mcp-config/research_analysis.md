# Research & Reuse Analysis: Epic 5 (MCP-CONFIG)

Este documento detalha os ativos e padrões identificados para aceleração do **Epic 5**, visando máxima eficiência através da reciclagem de tecnologias e processos existentes.

## 1. Ativos Existentes (AIOX-CORE)

Identificamos os seguintes componentes prontos para reutilização no `.aiox-core/development/tasks/`:

| Ativo | Função | Potencial de Reuso |
|-------|--------|-------------------|
| `add-mcp.md` | Automação via Docker MCP | Base para a Story 5.2 (CLI Generator) |
| `mcp-workflow.md` | Padrão de economia de tokens | Diretriz de performance para a Story 5.1 |
| `setup-mcp-docker.md` | Setup de infraestrutura | Base para a Story 5.3 (Docker Build) |
| `search-mcp.md` | Descoberta no catálogo | Integração com o Registry (Story 5.4) |

### Padrões de Performance
* **Economia de Tokens**: O framework já preconiza o uso de "Code Mode" / Sandbox para atingir até **~98.7%** de economia em tarefas pesadas de processamento de dados.

---

## 2. Referência Externa (SynkraAI/mcp-ecosystem)

Repositório clonado em `repositories/external/mcp-ecosystem`. Padrões extraídos:

### Estrutura de Definição (JSON)
* **Servers**: Arquivos em `servers/` definem o comando, argumentos e capacidades (`features`).
* **Presets**: Arquivos em `presets/` agrupam servidores por caso de uso (ex: `aios-dev`, `aios-research`).

### Hierarquia Proposta
Para o AIOX-CORE, adotaremos a seguinte hierarquia incremental:
1. **Registry**: Banco de dados JSON de servidores disponíveis.
2. **Bundles**: Presets pré-configurados para squads específicos.
3. **Custom extensions**: Localizados em `extensions/mcps/` seguindo o blueprint.

---

## 3. Estratégia de Integração Incremental

Para acelerar o desenvolvimento, não criaremos "do zero". O fluxo será:

1. **Blueprint (Story 5.1)**: Formalizar o JSON das pastas `servers/` e `presets/` como o padrão oficial do AIOX.
2. **CLI Scaffolding (Story 5.2)**: Evoluir a task `add-mcp.md` para suportar a criação de MCPs customizados baseados em templates (Node/Python).
3. **Dockerization (Story 5.3)**: Reutilizar o `setup-mcp-docker.md` para automatizar o build multi-stage.
4. **Registry (Story 5.4)**: Implementar um scanner que lê `extensions/mcps/` e registra no gateway Docker MCP automaticamente.

---

## 4. Próximos Passos Imediatos

* [ ] Iniciar **Story 5.1**: Criar o `blueprint.md` oficial consolidando os padrões AIOX + SynkraAI.
* [ ] Validar o CLI `npm run mcp:create` (Story 5.2) usando como base o `add-mcp.md`.

---
*Orion, AIOX Master — 2026-03-14*
