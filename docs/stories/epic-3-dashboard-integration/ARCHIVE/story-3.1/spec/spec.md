# Spec: Setup Inicial - Integração Base do Dashboard

> **Story ID:** 3.1
> **Complexity:** STANDARD
> **Generated:** 2026-03-13T18:05:00Z
> **Status:** Draft

---

## 1. Overview

Esta especificação detalha a integração do repositório oficial do Synkra AIOX Dashboard ao projeto AIOX-CORE. O dashboard servirá como a interface principal de observabilidade para monitoramento de agentes, métricas de sistema e progresso de workflows.

### 1.1 Goals

- Integrar o repositório `aiox-dashboard` como a base de frontend do projeto. (FR-1)
- Garantir que todas as configurações ambientais (Development, Staging, Production) estejam prontas para uso. (FR-2)
- Permitir que desenvolvedores compilem e executem o dashboard localmente de forma rápida. (FR-3, FR-4)
- Evitar conflitos de dependências entre o core e o frontend. (FR-5)
- Facilitar o onboarding através de documentação clara. (FR-6)

### 1.2 Non-Goals

- Implementar lógica de negócio ou visualização de dados específica neste momento (foco em setup).
- Configurar autenticação complexa (será tratado em stories futuras ou via Supabase default).

---

## 2. Requirements Summary

### 2.1 Functional Requirements

| ID   | Description                                                                 | Priority | Source            |
| ---- | --------------------------------------------------------------------------- | -------- | ----------------- |
| FR-1 | Integrar repositório Synkra AIOX Dashboard (submodule/monorepo).            | P0       | requirements.json |
| FR-2 | Configurar variáveis de ambiente (dev, staging, production).                 | P0       | requirements.json |
| FR-3 | Setup de pipeline de build local (< 30s).                                    | P0       | requirements.json |
| FR-4 | Disponibilizar dashboard em http://localhost:3000/dashboard.                | P1       | requirements.json |
| FR-5 | Gerenciamento de dependências sem conflitos.                                | P1       | requirements.json |
| FR-6 | Criar documentação de setup e deploy (DASHBOARD.md).                        | P2       | requirements.json |

### 2.2 Non-Functional Requirements

| ID    | Category    | Requirement                                  | Metric               |
| ----- | ----------- | -------------------------------------------- | -------------------- |
| NFR-1 | Performance | Build do dashboard deve ser rápido.           | < 30s                |
| NFR-2 | Usability   | Dashboard deve carregar sem erros de console. | Zero console errors  |

### 2.3 Constraints

| ID    | Type      | Constraint                                                    | Impact                                 |
| ----- | --------- | ------------------------------------------------------------- | -------------------------------------- |
| CON-1 | Technical | Repositório: https://github.com/SynkraAI/aiox-dashboard       | Requer acesso ao GitHub e git submodule|
| CON-2 | Technical | Node.js versão 18+.                                           | Dependência de ambiente de execução    |
| CON-3 | Business  | Estratégia de integração deve ser documentada.                 | Afeta arquitetura do repositório       |

---

## 3. Technical Approach

### 3.1 Architecture Overview

A integração seguirá o padrão de **Monorepo com Submódulos**, onde o dashboard residirá na pasta `packages/dashboard`. Isso permite manter o histórico do repositório original enquanto o integramos ao workflow do AIOX-CORE.

### 3.2 Component Design

- **Git Submodule**: Apontando para `https://github.com/SynkraAI/aiox-dashboard`.
- **Packages Structure**: Pasta `packages/dashboard` contendo o código React/Vite.
- **Root Scripts**: Scripts no `package.json` raiz para gerenciar comandos do dashboard (ex: `npm run dashboard:dev`).

### 3.3 Data Flow

- O Dashboard consome dados da API do AIOX (configurada via `REACT_APP_API_URL`).
- Comunicação via WebSocket para atualizações em tempo real (configurada via `REACT_APP_WS_URL`).
- Integração direta com Supabase para metadados e persistência.

---

## 4. Dependencies

### 4.1 External Dependencies

| Dependency | Version | Purpose | Verified |
| ---------- | ------- | ------- | -------- |
| Node.js    | >=18.0  | Runtime | ✅       |
| git        | latest  | Version Control (Submodules) | ✅       |
| React      | latest  | Frontend Framework | ✅       |

### 4.2 Internal Dependencies

| Module    | Purpose                                      |
| --------- | -------------------------------------------- |
| Root .env | Prover credenciais compartilhadas (Supabase). |

---

## 5. Files to Modify/Create

### 5.1 New Files

| File Path      | Purpose                                      | Template |
| -------------- | -------------------------------------------- | -------- |
| DASHBOARD.md   | Manual de setup, configuração e troubleshooting. | -        |
| .gitmodules    | Registro do submódulo do dashboard.            | -        |

### 5.2 Modified Files

| File Path      | Changes                                      | Risk |
| -------------- | -------------------------------------------- | ---- |
| package.json   | Adição de scripts `dashboard:dev`, `dashboard:build`. | Low  |
| .gitignore     | Garantir exclusão de `node_modules` do dashboard. | Low  |
| .env.example   | Adição de variáveis `REACT_APP_*` necessárias. | Low  |

---

## 6. Testing Strategy

### 6.1 Unit Tests

Não aplicável diretamente nesta story de integração de repositório, mas o build deve passar.

### 6.2 Integration Tests

| Test                    | Components           | Scenario                                   |
| ----------------------- | -------------------- | ------------------------------------------ |
| Build Pipeline Test     | Build scripts        | `npm run dashboard:build` completa em < 30s|
| Dev Server Test         | Vite/Dev Server      | `npm run dashboard:dev` inicia sem erros   |

### 6.3 Acceptance Tests (Given-When-Then)

```gherkin
Feature: Dashboard Integration

  Scenario: Dashboard local development setup
    Given que o repositório foi clonado e submódulos inicializados
    When eu executo "npm run dashboard:dev"
    Then o servidor deve iniciar na porta 3000
    And ao acessar http://localhost:3000/dashboard a UI deve carregar sem erros de console

  Scenario: Build process verification
    Given que as dependências estão instaladas
    When eu executo "npm run dashboard:build"
    Then o processo deve terminar com sucesso em menos de 30 segundos
```

---

## 7. Risks & Mitigations

| Risk                         | Probability | Impact | Mitigation                                      |
| ---------------------------- | ----------- | ------ | ----------------------------------------------- |
| Conflitos de porta (3000)     | Med         | Low    | Documentar alteração de porta via .env.          |
| Versão de Node incompatível   | Low         | High   | Documentar versão 18+ e usar .nvmrc se possível. |
| Acesso negado ao repo privado | Med         | High   | Verificar permissões de checkout na branch.      |

---

## 8. Open Questions

| ID   | Question                                            | Blocking | Assigned To |
| ---- | --------------------------------------------------- | -------- | ----------- |
| OQ-1 | Devemos unificar o `package-lock.json` ou manter separado? | No       | @architect  |

---

## 9. Implementation Checklist

- [ ] Adicionar repositório via `git submodule add`
- [ ] Configurar `.env.local` com credenciais de teste
- [ ] Mapear scripts no `package.json` raiz
- [ ] Validar build local
- [ ] Criar `DASHBOARD.md`
- [ ] Testar acesso via navegador (localhost:3000)

---

## Metadata

- **Generated by:** @aiox-master via spec-write-spec
- **Inputs:** requirements.json, complexity.json, research.json
- **Iteration:** 1
