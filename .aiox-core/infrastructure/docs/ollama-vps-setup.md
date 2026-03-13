# Ollama VPS Setup & Model Management

## 1. Visão Geral
Este documento descreve a configuração do Ollama na VPS, a política de gestão de modelos e as diretrizes de eficiência de RAM (8GB total).

## 2. Configuração do Serviço
O Ollama roda como um serviço gerenciado pelo Easypanel no Swarm.

### Variáveis de Ambiente Críticas
| Variável | Valor | Propósito |
|----------|-------|-----------|
| `OLLAMA_HOST` | `0.0.0.0` | Permite conexões de outros containers e do proxy loopback. |
| `OLLAMA_KEEP_ALIVE` | `5m` | Descarrega o modelo da RAM após 5 minutos de inatividade. |
| `OLLAMA_MAX_LOADED_MODELS` | `1` | Previne que múltiplos modelos tentem ocupar a RAM simultaneamente. |

## 3. Inventário de Modelos (Família Qwen 3.5)
O AIOX selecionou a família **Qwen 3.5** como padrão devido ao excelente equilíbrio entre performance e consumo de recursos.

| Modelo | Tamanho (Disco) | RAM Estimada | Uso Recomendado |
|--------|-----------------|--------------|-----------------|
| `qwen3.5:0.8b` | ~1.0 GB | ~800 MB | Tarefas ultra-rápidas, resumos curtos. |
| `qwen3.5:2b` | ~2.7 GB | ~2.5 GB | Uso geral, raciocínio básico, escrita. |

*Nota: Modelos da família `qwen2.5` foram removidos para economizar espaço e evitar confusão.*

## 4. Comandos de Gestão (Operados pelo AIOX)

### Listar modelos
```bash
docker exec $(docker ps --format '{{.Names}}' | grep "^aios-core_ollama\.") ollama list
```

### Instalar novo modelo
```bash
docker exec $(docker ps --format '{{.Names}}' | grep "^aios-core_ollama\.") ollama pull <modelo>
```

### Remover modelo
```bash
docker exec $(docker ps --format '{{.Names}}' | grep "^aios-core_ollama\.") ollama rm <modelo>
```

## 5. Monitoramento de RAM
Com o sistema base ocupando ~3GB, a inferência com o modelo `2b` leva o uso de RAM para ~5.5GB - 6GB.
O AIOX monitora esse uso e pode forçar o descarregamento via:
```bash
# Reiniciar o serviço via Swarm (mais seguro que matar o container)
docker service update --force aios-core_ollama
```

## 6. Próximos Passos
- [ ] Exposição via Cloudflare Tunnel (Story 4.2).
- [ ] Implementação de logs de inferência (Story 4.3).
