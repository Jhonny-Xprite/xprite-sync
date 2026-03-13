# Story 4.3: Consciência & Saúde da VPS (DevSecOps Agent)

## Status
- **Status:** Pendente ⏳
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

1. [ ] Módulo utilitário `ssh-executor.js` criado como camada de abstração SSH reutilizável.
2. [ ] Script `vps-health-check.js` coleta via SSH: RAM, CPU, disco, uptime, status dos processos Ollama e cloudflared.
3. [ ] Script integra com Easypanel API para consultar status de containers/serviços.
4. [ ] Output do health report é **semafórico** e **estruturado**: ✅ (OK), ⚠️ (Atenção), ❌ (Crítico).
5. [ ] **Alertas proativos funcionando:**
   - RAM > 80% → `❌ CRÍTICO` + `process.exit(1)` + ação sugerida
   - Disco > 75% → `⚠️ ATENÇÃO` + ação sugerida (`docker image prune -a`)
   - Serviço Ollama down → `❌ CRÍTICO` + como reiniciar via Easypanel/SSH
   - Tunnel cloudflared down → `❌ CRÍTICO` + como reiniciar
6. [ ] **Recomendações inteligentes** baseadas no estado real (não alertas fixos).
7. [ ] Thresholds configuráveis via variáveis de ambiente (`VPS_RAM_THRESHOLD`, `VPS_DISK_THRESHOLD`).
8. [ ] `npm run vps:health` funcional e executável a partir da raiz do projeto.
9. [ ] `EASYPANEL_API_TOKEN` lido exclusivamente de variável de ambiente — nunca hardcoded.
10. [ ] DevSecOps Playbook criado: como interpretar cada estado, como responder a cada alerta.

## Tasks / Subtasks

- [ ] **Task 1 — Módulo ssh-executor.js (Refactor/Criação):**
  Criar `.aiox-core/infrastructure/scripts/ssh-executor.js` como utilitário SSH genérico:
  ```javascript
  /**
   * @module ssh-executor
   * @description Utilitário SSH reutilizável do AIOX para execução de comandos na VPS.
   */
  const { exec } = require('child_process');
  const util = require('util');
  const execAsync = util.promisify(exec);

  const VPS_CONFIG = {
    host: process.env.VPS_IP || '92.112.176.118',
    user: process.env.VPS_USER || 'root',
    connectTimeout: parseInt(process.env.VPS_CONNECT_TIMEOUT || '10'),
  };

  async function executeOnVps(command) {
    const sshCmd = `ssh -o BatchMode=yes -o ConnectTimeout=${VPS_CONFIG.connectTimeout} -o StrictHostKeyChecking=accept-new ${VPS_CONFIG.user}@${VPS_CONFIG.host} "${command}"`;
    const { stdout, stderr } = await execAsync(sshCmd);
    return { stdout: stdout.trim(), stderr: stderr.trim() };
  }

  module.exports = { executeOnVps, VPS_CONFIG };
  ```
  Atualizar `vps-ssh-test.js` para usar este módulo (remover duplicação).

- [ ] **Task 2 — Mapeamento da Easypanel API:**
  Via SSH na VPS ou documentação oficial, mapear:
  - Endpoint base: `http://localhost:3000` (interno na VPS) ou `https://<easypanel-host>`
  - Endpoint de listagem de serviços: identificar rota tRPC correta (ex: `/api/trpc/services.list`)
  - Formato de autenticação: `Authorization: Bearer <EASYPANEL_API_TOKEN>`
  - Como gerar o token: Easypanel → Settings → API → Create Token (escopo: read-only)
  Documentar em `.aiox-core/infrastructure/docs/easypanel-api-reference.md`.

- [ ] **Task 3 — Script vps-health-check.js:**
  Criar `.aiox-core/infrastructure/scripts/vps-health-check.js` usando `ssh-executor.js`:
  ```javascript
  // Métricas coletadas via SSH:
  // RAM:     "free -h | grep Mem"
  // Disco:   "df -h / | tail -1"
  // CPU:     "top -bn1 | grep '%Cpu' | awk '{print $2}'"
  // Uptime:  "uptime -p"
  // Ollama:  "pgrep -x ollama > /dev/null && echo 'running' || echo 'stopped'"
  // Cloudfl: "systemctl is-active cloudflared 2>/dev/null || pgrep cloudflared > /dev/null && echo 'running' || echo 'stopped'"
  ```
  - Parsear cada saída para extrair valor numérico de % uso
  - Comparar com thresholds (via `process.env.VPS_RAM_THRESHOLD` etc.)
  - Chamar Easypanel API para status de containers
  - Montar e exibir relatório semafórico

