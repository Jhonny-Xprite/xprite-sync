# Spec: Schema & RLS Policies para Dashboard

> **Story ID:** 3.3
> **Complexity:** STANDARD
> **Generated:** 2026-03-13T22:00:00Z
> **Status:** Draft

---

## 1. Overview

Esta especificação define a fundação de dados para o AIOX Dashboard. O objetivo é criar um esquema de banco de dados robusto no PostgreSQL (via Supabase) para armazenar métricas de agentes, sistema, logs de workflow e atividade de usuários, garantindo o isolamento de dados entre times através de Row Level Security (RLS).

### 1.1 Goals

- Definir tabelas escaláveis para telemetria e logs (AC-3.3.1).
- Implementar índices otimizados para consultas de séries temporais (AC-3.3.2).
- Garantir segurança via RLS para isolamento de tenants/times (AC-3.3.3, AC-3.3.4).
- Providenciar migrações SQL seguras e reversíveis (AC-3.3.5).

### 1.2 Non-Goals

- Migração de dados legados - este schema é para novos registros de telemetria.
- Implementação de views materializadas complexas (será tratado conforme a necessidade de perf).

---

## 2. Requirements Summary

### 2.1 Functional Requirements

| ID   | Description                                                                 | Priority | Source            |
| ---- | --------------------------------------------------------------------------- | -------- | ----------------- |
| FR-1 | Criação de tabelas: `agent_metrics`, `system_metrics`, `workflow_logs`, `user_activity`. | P0       | requirements.json |
| FR-2 | Implementação de RLS policies baseadas em `auth.uid()`.                     | P0       | requirements.json |
| FR-3 | Índices para filtros por `team_id` e `recorded_at` (ordem desc).            | P1       | requirements.json |

### 2.2 Non-Functional Requirements

| ID    | Category    | Requirement                                  | Metric               |
| ----- | ----------- | -------------------------------------------- | -------------------- |
| NFR-1 | Security    | Zero vazamento de dados entre times.         | Teste de RLS         |
| NFR-2 | Performance | Latência de query < 200ms para 1M de linhas. | Query timing         |

---

## 3. Technical Approach

### 3.1 Schema Design (Data Model)

#### Table: `agent_metrics`
Armazena performance individual de agentes.
- `id` (UUID), `agent_id` (String), `team_id` (UUID reference)
- `status`, `latency_ms`, `success_rate`, `recorded_at` (Timestamp)

#### Table: `system_metrics`
Armazena métricas de infraestrutura (host).
- `team_id`, `cpu_pct`, `mem_pct`, `db_conn_count`, `recorded_at`

#### Table: `workflow_logs`
Logs de execução de workflows complexos.
- `workflow_id`, `status`, `started_at`, `completed_at`, `error_msg`

#### Table: `user_activity`
Audit log de interações no dashboard.
- `user_id`, `action`, `resource_type`, `changes` (JSONB)

### 3.2 Security Strategy (RLS)

Usaremos políticas do tipo `USING` que verificam a associação do usuário logado à tabela `team_members`.

Exemplo de política genérica:
```sql
CREATE POLICY "team_access_policy" ON table_name 
FOR ALL 
USING (
  team_id IN (
    SELECT team_id FROM team_members 
    WHERE user_id = auth.uid()
  )
);
```

---

## 4. Dependencies

### 4.1 Internal Dependencies

| Module    | Purpose                                      |
| --------- | -------------------------------------------- |
| Supabase  | Hosting e engine de RLS.                     |
| auth.users| Sistema de autenticação base.                |
| teams     | Tabela de referência para isolamento.        |

---

## 5. Files to Modify/Create

### 5.1 New Files

| File Path                               | Purpose                                      | Template |
| --------------------------------------- | -------------------------------------------- | -------- |
| `supabase/migrations/dashboard_schema.sql` | Migration de criação de tabelas e RLS.       | -        |

---

## 6. Testing Strategy

### 6.1 Security Tests (RLS)

1. Criar Usuário A (Time 1) e Usuário B (Time 2).
2. Tentar ler dados do Time 1 com Usuário B -> Deve retornar vazio.
3. Tentar inserir dados para o Time 1 com Usuário B -> Deve ser negado.

### 6.2 Performance Tests

- Popular tabelas de métricas com 1.000.000 de registros sintéticos.
- Rodar `EXPLAIN ANALYZE` em consultas de dashboard (últimas 24h).

---

## 7. Risks & Mitigations

| Risk                         | Probability | Impact | Mitigation                                      |
| ---------------------------- | ----------- | ------ | ----------------------------------------------- |
| RLS Degradation               | Low         | High   | Use `security definer` functions if policy perf drops.|
| Disk Bloat                   | High        | Med    | Definir job de pruning (retenção de 30 dias).   |

---

## 8. Implementation Checklist

- [ ] Desenvolver migration SQL completa
- [ ] Implementar Helper Function para resolução de `team_id` no RLS (opcional para perf)
- [ ] Aplicar migrations no ambiente de staging
- [ ] Executar script de "Stress Test" de segurança RLS
- [ ] Validar planos de execução (indexes) via console Supabase

---

## Metadata

- **Generated by:** @aiox-master via spec-write-spec
- **Inputs:** requirements.json, complexity.json, research.json
- **Iteration:** 1
