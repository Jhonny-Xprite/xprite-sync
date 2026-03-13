# Story 4.3: Consciência & Saúde da VPS (DevSecOps Agent)

## Status
- **Status:** ✅ DONE — Quality Gate Aprovado pelo Arquiteto
- **Executor:** `@devops` / `@qa`
- **Quality Gate:** `@architect`
- **Epic:** [Epic 4 — VPS como Extensão Inteligente do AIOX](./epic.md)
- **PRD:** [epic-4-easypanel.md](../../prd/epic-4-easypanel.md)
- **Depende de:** Story 4.1 ✅ (SSH) + Story 4.2 ✅ (Ollama + Tunnel ativos)

## Story

**As a** AIOX Orchestrator (Orion),
**I want** to have real-time awareness of my VPS health and the ability to proactively report issues and recommend specific corrective actions,
**so that** the VPS is never a "black box" — I can see its state at any moment, detect degradation before it becomes a problem, and guide the user with concrete, actionable next steps.

> **Princípio:** O AIOX é o **guardião responsável** da VPS. Não é um monitor passivo — é um agente que observa, interpreta e recomenda. No futuro, atuará autonomamente. Hoje, coleta, analisa e orienta.

## Acceptance Criteria

1. [x] Módulo utilitário `ssh-executor.js` criado como camada de abstração SSH reutilizável.
2. [x] Script `vps-health-check.js` coleta via SSH: RAM, CPU, disco, uptime, status dos processos Ollama e cloudflared.
3. [x] Script integra via Docker PS para verificar containers e serviços do Easypanel.
4. [x] Output do health report é **semafórico** e **estruturado**: ✅ (OK), ⚠️ (Atenção), ❌ (Crítico).
5. [x] **Alertas proativos funcionando:**
    - RAM > 80% → `❌ CRÍTICO` + `process.exit(1)` + ação sugerida
    - Disco > 75% → `⚠️ ATENÇÃO` (via threshold semafórico) + ação sugerida
    - Serviço Ollama down → `❌ CRÍTICO` + como reiniciar
    - Tunnel cloudflared down → `❌ CRÍTICO` + como reiniciar
6. [x] **Recomendações inteligentes** baseadas no estado real.
7. [x] Thresholds configuráveis via variáveis de ambiente (`VPS_RAM_THRESHOLD`, `VPS_DISK_THRESHOLD`).
8. [x] `npm run vps:health` funcional e executável a partir da raiz do projeto.
9. [x] `VPS_IP` e `VPS_USER` lidos exclusivamente de variável de ambiente.
10. [x] DevSecOps Playbook criado: como interpretar cada estado, como responder a cada alerta.

## Tasks / Subtasks

- [x] **Task 1 — Módulo ssh-executor.js (Refactor/Criação):**
  ✅ Módulo criado em `.aiox-core/infrastructure/scripts/ssh-executor.js`.

- [x] **Task 2 — Mapeamento da Easypanel API:**
  ✅ Documentado em `.aiox-core/infrastructure/docs/easypanel-api-reference.md`. Mapeado arquivos locais de monitoramento.

- [x] **Task 3 — Script vps-health-check.js:**
  ✅ Criado script com coleta paralela e semafórica.

- [x] **Task 4 — Motor de Alertas & Recomendações:**
  ✅ Lógica implementada com exit code 1 em caso de falhas críticas.

- [x] **Task 5 — npm Script:**
  ✅ Adicionado `vps:health` e `vps:ssh` ao `package.json`.

- [x] **Task 6 — Segurança & Variáveis de Ambiente:**
  ✅ `.env.example` atualizado. Segurança via `.gitignore` confirmada.

- [x] **Task 7 — DevSecOps Playbook:**
  ✅ Criado em `.aiox-core/infrastructure/docs/devsecops-playbook.md`.

- [x] **Task 8 — Validação End-to-End:**
  ✅ Testado `npm run vps:health` e `npm run vps:ssh`. Tudo validado.

## Dev Notes

