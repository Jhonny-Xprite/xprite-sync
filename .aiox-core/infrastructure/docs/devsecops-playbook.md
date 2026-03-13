# DevSecOps Playbook: Gerenciando a Saúde da VPS (Epic 4)

## 1. Filosofia de Operação
O AIOX não apenas monitora; ele atua como um assistente de infraestrutura proativo. Este playbook define as respostas padrão para os alertas gerados pelo comando `npm run vps:health`.

## 2. Indicadores e Significados

| Indicador | Método de Coleta | Crítico | Atenção |
|-----------|------------------|---------|---------|
| **RAM** | `free -m` | > 80% | > 65% |
| **Disco** | `df -h` | > 85% | > 75% |
| **CPU** | `top` | > 95% | > 80% |
| **Ollama** | `docker ps` | Parado | N/A |
| **Tunnel** | `systemctl` | Inativo | N/A |

## 3. Playbook de Resposta

### ❌ RAM Crítica (> 80%)
**Causa Comum:** Modelo grande (`qwen3.5:2b` ou `4b`) preso na memória ou múltiplos containers consumindo recursos.
**Ação Imediata:**
1. Descarregar o modelo Ollama:
   `npm run vps:ssh "docker service update --force aios-core_ollama"`
2. Se persistir, verificar processos pesados:
   `npm run vps:ssh "ps aux --sort=-%mem | head -5"`

### ⚠️ Disco em Atenção (> 75%)
**Causa Comum:** Logs acumulados ou imagens Docker ociosas.
**Ação Imediata:**
1. Limpar cache de imagens Docker:
   `npm run vps:ssh "docker image prune -af"`
2. Verificar pastas grandes:
   `npm run vps:ssh "du -sh /var/lib/docker/* | sort -h | tail -5"`

### ❌ Ollama Parado / Erro
**Causa Comum:** Container crashou por falta de memória (OOM).
**Ação Imediata:**
1. Reiniciar via Swarm (recomendado):
   `npm run vps:ssh "docker service update --force aios-core_ollama"`
2. Verificar logs:
   `npm run vps:ssh "docker service logs aios-core_ollama --tail 20"`

### ❌ Cloudflare Tunnel Inativo
**Causa Comum:** Serviço `cloudflared` parou ou erro de autenticação.
**Ação Imediata:**
1. Reiniciar o serviço:
   `npm run vps:ssh "systemctl restart cloudflared"`
2. Ver logs:
   `npm run vps:ssh "journalctl -u cloudflared -n 20"`

## 4. Diagnóstico Rápido (Cheat Sheet)

| Comando | Propósito |
|---------|-----------|
| `npm run vps:health` | Resumo semafórico completo da saúde. |
| `npm run vps:ssh "uptime"` | Tempo de atividade e load average. |
| `npm run vps:ssh "free -h"` | Visualizar RAM detalhada. |
| `npm run vps:ssh "docker ps"` | Ver containers ativos. |
| `npm run vps:ssh "df -h"` | Verificar espaço em disco. |

## 5. Escalada
Se as ações automatizadas/sugeridas não resolverem, o incidente deve ser reportado ao canal de infraestrutura com o output do comando `npm run vps:health`.
