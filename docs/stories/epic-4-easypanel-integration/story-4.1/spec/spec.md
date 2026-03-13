# Specification: Story 4.1 - Ponte SSH Base — AIOX Ganha Acesso à VPS

## 1. Overview
**Story ID:** 4.1
**Epic:** EPIC 4: VPS como Extensão Inteligente do AIOX
**Complexity:** STANDARD (Score: 12)
**Assigned Agent:** @devops

### 1.1 Goal
Establish a secure, passwordless SSH bridge to the VPS (`root@92.112.176.118`) using ED25519 keys, enabling the AIOX to execute any remote command programmatically.

---

## 2. Requirements

### 2.1 Functional Requirements
* **FR-1:** Verificar/Gerar chaves SSH ED25519 localmente (`~/.ssh/id_ed25519`). Se não existir, executar `ssh-keygen -t ed25519 -C 'aiox-core-vps'`.
* **FR-2:** Adicionar chave pública (`id_ed25519.pub`) ao `authorized_keys` da VPS (92.112.176.118).
* **FR-3:** Validar `vps-ssh-test.js` executando `ls -la /` sem prompt de senha.
* **FR-4:** Tratar falhas em `vps-ssh-test.js` com exit(1) e mensagem clara de diagnóstico.
* **FR-5:** Definir `StrictHostKeyChecking=accept-new` na primeira conexão bem-sucedida para gravar fingerprint.
* **FR-6:** Criar `mcp-ssh-architecture.md` detalhando interface de Tool AIOX.
* **FR-7:** Atualizar `.gitignore` para bloquear padrões de chaves privadas (`id_ed25519`, `*.pem`, etc.).

### 2.2 Non-Functional Requirements
* **NFR-1 (Security):** Zero credenciais rastreadas pelo git.
* **NFR-2 (Reliability):** Fail-fast (máx 10s) via `ConnectTimeout=10`.
* **NFR-3 (Usability):** Mensagens de erro acionáveis.
* **NFR-4 (Security):** `BatchMode=yes` para evitar prompts interativos no backend.

### 2.3 Constraints
* **CON-1:** Apenas Node.js `child_process` (sem libs externas).
* **CON-2:** Exclusivo ED25519.
* **CON-3:** O script `vps-ssh-test.js` deve ser reaproveitado/endurecido.
* **CON-4:** Fase bloqueante para 4.2 e 4.3.

---

## 3. Architecture & Implementation

### 3.1 Domain Model
- **SSHBridge:** A ponte de comunicação programática entre AIOX e VPS usando command-line `ssh`.
- **ED25519KeyPair:** Par de chaves para autorização.
- **VPS:** A VM remota (92.112.176.118).

### 3.2 Expected Interactions
1. `node .aiox-core/infrastructure/scripts/vps-ssh-test.js`
2. Invoking `execAsync("ssh -o BatchMode=yes ... ls -la /")`
3. Capturing `stdout`. Output de `Sucesso!`

### 3.3 Security & Edge Cases
* SE a chave SSH não existir, O SCRIPT DEVE falhar ou indicar `ssh-keygen`.
* SE o VPS der timeout, MENSAGEM DEVE indicar problema de rede.
* `.gitignore` MUST contain `id_ed25519`, `*.pem`, `id_rsa`, `*.key`.

---

## 4. Dependencies & Tools
* **child_process:** nativo do node js.
* **OpenSSH:** binário `ssh`.

---

## 5. Acceptance Criteria
* [ ] **AC-1:** Chaves SSH ED25519 verificadas/geradas no ambiente local.
* [ ] **AC-2:** Chave pública adicionada ao authorized_keys na VPS.
* [ ] **AC-3:** vps-ssh-test.js executa comando remoto e retorna `Sucesso` sem prompt.
* [ ] **AC-4:** Script falha estruturadamente caso `authorized_keys` negue.
* [ ] **AC-5:** `git status` não indica chaves vazando.
* [ ] **AC-6:** `mcp-ssh-architecture.md` gerado.
* [ ] **AC-7:** `known_hosts` preenchido com fingerprint do VPS.
