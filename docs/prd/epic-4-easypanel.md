# PRD — Epic 4: VPS como Extensão Inteligente do AIOX

**Status:** ✅ DONE
**Versão:** 1.1.0
**Autor:** @architect via @aiox-master
**Data:** 2026-03-13
**Epic:** `docs/stories/epic-4-easypanel-integration/`

---

## 1. Visão Estratégica

> **"A VPS não é apenas um servidor remoto — ela é um braço do AIOX."**

O objetivo deste épico é dar ao AIOX **consciência total e controle operacional** sobre a VPS. O AIOX deve ser capaz de:

- **Enxergar** o estado da VPS em tempo real (RAM, disco, CPU, containers, serviços)
- **Agir** diretamente — executar comandos, instalar/remover modelos, reiniciar serviços
- **Cuidar** — monitorar a saúde, detectar degradação, recomendar melhorias proativamente
- **Conectar** — orquestrar integrações entre os serviços que rodam na VPS e ferramentas externas (ex: Obsidian ↔ Ollama)
- **Evoluir** — identificar oportunidades de otimização e propor ações ao usuário

A VPS não é só infraestrutura — ela é **capacidade cognitiva e computacional** à disposição do AIOX.

---

## 2. Especificações do Ambiente Alvo

| Parâmetro | Valor |
|-----------|-------|
| **IP / Host** | `92.112.176.118` (`srv832609.hstgr.cloud`) |
| **Sistema Operacional** | Ubuntu 24.04 LTS |
| **Painel de Controle** | Easypanel |
| **CPU** | 2 Núcleos |
| **RAM** | 8 GB (limite crítico para inferência LLM simultânea) |
| **Disco** | 100 GB |
| **Acesso Nativo** | `root` via SSH (chaves ED25519) |

---

## 3. Histórias de Usuário

| Story ID | Título | Executor | Quality Gate | Status |
|----------|--------|----------|--------------|--------|
| [4.1](../stories/epic-4-easypanel-integration/story-4.1.md) | Ponte SSH Base — AIOX ganha acesso à VPS | `@devops` | `@architect` | ✅ DONE |
| [4.2](../stories/epic-4-easypanel-integration/story-4.2.md) | Gestão de Modelos & Resource Bridging (Ollama) | `@devops` / `@qa` | `@architect` | ✅ DONE |
| [4.3](../stories/epic-4-easypanel-integration/story-4.3.md) | Consciência & Saúde da VPS (DevSecOps Agent) | `@devops` / `@qa` | `@architect` | ✅ DONE |

---

## 4. Arquitetura de Solução

### 4.1. Camada de Controle — Ponte SSH

```
[AIOX Local — Orion]
         │
         │  SSH (ED25519, BatchMode, sem senha)
         ▼
[VPS: root@92.112.176.118]
         │
         ├── /aios-core/          ← Workspace do AIOX na VPS
         ├── Easypanel :3000      ← Painel de containers (API token restrito)
         ├── Ollama :11434        ← Inference engine (local-only, não exposto)
         └── cloudflared          ← Túnel seguro para acesso externo autorizado
```

O AIOX usa `child_process` + SSH como seu "braço" para executar qualquer comando na VPS, exatamente como um desenvolvedor faria no terminal — mas de forma programática, rastreável e automatizada.

### 4.2. Estratégia de Modelos LLM (Ollama)

Os modelos atuais na VPS são fracos e serão removidos. A nova stack de modelos será restrita à **família Qwen 3.5**, calibrada ao hardware disponível:

| Modelo | Tamanho Aprox. | Status para esta VPS | Uso Ideal |
|--------|---------------|----------------------|-----------|
| `qwen3.5:0.8b` | ~500 MB | ✅ **Recomendado** | Tarefas rápidas, completion simples |
| `qwen3.5:2b` | ~1.5 GB | ✅ **Recomendado** | Raciocínio médio, uso cotidiano |
| `qwen3.5:4b` | ~2.5 GB | ⚠️ **No limite** | Tarefas complexas (com KEEP_ALIVE curto) |

**Política de RAM:**
- `OLLAMA_KEEP_ALIVE=5m` — modelo descarregado após inatividade
- Nunca carregar mais de 1 modelo simultaneamente
- AIOX monitora uso de RAM e alerta se > 80%

### 4.3. Exemplo de Integração: Obsidian ↔ Ollama

