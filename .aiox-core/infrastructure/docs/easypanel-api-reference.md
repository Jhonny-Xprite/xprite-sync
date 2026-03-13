# Easypanel API & Monitoring Reference

## 1. Visão Geral
O Easypanel gerencia os serviços na VPS e expõe métricas e controle via uma API baseada em **tRPC**. Além da API HTTP, o Easypanel mantém arquivos de monitoramento locais que o AIOX pode consumir via SSH para maior performance.

## 2. Monitoramento Local (Fast Path via SSH)
Arquivos localizados em `/etc/easypanel/monitoring/`. Úteis para o `vps-health-check.js`.

| Arquivo | Conteúdo | Descrição |
|---------|----------|-----------|
| `cpu.json` | `[{ "value": %, "time": ISO }]` | Histórico recente de carga de CPU. |
| `memory.json` | `[{ "value": MB, "time": ISO }]` | Histórico de uso de RAM em MB. |
| `disk.json` | `[{ "value": %, "time": ISO }]` | Uso de armazenamento. |
| `network.json` | `[{ "value": KBps, "time": ISO }]` | Tráfego de rede. |

## 3. tRPC API (HTTP)

### Endpoint Base
`https://easypanel.jhonnyxprite.com/api/trpc`

### Autenticação
Header: `Authorization: Bearer <EASYPANEL_API_TOKEN>`

### Rotas Úteis

#### Listar Projetos
`GET /api/trpc/projects.list?batch=1`

#### Listar Serviços de um Projeto
`GET /api/trpc/services.list?batch=1&input={"json":{"projectId":"aios-core"}}`

#### Status de um Serviço
`GET /api/trpc/services.getStatus?batch=1&input={"json":{"projectId":"aios-core","serviceId":"ollama"}}`

#### Reiniciar Serviço
`POST /api/trpc/services.deploy?batch=1`
Body: `{"json":{"projectId":"aios-core","serviceId":"ollama"}}`

## 4. Como Obter o Token
1. Acesse o Easypanel via Web: `https://easypanel.jhonnyxprite.com`
2. Vá em **Settings** -> **API**.
3. Clique em **Create Token**.
4. Atribua o nome "AIOX-CORE-MONITOR" e selecione permissões de leitura (ou leitura/escrita se desejar que o AIOX reinicie serviços).
5. Copie o token e adicione ao seu arquivo `.env` local como `EASYPANEL_API_TOKEN`.

## 5. Implementação no AIOX
O script `vps-health-check.js` prioriza a leitura dos arquivos locais via SSH para métricas de hardware e utiliza a API tRPC para verificar o estado dos serviços específicos do painel.