- [ ] **Task 4 — Motor de Alertas & Recomendações:**
  Implementar lógica de análise e geração de recomendações contextuais:
  ```
  RAM > 80%:
    ❌ CRÍTICO — RAM em <valor>% (<usado> de 8 GB)
    💡 Ação: Execute `npm run vps:ssh "ollama stop qwen3.5:2b"` para liberar memória imediatamente.

  Disco > 75%:
    ⚠️ ATENÇÃO — Disco em <valor>% (<usado> de 100 GB)
    💡 Ação: Execute `npm run vps:ssh "docker image prune -a -f"` para limpar imagens ociosas.

  Ollama down:
    ❌ CRÍTICO — Serviço Ollama não está rodando
    💡 Ação: Reinicie via Easypanel (App → Ollama → Restart) ou: `npm run vps:ssh "systemctl restart ollama"`

  Tudo OK:
    ✅ VPS operando normalmente — nenhuma ação necessária.
  ```

- [ ] **Task 5 — npm Script:**
  Adicionar ao `package.json` raiz:
  ```json
  {
    "scripts": {
      "vps:health": "node .aiox-core/infrastructure/scripts/vps-health-check.js",
      "vps:ssh": "node -e \"const {executeOnVps}=require('./.aiox-core/infrastructure/scripts/ssh-executor.js');executeOnVps(process.argv[1]).then(r=>console.log(r.stdout)).catch(e=>process.exit(1))\" --"
    }
  }
  ```
  O script `vps:ssh` permite execução direta de qualquer comando remoto: `npm run vps:ssh "free -h"`.

- [ ] **Task 6 — Segurança & Variáveis de Ambiente:**
  - Criar `.env.example` completo para o Epic 4:
    ```
    # Epic 4 — VPS Connection
    VPS_IP=92.112.176.118
    VPS_USER=root
    VPS_CONNECT_TIMEOUT=10
    VPS_RAM_THRESHOLD=80
    VPS_DISK_THRESHOLD=75

    # Easypanel API
    EASYPANEL_API_TOKEN=your-token-here

    # Cloudflare Tunnel
    CLOUDFLARE_TUNNEL_URL=https://ollama.your-domain.com
    OLLAMA_API_TOKEN=your-bearer-token-here
    ```
  - Confirmar que `.env` está no `.gitignore`.
  - Executar `git status` para verificar que `.env` não aparece.

- [ ] **Task 7 — DevSecOps Playbook:**
  Criar `.aiox-core/infrastructure/docs/devsecops-playbook.md` com:
  - O que cada indicador significa e como foi coletado
  - Tabela de thresholds e significado de cada nível (OK / Atenção / Crítico)
  - Playbook de resposta a cada tipo de alerta (passo a passo)
  - Como o AIOX pode executar ações corretivas agora vs. o que está planejado para releases futuros
  - Comandos de diagnóstico rápido (top, htop, df, du, journalctl, etc.)

- [ ] **Task 8 — Validação End-to-End:**
  - Executar `npm run vps:health` com VPS em estado normal → confirmar saída ✅ + exit code `0`
  - Simular RAM alta (mock ou threshold baixo via `VPS_RAM_THRESHOLD=10`) → confirmar alerta ❌ + exit code `1`
  - `EASYPANEL_API_TOKEN=invalido npm run vps:health` → erro descritivo, não crash silencioso
  - Confirmar `npm run vps:ssh "uptime"` funciona

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
- [ ] `npm run vps:health` → saída semafórica ✅, exit code `0`
- [ ] `VPS_RAM_THRESHOLD=10 npm run vps:health` → alerta ❌, exit code `1`
- [ ] `EASYPANEL_API_TOKEN=invalido npm run vps:health` → erro descritivo, não crash
- [ ] `npm run vps:ssh "uptime"` → output do uptime da VPS
- [ ] `git status` → `.env` não rastreado
- [ ] `devsecops-playbook.md` aprovado por `@architect`

## Change Log
| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-03-13 | 1.0.0 | Story draft inicial criado | @aiox-master |
| 2026-03-13 | 1.1.0 | Visão atualizada: consciência da VPS, alertas proativos, recomendações inteligentes | @aiox-master |
| 2026-03-13 | 1.2.0 | Reescrita completa — ssh-executor.js, tasks com código real, output detalhado de health report, futuro roadmap | @aiox-master |
