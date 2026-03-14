# 🔴 Dashboard AIOX — Configurado para Dados REAIS

## ✅ O que foi feito

A API foi **completamente reescrita** para buscar dados reais do seu projeto:

### 1. **Supabase Integration** ✅
- Conecta a `https://xsyixazfqnsvvdsihccv.supabase.co`
- Busca dados REAIS das tabelas:
  - `agent_metrics` — Métricas reais de agentes
  - `system_metrics` — Métricas reais do sistema

### 2. **System Metrics** ✅
- Coleta CPU real, memória, disco, uptime do seu OS
- Não são mais mock data

### 3. **Novos Endpoints para Inserir Dados Reais** ✅
```bash
POST /api/metrics/insert
POST /api/system-metrics/insert
```

---

## 🚀 Como Usar (3 Passos)

### Passo 1: Parar todos os processos Node
```bash
# Windows Command Prompt
taskkill /IM node.exe /F

# WSL/Git Bash
ps aux | grep node | grep -v grep | awk '{print $2}' | xargs kill -9
```

### Passo 2: Iniciar a API Nova
```bash
cd "d:/Jhonny Xprite - 2026/AIOX-CORE (PACKAGE)/Xprite-Sync-True/packages/api"
node dist/index.js
```

### Passo 3: Inserir Dados Reais de Agentes
```bash
curl -X POST "http://localhost:3000/api/metrics/insert" \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "@dev",
    "team_id": "00000000-0000-0000-0000-000000000000",
    "status": "running",
    "latency_ms": 156,
    "success_rate": 99.3,
    "error_count": 1,
    "processed_count": 12450,
    "memory_usage_mb": 512,
    "cpu_percentage": 48.5
  }'
```

---

## 📊 Endpoints Agora Conectados a Dados REAIS

| Endpoint | Dados | Fonte |
|----------|-------|-------|
| `GET /api/metrics` | Agentes | Supabase `agent_metrics` |
| `GET /api/system-metrics` | Sistema | Supabase `system_metrics` + OS real |
| `GET /api/agents/summary` | Resumo | Supabase aggregation |
| `POST /api/metrics/insert` | Inserir | Supabase (teste) |
| `POST /api/system-metrics/insert` | Inserir | Supabase (teste) |

---

## 📝 Exemplo Completo: Inserir e Ver Dados

```bash
# Terminal 1: Iniciar API
cd packages/api && node dist/index.js

# Terminal 2: Inserir dados do @qa
curl -X POST "http://localhost:3000/api/metrics/insert" \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "@qa",
    "team_id": "00000000-0000-0000-0000-000000000000",
    "status": "running",
    "latency_ms": 89,
    "success_rate": 98.7,
    "error_count": 2,
    "processed_count": 8934,
    "memory_usage_mb": 256,
    "cpu_percentage": 35.2
  }'

# Terminal 2: Ver todos os agentes
curl "http://localhost:3000/api/metrics"

# Terminal 2: Ver resumo de agentes
curl "http://localhost:3000/api/agents/summary"

# Terminal 2: Ver métricas do sistema (REAL + Supabase)
curl "http://localhost:3000/api/system-metrics"
```

---

## 🔧 Configuração do Supabase

Suas credenciais já estão configuradas em `packages/api/src/services/supabase.ts`:

```typescript
SUPABASE_URL=https://xsyixazfqnsvvdsihccv.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Tabelas:
- `agent_metrics` — agent_id, team_id, status, latency_ms, success_rate, etc.
- `system_metrics` — cpu_percentage, memory_percentage, disk_used_gb, etc.

---

## 📈 Arquitetura Agora

```
┌─ Dashboard React (5173)
│
├─ API Express (3000)
│  ├─ GET /api/metrics → Busca Supabase agent_metrics
│  ├─ GET /api/system-metrics → Busca Supabase + OS real
│  ├─ POST /api/metrics/insert → Insere no Supabase
│  └─ Cache Redis (se disponível)
│
└─ Supabase PostgreSQL
   ├─ agent_metrics (seus agentes reais)
   └─ system_metrics (histórico)
```

---

## 🧪 Testes para Validar Dados REAIS

### Teste 1: Dados do Supabase
```bash
curl "http://localhost:3000/api/metrics"
# Retorna agentes inseridos → REAL DATA ✅
```

### Teste 2: Métricas do Sistema (Real-time)
```bash
curl "http://localhost:3000/api/system-metrics"
# Mostra:
#  - "cpu_percentage": 45.2    ← CPU REAL do seu PC
#  - "memory_percentage": 62.8 ← MEMÓRIA REAL do seu PC
#  - "memory_used_gb": 15.7    ← GB REAIS usados
```

### Teste 3: Inserir Dado e Ver na Lista
```bash
# Inserir
curl -X POST "http://localhost:3000/api/metrics/insert" \
  -d '{"agent_id":"@architect","team_id":"00000000...","status":"running","latency_ms":200}'

# Listar (verá o novo)
curl "http://localhost:3000/api/metrics"
```

---

## 🎯 Dashboard Agora Mostra

Quando você abrir http://localhost:5173:
- ✅ **Agentes REAIS** que você inseriu no Supabase
- ✅ **CPU REAL** do seu sistema
- ✅ **Memória REAL** em uso
- ✅ **Dados históricos** do Supabase
- ❌ Sem mais mock data aleatória

---

## 🛠️ Se a Porta 3000 Ainda Estiver em Use

### Windows (CMD):
```cmd
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

### WSL/Git Bash:
```bash
lsof -i :3000 | awk '{print $2}' | tail -1 | xargs kill -9
```

Depois reinicie a API.

---

## 📞 Resumo

| Antes | Depois |
|-------|--------|
| ❌ Dados mock | ✅ Dados REAIS do Supabase |
| ❌ CPU simulada | ✅ CPU REAL do seu OS |
| ❌ Agentes fake | ✅ Agentes que você inserir |
| ❌ Sem integração | ✅ Integração total com seu projeto |

**O dashboard agora é um agregador REAL de dados do seu projeto AIOX inteiro!** 🎉

---

*Arquivo: DADOS_REAIS_SETUP.md*
*Data: 2026-03-13*
