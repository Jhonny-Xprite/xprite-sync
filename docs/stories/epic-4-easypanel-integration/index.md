# 🌐 Hub do Epic 4: VPS como Extensão Inteligente do AIOX

> **Princípio central:** A VPS não é apenas um servidor remoto. É um braço operacional do AIOX — com o qual ele vê, age, cuida e conecta recursos de infraestrutura.

## 📚 Documentação Central

| Documento | Descrição |
|-----------|-----------|
| 🗺️ [Epic Overview](./epic.md) | Goal estratégico, DoD global, risk mitigation, planned stories |
| 📐 [PRD & Arquitetura Completa](../../prd/epic-4-easypanel.md) | Visão estratégica, arquitetura SSH + Cloudflare, modelo de RAM, capacidades-alvo |

---

## 📋 Progresso das Histórias

| ID | Story | Status | Executor | Quality Gate |
|----|-------|--------|----------|--------------|
| **4.1** | [Ponte SSH Base — AIOX Ganha Acesso à VPS](./story-4.1.md) | ✅ _DONE_ | `@devops` | `@architect` |
| **4.2** | [Gestão de Modelos & Resource Bridging (Ollama)](./story-4.2.md) | ✅ _DONE_ | `@devops` / `@qa` | `@architect` |
| **4.3** | [Consciência & Saúde da VPS (DevSecOps Agent)](./story-4.3.md) | ⏳ _Pendente_ | `@devops` / `@qa` | `@architect` |

**Dependências:** 4.1 → 4.2 → 4.3 (sequencial)

---

## 🎯 Capacidades-Alvo do AIOX sobre a VPS

| Capacidade | Story | Status |
|-----------|-------|--------|
| Executar qualquer comando SSH remoto | 4.1 | ✅ |
| Gerenciar modelos Ollama (instalar/remover) | 4.2 | ✅ |
| Orquestrar integrações (Obsidian ↔ Ollama) | 4.2 | ✅ |
| Monitor de saúde em tempo real | 4.3 | ⏳ |
| Alertas proativos com ações sugeridas | 4.3 | ⏳ |
| `npm run vps:health` disponível | 4.3 | ⏳ |

---

## 🔗 Artefatos de Infraestrutura

| Artefato | Path | Story | Status |
|----------|------|-------|--------|
| SSH Test Script | `.aiox-core/infrastructure/scripts/vps-ssh-test.js` | 4.1 | ✅ Existe |
| MCP SSH Architecture | `.aiox-core/infrastructure/docs/mcp-ssh-architecture.md` | 4.1 | ✅ Existe |
| SSH Executor (utilitário) | `.aiox-core/infrastructure/scripts/ssh-executor.js` | 4.3 | ⏳ A criar |
| Ollama VPS Setup | `.aiox-core/infrastructure/docs/ollama-vps-setup.md` | 4.2 | ✅ Existe |
| Cloudflare Tunnel Config | `.aiox-core/infrastructure/docs/cloudflare-tunnel-config.md` | 4.2 | ✅ Existe |
| Easypanel API Reference | `.aiox-core/infrastructure/docs/easypanel-api-reference.md` | 4.3 | ⏳ A criar |
| VPS Health Check Script | `.aiox-core/infrastructure/scripts/vps-health-check.js` | 4.3 | ⏳ A criar |
| DevSecOps Playbook | `.aiox-core/infrastructure/docs/devsecops-playbook.md` | 4.3 | ⏳ A criar |

---

## 🎯 Definition of Done (Epic)

- [ ] AIOX executa comandos na VPS sem intervenção manual (`npm run vps:ssh "<cmd>"`)
- [x] Modelos fracos removidos; família Qwen 3.5 (`0.8b`, `2b`) instalada e funcional
- [x] Integração Obsidian ↔ Ollama funcional via Cloudflare Tunnel autenticado
- [ ] `npm run vps:health` retorna health report semafórico completo
- [ ] Alertas de RAM (> 80%) e disco (> 75%) com ações sugeridas concretas
- [ ] Zero credenciais sensíveis no histórico Git

---

_Epic 4 — VPS como Extensão Inteligente do AIOX | AIOX-CORE v1.1.0 | 2026-03-13_
