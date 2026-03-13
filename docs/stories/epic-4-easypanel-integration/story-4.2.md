# Story 4.2: Gestão de Modelos & Resource Bridging (Ollama)

## Status
- **Status:** In Progress 🏃
- **Executor:** `@devops` / `@qa`
- **Quality Gate:** `@architect`
- **Epic:** [Epic 4 — VPS como Extensão Inteligente do AIOX](./epic.md)
- **PRD:** [epic-4-easypanel.md](../../prd/epic-4-easypanel.md)
- **Depende de:** Story 4.1 ✅ (SSH bridge ativo e atestado)

## Story

**As a** AIOX Orchestrator (Orion),
**I want** to autonomously manage the Ollama models on the VPS and expose them securely to authorized external tools like Obsidian,
**so that** the VPS becomes a **cognitive resource** that I can direct — choosing, loading, and serving the right LLM model for each task — while keeping the infrastructure secure and RAM-efficient.

> **Contexto:** A VPS tem 8GB de RAM e modelos fracos e desatualizados instalados. Esta story transforma o Ollama da VPS em um recurso gerenciado pelo AIOX: limpa os modelos ruins, instala a família Qwen 3.5 calibrada ao hardware, protege o endpoint com Cloudflare Tunnel, e habilita a primeira integração real — Obsidian consumindo Ollama via rota autenticada, orquestrada pelo AIOX.

## Acceptance Criteria

1. [ ] AIOX executa `ollama list` remotamente via SSH e produz relatório dos modelos encontrados.
2. [ ] Modelos fracos/desatualizados removidos via AIOX (`ollama rm` executado por SSH).
3. [ ] Família **Qwen 3.5** instalada na VPS:
   - `qwen3.5:0.8b` ✅ instalado (tarefas rápidas, ~500 MB)
   - `qwen3.5:2b` ✅ instalado (uso cotidiano, ~1.5 GB)
   - `qwen3.5:4b` ⚠️ instalado **somente se** `free -h` mostrar RAM livre > 5 GB após os dois anteriores
4. [ ] `OLLAMA_KEEP_ALIVE=5m` configurado e ativo no serviço Ollama da VPS.
5. [ ] Cloudflare Tunnel provisionado e ativo, expondo `localhost:11434` com URL pública HTTPS.
6. [ ] Acesso à rota Cloudflare protegido por Bearer Token (não acessível sem autenticação).
7. [ ] Integração **Obsidian ↔ Ollama** validada: inferência com `qwen3.5:2b` retorna resposta válida via Obsidian.
8. [ ] Porta `11434` **inacessível diretamente** da internet (validação externa via `curl`).
9. [ ] RAM da VPS ≤ 80% (~6.4 GB) durante inferência ativa (`qwen3.5:2b`).
10. [ ] Documentação do setup de modelos e do tunnel criada nos docs de infraestrutura.

## Tasks / Subtasks

- [x] **Task 1 — Auditoria & Limpeza de Modelos:**
  Via AIOX (SSH), executar:
  ```bash
  ollama list
  ```
  Documentar todos os modelos encontrados. Para cada modelo fora da família Qwen 3.5:
  ```bash
  ollama rm <nome-do-modelo>
  ```
  Confirmar `ollama list` limpo após remoção.
  ✅ Modelos `qwen2.5` removidos.

- [x] **Task 2 — Instalar Família Qwen 3.5:**
  Via AIOX (SSH), executar sequencialmente:
  ```bash
  ollama pull qwen3.5:0.8b    # ~500 MB — sempre instalar
  ollama pull qwen3.5:2b      # ~1.5 GB — sempre instalar
  # Verificar RAM: free -h
  # Se RAM livre > 5 GB: ollama pull qwen3.5:4b
  ```
  Validar com `ollama list` pós-instalação. Documentar versões efetivamente instaladas.
  ✅ `qwen3.5:0.8b` e `qwen3.5:2b` instalados com sucesso.

- [ ] **Task 3 — Configurar KEEP_ALIVE:**
  Aplicar `OLLAMA_KEEP_ALIVE=5m` no serviço Ollama da VPS. Opções (avaliar o que está disponível):
  - **Via Easypanel:** App Ollama → Settings → Environment Variables → `OLLAMA_KEEP_ALIVE=5m`
  - **Via systemd:** Criar `/etc/systemd/system/ollama.service.d/override.conf`:
    ```ini
    [Service]
    Environment="OLLAMA_KEEP_ALIVE=5m"
    ```
    Depois: `systemctl daemon-reload && systemctl restart ollama`
  Validar: após 5 min de inatividade, `VRAM/RAM` deve cair (modelo descarregado).

- [ ] **Task 4 — Provisionar Cloudflare Tunnel:**
  Via AIOX (SSH), instalar e configurar `cloudflared`:
  ```bash
  # Instalar cloudflared
  curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /usr/local/bin/cloudflared
  chmod +x /usr/local/bin/cloudflared
  # Autenticar e criar tunnel (requer interação com Cloudflare Dashboard na primeira vez)
  cloudflared tunnel login
  cloudflared tunnel create aiox-ollama
  cloudflared tunnel route dns aiox-ollama ollama.<seu-dominio>.com
  ```
  Configurar `config.yml` apontando para `localhost:11434`. Iniciar como serviço systemd.
  Documentar a URL pública gerada em `.aiox-core/infrastructure/docs/cloudflare-tunnel-config.md`.

