# AGENTS.md - Synkra AIOX (Codex CLI)

Este arquivo define as instrucoes do projeto para o Codex CLI.

<!-- AIOX-MANAGED-START: core -->
## Core Rules

1. Siga a Constitution em `.aiox-core/constitution.md`
2. Priorize `CLI First -> Observability Second -> UI Third`
3. Trabalhe por stories em `docs/stories/`
4. Nao invente requisitos fora dos artefatos existentes
<!-- AIOX-MANAGED-END: core -->

<!-- AIOX-MANAGED-START: quality -->
## Quality Gates

- Rode `npm run lint`
- Rode `npm run typecheck`
- Rode `npm test`
- Atualize checklist e file list da story antes de concluir
<!-- AIOX-MANAGED-END: quality -->

<!-- AIOX-MANAGED-START: codebase -->
## Project Map

- Core framework: [`.aiox-core/`](file:///d:/Jhonny%20Xprite%20-%202026/AIOX-CORE%20%28PACKAGE%29/Xprite-Sync-True/.aiox-core/)
- Extensions & Skills: [`extensions/`](file:///d:/Jhonny%20Xprite%20-%202026/AIOX-CORE%20%28PACKAGE%29/Xprite-Sync-True/extensions/)
- Managed Repositories: [`repositories/`](file:///d:/Jhonny%20Xprite%20-%202026/AIOX-CORE%20%28PACKAGE%29/Xprite-Sync-True/repositories/)
- Knowledge Base: [`knowledge/`](file:///d:/Jhonny%20Xprite%20-%202026/AIOX-CORE%20%28PACKAGE%29/Xprite-Sync-True/knowledge/)
- **Source of Truth**: [`docs/prd.md`](file:///d:/Jhonny%20Xprite%20-%202026/AIOX-CORE%20%28PACKAGE%29/Xprite-Sync-True/docs/prd.md)
- **Architecture**: [`docs/brownfield-architecture.md`](file:///d:/Jhonny%20Xprite%20-%202026/AIOX-CORE%20%28PACKAGE%29/Xprite-Sync-True/docs/brownfield-architecture.md)
- Tests: `tests/`
- Sharded Docs: [`docs/`](file:///d:/Jhonny%20Xprite%20-%202026/AIOX-CORE%20%28PACKAGE%29/Xprite-Sync-True/docs/)
<!-- AIOX-MANAGED-END: codebase -->

<!-- AIOX-MANAGED-START: commands -->
## Common Commands

- `npm run sync:ide`
- `npm run sync:ide:check`
- `npm run sync:skills:codex`
- `npm run sync:skills:codex:global` (opcional; neste repo o padrao e local-first)
- `npm run validate:structure`
- `npm run validate:agents`
<!-- AIOX-MANAGED-END: commands -->

<!-- AIOX-MANAGED-START: shortcuts -->
## Agent Shortcuts

Preferencia de ativacao no Codex CLI:
1. Use `/skills` e selecione `aiox-<agent-id>` vindo de `extensions/skills` (ex.: `aiox-architect`)
2. Se preferir, use os atalhos abaixo (`@architect`, `/architect`, etc.)

Interprete os atalhos abaixo carregando o arquivo correspondente em `.aiox-core/development/agents/` (fallback: `extensions/skills/`), renderize o greeting via `generate-greeting.js` e assuma a persona ate `*exit`:

- `@architect`, `/architect`, `/architect.md` -> `.aiox-core/development/agents/architect.md`
- `@dev`, `/dev`, `/dev.md` -> `.aiox-core/development/agents/dev.md`
- `@qa`, `/qa`, `/qa.md` -> `.aiox-core/development/agents/qa.md`
- `@pm`, `/pm`, `/pm.md` -> `.aiox-core/development/agents/pm.md`
- `@po`, `/po`, `/po.md` -> `.aiox-core/development/agents/po.md`
- `@sm`, `/sm`, `/sm.md` -> `.aiox-core/development/agents/sm.md`
- `@analyst`, `/analyst`, `/analyst.md` -> `.aiox-core/development/agents/analyst.md`
- `@devops`, `/devops`, `/devops.md` -> `.aiox-core/development/agents/devops.md`
- `@data-engineer`, `/data-engineer`, `/data-engineer.md` -> `.aiox-core/development/agents/data-engineer.md`
- `@ux-design-expert`, `/ux-design-expert`, `/ux-design-expert.md` -> `.aiox-core/development/agents/ux-design-expert.md`
- `@squad-creator`, `/squad-creator`, `/squad-creator.md` -> `.aiox-core/development/agents/squad-creator.md`
- `@aiox-master`, `/aiox-master`, `/aiox-master.md` -> `.aiox-core/development/agents/aiox-master.md`
<!-- AIOX-MANAGED-END: shortcuts -->