**Output esperado do health report (estado normal):**
```
[AIOX] VPS Health Report ─────────────────────── 2026-03-13 19:00:00
══════════════════════════════════════════════════════════════════════
  RAM       ✅  3.2 GB / 8 GB  (40%)
  Disco     ✅  22 GB / 100 GB (22%)
  CPU       ✅  15%
  Uptime    ✅  5 dias, 3h 22m
──────────────────────────────────────────────────────────────────────
  Ollama    ✅  Rodando
  Cloudflr  ✅  Ativo
  Easypanel ✅  3 serviços saudáveis
══════════════════════════════════════════════════════════════════════
💡 VPS operando normalmente. Nenhuma ação necessária.
```

**Output com alertas:**
```
[AIOX] VPS Health Report ─────────────────────── 2026-03-13 19:00:00
══════════════════════════════════════════════════════════════════════
  RAM       ❌  7.1 GB / 8 GB  (89%) — CRÍTICO
  Disco     ⚠️   76 GB / 100 GB (76%) — ATENÇÃO
  CPU       ✅  45%
  Uptime    ✅  2 dias, 7h 14m
──────────────────────────────────────────────────────────────────────
  Ollama    ❌  Parado
  Cloudflr  ✅  Ativo
  Easypanel ⚠️   1 serviço com erro
══════════════════════════════════════════════════════════════════════
❌ CRÍTICO (2) | ⚠️ ATENÇÃO (2)

💡 RAM em 89% — Execute: npm run vps:ssh "ollama stop qwen3.5:2b"
💡 Disco em 76% — Execute: npm run vps:ssh "docker image prune -a -f"
💡 Ollama parado — Reinicie: npm run vps:ssh "systemctl restart ollama"
```

**Evolução futura planejada (não nesta story):**
- AIOX executa ações corretivas autonomamente (com confirmação do usuário)
- Dashboard em tempo real integrado ao Epic 3 (Synkra Dashboard)
- Alertas via notificação (webhook, email, Obsidian note automático)
- Histórico de métricas com grafana/prometheus leve

**Easypanel API — Observação:**
A API é tRPC — os endpoints podem variar por versão. Prioridade: mapear o que existe na versão instalada na VPS antes de implementar. Se API não suportar o que precisamos, usar SSH direto para `docker ps` como fallback.

## Spec Pipeline Artifacts
> **Status:** ✅ Completo — spec-pipeline aprovado @qa

| Artifact | Path |
|----------|------|
| Specification | [spec.md](./story-4.3/spec/spec.md) |
| Requirements | [requirements.json](./story-4.3/spec/requirements.json) |
| Critique | [critique.json](./story-4.3/spec/critique.json) |

## File List
- `.aiox-core/infrastructure/scripts/ssh-executor.js` *(a criar — Task 1, módulo reutilizável)*
- `.aiox-core/infrastructure/scripts/vps-health-check.js` *(a criar — Task 3)*
- `.aiox-core/infrastructure/docs/easypanel-api-reference.md` *(a criar — Task 2)*
- `.aiox-core/infrastructure/docs/devsecops-playbook.md` *(a criar — Task 7)*
- `.env.example` *(criar/atualizar — Task 6)*
- `package.json` *(atualizar — Task 5)*

## Validation
- [x] `npm run vps:health` → saída semafórica ✅, exit code `0`
- [x] `VPS_RAM_THRESHOLD=10 npm run vps:health` → alerta ❌, exit code `1`
- [x] `npm run vps:ssh "uptime"` → output do uptime da VPS
- [x] `git status` → `.env` não rastreado
- [x] `devsecops-playbook.md` aprovado por `@architect`

## Change Log
| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-03-13 | 1.0.0 | Story draft inicial criado | @aiox-master |
| 2026-03-13 | 1.1.0 | Visão atualizada: consciência da VPS, alertas proativos, recomendações inteligentes | @aiox-master |
| 2026-03-13 | 1.2.0 | Reescrita completa — ssh-executor.js, tasks com código real, output detalhado de health report, futuro roadmap | @aiox-master |
| 2026-03-13 | 1.3.0 | `ssh-executor.js` e `vps-health-check.js` implementados. Playbook e API docs criados. Story finalizada. | @devops |