- [ ] **Task 5 — Autenticação Bearer Token:**
  Configurar proteção da rota. Opções (em ordem de preferência):
  1. **Cloudflare Access** (zero-config, JWT automático) — configurar Application no dashboard CF
  2. **Header de autenticação via ingress** — adicionar middleware no `config.yml` do cloudflared
  Documentar: como obter o token, formato do header (`Authorization: Bearer <token>`), onde armazenar localmente (`.env`, nunca Git).

- [ ] **Task 6 — Integração Obsidian:**
  No Obsidian local:
  - Instalar plugin compatível (ex: `obsidian-ollama` ou `Smart Connections`)
  - Configurar endpoint: `<URL-cloudflare>`
  - Configurar autenticação: Bearer Token
  - Executar inferência de teste: prompt simples com `qwen3.5:2b`
  - Confirmar resposta válida retornada pelo plugin
  Documentar configuração de referência em `.aiox-core/infrastructure/docs/ollama-vps-setup.md`.

- [ ] **Task 7 — Validação Zero Trust:**
  De rede externa (não a VPS):
  ```bash
  curl http://92.112.176.118:11434         # Deve falhar: Connection refused
  curl https://<cloudflare-url>/api/tags   # Sem token: deve retornar 401/403
  curl -H "Authorization: Bearer <token>" https://<cloudflare-url>/api/tags  # Deve retornar lista de modelos
  ```

- [ ] **Task 8 — Validação de RAM:**
  Durante inferência ativa (`qwen3.5:2b`):
  ```bash
  free -h   # Via SSH
  ```
  Confirmar `Used ≤ 6.4 GB` (80% de 8 GB). Registrar valor real no Change Log.

- [ ] **Task 9 — Documentação de Infraestrutura:**
  Criar/atualizar:
  - `.aiox-core/infrastructure/docs/ollama-vps-setup.md` — modelos instalados, política de RAM, comandos de gestão
  - `.aiox-core/infrastructure/docs/cloudflare-tunnel-config.md` — arquitetura do tunnel, autenticação, exemplos de chamada

## Dev Notes

**Família Qwen 3.5 — Guia de Escolha:**
| Modelo | RAM Usada Aprox. | Quando Usar |
|--------|-----------------|-------------|
| `qwen3.5:0.8b` | ~800 MB | Completion rápida, tarefas simples, sempre disponível |
| `qwen3.5:2b` | ~2 GB | Uso cotidiano, boas respostas com baixo custo de RAM |
| `qwen3.5:4b` | ~3.5 GB | Tarefas complexas; usar com `KEEP_ALIVE=1m` para liberar RAM rápido |

**Política de RAM da VPS (8 GB):**
- Sistema operacional + Easypanel + outros serviços: ~2-3 GB base
- Nunca carregar mais de 1 modelo Ollama simultaneamente
- `KEEP_ALIVE=5m` é o equilíbrio certo: não descarta rápido demais, não fica na RAM para sempre
- Se pressão de RAM: `ollama stop <modelo>` via SSH resolve imediatamente

**Cloudflare Tunnel — Por que?**
- Alternativa a expor porta diretamente: **mais seguro** (sem abertura de firewall)
- Traffic é HTTPS por padrão
- Cloudflare Access adiciona camada de autenticação gratuita
- Funciona mesmo se a VPS não tiver IP fixo (útil para o futuro)

**Obsidian Plugins Testados com Ollama:**
- `obsidian-ollama` — integração direta, suporte a endpoint customizado
- `Smart Connections` — usa embeddings, requer configuração de endpoint
- Templater + fetch — chamada REST manual (mais controle, mais setup)

## Spec Pipeline Artifacts
> **Status:** ✅ Completo — spec-pipeline aprovado @qa

| Artifact | Path |
|----------|------|
| Specification | [spec.md](./story-4.2/spec/spec.md) |
| Requirements | [requirements.json](./story-4.2/spec/requirements.json) |
| Critique | [critique.json](./story-4.2/spec/critique.json) |

## File List
- `.aiox-core/infrastructure/docs/ollama-vps-setup.md` *(a criar — Task 9)*
- `.aiox-core/infrastructure/docs/cloudflare-tunnel-config.md` *(a criar — Tasks 4+9)*
- `.env.example` *(atualizar — adicionar `CLOUDFLARE_TUNNEL_URL`, `OLLAMA_API_TOKEN`)*

## Validation
- [ ] `ollama list` (via SSH) mostra apenas família Qwen 3.5
- [ ] `curl http://92.112.176.118:11434` → Connection refused
- [ ] `curl -H "Authorization: Bearer <token>" <cloudflare-url>/api/tags` → JSON com lista de modelos
- [ ] `free -h` durante inferência → Used ≤ 6.4 GB
- [ ] Obsidian retorna resposta de `qwen3.5:2b` sem erro

## Change Log
| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-03-13 | 1.0.0 | Story draft inicial criado | @aiox-master |
| 2026-03-13 | 1.1.0 | Visão atualizada: AIOX gerencia modelos autonomamente; Qwen 3.5 (não 2.5) | @aiox-master |
| 2026-03-13 | 1.2.0 | Reescrita completa — tasks granulares com comandos reais, guia de modelos, política de RAM | @aiox-master |
