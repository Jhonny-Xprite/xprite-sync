# Specification: Story 4.2 - Gestão de Modelos & Resource Bridging (Ollama)

## 1. Overview
**Story ID:** 4.2
**Epic:** EPIC 4: VPS como Extensão Inteligente do AIOX
**Complexity:** STANDARD (Score: 16)
**Assigned Agent:** @devops / @qa

### 1.1 Goal
Manage Ollama models autonomously on the VPS via SSH, install Qwen 3.5 family, and securely expose the inference engine via authenticated Cloudflare Tunnel to external tools like Obsidian.

---

## 2. Requirements

### 2.1 Functional Requirements
* **FR-1:** AIOX executa `ollama list` e faz auditoria.
* **FR-2:** Remover modelos que não pertencem a Qwen 3.5 (`ollama rm`).
* **FR-3:** Instalar `qwen3.5:0.8b` e `qwen3.5:2b`.
* **FR-4:** Configurar `OLLAMA_KEEP_ALIVE=5m`.
* **FR-5:** Tunnel Cloudflare (`cloudflared`) expondo `localhost:11434`.
* **FR-6:** Acesso ao tunnel protegido por Bearer Token (Authorization header / Access).
* **FR-7:** Integração ativa Obsidian ↔ Ollama.
* **FR-8:** Porta 11434 fechada à internet (Zero Trust).
* **FR-9:** Documentação gerada (`ollama-vps-setup.md`, `cloudflare-tunnel-config.md`).

### 2.2 Non-Functional Requirements
* **RAM (NFR-1):** Não exceder 80% (6.4 GB).
* **Security (NFR-2):** curl IP:11434 = Connection refused.
* **Secrets (NFR-3):** Tunnel URl e tokens strictly em `.env`.

### 2.3 Constraints
* Apenas modelos Qwen 3.5.
* 1 modelo carregado em RAM simultaneamente.
* Comunicação via Tunnel Outbound.

---

## 3. Architecture & Implementation

### 3.1 Domain Model
- **OllamaService:** Engine LLM local à VPS.
- **Qwen35Model:** Stack de modelos validados para 8GB.
- **CloudflareTunnel:** Túnel que conecta localhost:11434 à internet HTTPS pública autenticada.
- **ObsidianIntegration:** Consumidor final autenticado.

### 3.2 Expected Interactions
- Auditoria (SSH -> `ollama list`)
- Remoção e Instalação (SSH -> `ollama pull/rm`)
- Inference (Obsidian -> CF Tunnel -> VPS localhost -> Ollama)

### 3.3 Security & Edge Cases
- Falta de espaço em Disco: `docker system prune` como handle.
- OOM (Out of Memory): Se `qwen3.5:4b` forçar a VPS.

---

## 4. Acceptance Criteria
* [ ] **AC-1:** Auditoria e remoção de modelos fracos.
* [ ] **AC-2:** Qwen3.5:0.8b e 2b instalados.
* [ ] **AC-3:** `OLLAMA_KEEP_ALIVE=5m` funcional.
* [ ] **AC-4:** Tunnel ativo.
* [ ] **AC-5:** Autenticação requerida (Bearer token válido) para acesso.
* [ ] **AC-6:** Obsidian responde usando `qwen3.5:2b`.
* [ ] **AC-7:** Porta 11434 inacessível via IP público bruto.
* [ ] **AC-8:** RAM monitorada em picos de inferência.
