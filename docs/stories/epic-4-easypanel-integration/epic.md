# Epic 4: VPS como Extensão Inteligente do AIOX

## Epic Goal
Transformar a VPS (`92.112.176.118`) em um **braço operacional do AIOX** — dando ao orquestrador acesso total, consciência em tempo real e capacidade de ação sobre a infraestrutura remota. O AIOX deve poder enxergar, agir, cuidar e conectar os recursos da VPS, como se fosse uma extensão natural do seu ambiente local.

> **Princípio central:** A VPS não é só infraestrutura. É capacidade cognitiva e computacional sob controle do AIOX.

## Existing System Context
- **Current State:** Script `vps-ssh-test.js` criado mas conexão SSH ainda não atestada no DoD.
- **VPS Alvo:** `root@92.112.176.118` — Ubuntu 24.04, 2 Núcleos, 8 GB RAM, Easypanel instalado.
- **Modelos atuais na VPS:** Fracos/desatualizados — serão removidos e substituídos pela família **Qwen 3.5**.
- **Restrição de RAM:** 8 GB — modelos ≤ 2B em uso cotidiano; 4B apenas sob demanda com KEEP_ALIVE curto.

## Enhancement Details
- **Escopo:** Três stories sequenciais cobrindo: (1) ponte SSH base, (2) gestão de modelos e orquestração de integrações, (3) consciência e saúde da VPS.
- **Primary Success Criteria:** AIOX consegue, de forma autônoma: executar comandos na VPS, gerenciar modelos Ollama, orquestrar integrações (como Obsidian ↔ Ollama) e reportar o estado de saúde da infraestrutura.

## PRD de Referência
📐 [PRD Completo & Arquitetura](../../prd/epic-4-easypanel.md)

## Planned Stories
| Story ID | Título | Executor | Quality Gate | Status |
|----------|--------|----------|--------------|--------|
| Story 4.1 | Ponte SSH Base — AIOX ganha acesso à VPS | `@devops` | `@architect` | ✅ DONE |
| Story 4.2 | Gestão de Modelos & Resource Bridging (Ollama) | `@devops` / `@qa` | `@architect` | ✅ DONE |
| Story 4.3 | Consciência & Saúde da VPS (DevSecOps Agent) | `@devops` / `@qa` | `@architect` | ✅ DONE |

## Risk Mitigation
- **Risco:** Sobrecarga de RAM durante inferência Ollama (limite 8GB).
  - **Mitigação:** `OLLAMA_KEEP_ALIVE=5m` + apenas 1 modelo carregado por vez; AIOX monitora e alerta se RAM > 80%.
- **Risco:** Credenciais SSH ou tokens de API vazar para o Git.
  - **Mitigação:** `.gitignore` para chaves privadas e `.env`; `BatchMode=yes` no script.
- **Risco:** Timeout de conexão SSH.
  - **Mitigação:** `ConnectTimeout=10` + mensagens de erro acionáveis.
- **Rollback:** Git revert; mudanças de infraestrutura são aditivas e reversíveis.

## Definition of Done
- [x] AIOX executa comandos na VPS sem intervenção manual do usuário.
- [x] Modelos fracos removidos; família Qwen 3.5 (`0.8b`, `2b`) instalada e funcional.
- [x] AIOX consegue orquestrar a integração Obsidian ↔ Ollama do zero.
- [x] Health report da VPS executável via `npm run vps:health` com indicadores semafóricos.
- [x] Alertas de RAM (> 80%) e disco funcionando com thresholds configuráveis.
- [x] Zero credenciais sensíveis no histórico Git.