> **Caso de uso real:** Usuário quer usar Obsidian como interface de chat com o Ollama na VPS.

```
[Obsidian — plugin Ollama/Smart Connections]
         │
         │  HTTPS + Bearer Token
         ▼
[Cloudflare Tunnel — rota autenticada]
         │
         │  localhost
         ▼
[Ollama :11434 — qwen3.5:2b rodando]
         │
         └── Resposta streamed de volta ao Obsidian
```

O AIOX deve ser capaz de **orquestrar essa integração completa** — desde a instalação do modelo correto até o provisionamento do tunnel e a validação do plugin no Obsidian.

### 4.4. Consciência da VPS

O AIOX deve ter um "painel de estado" sempre disponível:

```
[AIOX Health Report — VPS]
────────────────────────────────────────
RAM:      ✅  3.2 GB / 8 GB (40%)
Disco:    ✅  22 GB / 100 GB (22%)
CPU:      ✅  15% (2 cores)
Uptime:   ✅  5 dias, 3h22m
Ollama:   ✅  Rodando — qwen3.5:2b carregado
Tunnel:   ✅  Cloudflare ativo
Easypan:  ✅  3 serviços saudáveis
────────────────────────────────────────
💡 Recomendação: Disco em 22% — considerar limpeza de imagens Docker ociosas.
```

---

## 5. Capacidades-Alvo do AIOX sobre a VPS

| Capacidade | Descrição | Story |
|-----------|-----------|-------|
| **Acesso remoto** | Executar qualquer comando shell via SSH | 4.1 |
| **Gestão de modelos** | Listar, instalar, remover modelos Ollama | 4.2 |
| **Orquestrar integrações** | Configurar Obsidian ↔ Ollama, CLI ↔ Ollama, etc. | 4.2 |
| **Monitor de saúde** | RAM, CPU, disco, uptime, status de serviços | 4.3 |
| **Alertas proativos** | Detectar degradação e notificar usuário | 4.3 |
| **Recomendações** | Sugerir otimizações com base no estado atual | 4.3 |
| **Controle de containers** | Via Easypanel API — restart, status, logs | 4.3 |

---

## 6. Requisitos Não-Funcionais (NFRs)

| # | Categoria | Requisito |
|---|-----------|-----------|
| NFR-1 | **Segurança** | Zero Trust — Ollama **nunca** exposto diretamente na internet |
| NFR-2 | **Segurança** | Credenciais SSH e tokens de API **nunca** commitados no Git |
| NFR-3 | **Resiliência** | Timeout SSH de 10s com mensagem de erro acionável |
| NFR-4 | **Performance** | RAM da VPS ≤ 80% durante inferência (`KEEP_ALIVE=5m`) |
| NFR-5 | **Padronização** | Todo código Node.js segue padrões AIOX (async/await, sem eval(), JSDoc) |
| NFR-6 | **Rastreabilidade** | Scripts documentados com referência ao epic/story; logs estruturados |
| NFR-7 | **Extensibilidade** | Módulo SSH extratível como utilitário reutilizável (`ssh-executor.js`) |

---

## 7. Definition of Done (Epic)

- [x] AIOX executa comandos na VPS sem intervenção manual do usuário
- [x] Modelos fracos removidos; família Qwen 3.5 instalada e funcional
- [x] AIOX consegue orquestrar a integração Obsidian ↔ Ollama do zero
- [x] Health report da VPS executável via `npm run vps:health`
- [x] Alertas de RAM e disco funcionando com thresholds configuráveis
- [x] Zero credenciais sensíveis no histórico Git
- [x] Documentação suficiente para que qualquer agente AIOX entenda e opere a VPS


---

## 8. Referências

- [Epic Overview](../stories/epic-4-easypanel-integration/epic.md)
- [Story 4.1 — Ponte SSH](../stories/epic-4-easypanel-integration/story-4.1.md)
- [Story 4.2 — Gestão de Modelos & Bridging](../stories/epic-4-easypanel-integration/story-4.2.md)
- [Story 4.3 — Consciência & DevSecOps](../stories/epic-4-easypanel-integration/story-4.3.md)
- Script base: `.aiox-core/infrastructure/scripts/vps-ssh-test.js`
- Modelos: [Qwen 3.5 no Ollama](https://ollama.com/library/qwen3.5/tags)
- Architecture: `docs/brownfield-architecture.md`

---

_Documento gerado sob governança estrita AIOX-CORE — Epic 4 v1.1.0_
