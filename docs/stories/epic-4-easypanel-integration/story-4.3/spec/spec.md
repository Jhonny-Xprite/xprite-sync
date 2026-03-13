# Specification: Story 4.3 - Consciência & Saúde da VPS (DevSecOps Agent)

## 1. Overview
**Story ID:** 4.3
**Epic:** EPIC 4: VPS como Extensão Inteligente do AIOX
**Complexity:** STANDARD (Score: 13)
**Assigned Agent:** @devops / @qa

### 1.1 Goal
Provide real-time awareness of VPS health through a programmatic script, issuing proactive alerts and suggested remediation actions for RAM, Disk, CPU, and running services like Ollama.

---

## 2. Requirements

### 2.1 Functional Requirements
* **FR-1:** Módulo `ssh-executor.js` gerado consolidando comandos SSH via `child_process`.
* **FR-2:** `vps-health-check.js` extrai RAM, GPU(se houver), Disco, CPU, Uptime.
* **FR-3:** Integração tRPC com Easypanel API ou `docker ps` via SSH.
* **FR-4:** Semáforos no terminal (✅, ⚠️, ❌).
* **FR-5:** RAM > 80% gera `❌ CRÍTICO` + `exit 1`. Disco > 75% gera `⚠️ ATENÇÃO`.
* **FR-6:** Se Ollama down = ❌ CRÍTICO.
* **FR-7:** Script deve sugerir remediation (ex: `docker prune`).
* **FR-8:** Threshold via variáveis de env (`VPS_RAM_THRESHOLD`).
* **FR-9:** Scripts `package.json`: `vps:health` e `vps:ssh`.
* **FR-10/11:** `.env.example` e playbook de resposta no `devsecops-playbook.md`.

### 2.2 Edge Cases
* Easypanel offline: Modus degradado (usa fallback ou printa warning, sem falhar scripts bash de ssh).

---

## 3. Architecture & Implementation
* **SSHExecutor:** Singleton abstrato para comandos remotos.
* **HealthReport Generator:** Coleta, parse, análise, rendering UI.

---

## 4. Acceptance Criteria
* [ ] **AC-1:** `ssh-executor.js` centralizado.
* [ ] **AC-2:** `npm run vps:health` produz saída semafórica clara.
* [ ] **AC-3:** RAM Threshold e Disk Threshold funcionais.
* [ ] **AC-4:** Script falha devidamente `exit 1` em caso crítico de recursos ou endpoint off.
* [ ] **AC-5:** `npm run vps:ssh "uptime"` funciona sem vazamentos.
* [ ] **AC-6:** `EASYPANEL_API_TOKEN` consumido propriamente e seguro em `.env`.
