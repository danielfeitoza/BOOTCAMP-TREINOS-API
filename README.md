# Fit.IA API

API backend do projeto Fit.IA, desenvolvida durante o Bootcamp da Full Stack Club. Este repositorio concentra a camada de servicos da aplicacao: autenticacao, gerenciamento de planos de treino, sessoes, dados do usuario, estatisticas, integracao com IA e integracao com smartwatch.

Esta API e consumida por dois clientes principais:

- a aplicacao web FIT.IA
- uma aplicacao desenvolvida para um dispositivo vestivel, no caso um smartwatch

## Objetivo do projeto

O objetivo deste projeto foi construir um MVP funcional para acompanhamento de treinos com uma arquitetura mais proxima de um produto real. Em vez de limitar o projeto a operacoes basicas de CRUD, a proposta foi criar uma API capaz de sustentar fluxos de autenticacao, onboarding, visualizacao de treino do dia, estatisticas e integracao entre web e smartwatch.

Durante o bootcamp, o foco foi:

- praticar desenvolvimento backend com uma aplicacao real
- aprofundar o uso de Node.js, TypeScript e modelagem com banco relacional
- estruturar rotas e regras de negocio para atender mais de um cliente
- integrar autenticacao, persistencia, documentacao e deploy
- validar o uso de IA como apoio em fluxos do produto
- entregar um MVP funcional, sabendo que ainda existem varios pontos de evolucao

## O que esta API faz

Principais responsabilidades da API:

- autenticacao via better-auth
- cadastro e consulta de dados do usuario
- armazenamento de dados fisicos e timezone do usuario
- criacao e listagem de planos de treino
- consulta do treino do dia
- inicio e finalizacao de sessoes de treino
- calculo de consistencia semanal e sequencia de treinos
- exposicao de endpoints para o smartwatch
- vinculacao e desvinculacao de smartwatch com a conta do usuario
- suporte a fluxos com IA relacionados ao treino

## Integracao com a aplicacao web FIT.IA

A aplicacao web consome esta API para entregar a experiencia principal do produto. Alguns dos fluxos atendidos por esta camada backend sao:

- login e sessao do usuario
- onboarding inicial
- home com treino do dia
- consulta de dias e exercicios do plano ativo
- inicio e finalizacao de treino pela interface web
- tela de perfil com dados do usuario
- vinculacao e exclusao de smartwatch pelo frontend

## Integracao com smartwatch

Um dos diferenciais do MVP foi conectar a API a um dispositivo vestivel. A ideia foi permitir que parte da experiencia de treino tambem pudesse acontecer no relogio.

Fluxos suportados pela API para smartwatch:

- verificar se um deviceCode esta vinculado a um usuario
- consultar o treino do dia pelo deviceCode
- verificar se existe sessao ativa em uma data
- iniciar sessao de treino a partir do smartwatch
- finalizar sessao de treino a partir do smartwatch

Tambem foi implementado o fluxo de vinculacao:

- o smartwatch gera um QR Code
- o usuario escaneia esse codigo pelo celular
- a aplicacao web chama a API autenticada
- a API vincula o deviceCode ao usuario logado

## Tecnologias utilizadas

### Backend

- Node.js 24
- TypeScript
- Fastify
- Zod

### Banco de dados e ORM

- PostgreSQL
- Prisma ORM
- Prisma Adapter PG

### Autenticacao e documentacao

- better-auth
- @fastify/swagger
- @scalar/fastify-api-reference

### Utilitarios e integracoes

- dayjs
- dotenv
- Google Gemini via AI SDK

## Estrutura geral

A API segue uma organizacao simples por responsabilidade:

- `src/routes/` contem os endpoints HTTP
- `src/usecases/` concentra regras de negocio
- `src/lib/` contem integracoes de infraestrutura, auth, db e env
- `src/schemas/` define contratos e validacoes com Zod
- `prisma/` contem schema e migrations do banco

Rotas principais expostas hoje:

- `workout-plans`
- `home`
- `stats`
- `me`
- `smartwatch`
- `watch`
- `ai`

## Documentacao da API

Em ambiente local, a documentacao pode ser acessada em:

```bash
http://localhost:8081/docs
```

Tambem existe o JSON OpenAPI em:

```bash
http://localhost:8081/swagger.json
```

## Variaveis de ambiente

Para rodar o projeto localmente, configure um arquivo `.env` com base no `.env.example`.

Exemplo minimo:

```env
PORT=8080
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
BETTER_AUTH_API_KEY=your-better-auth-api-key
BETTER_AUTH_URL=http://localhost:8081
BETTER_AUTH_SECRET=your-better-auth-secret
API_BASE_URL=http://localhost:8081
WEB_APP_BASE_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_GENERATIVE_AI_API_KEY=your-google-gemini-api-key
OPENAI_API_KEY=your-openai-api-key
```

## Como executar localmente

Instale as dependencias:

```bash
pnpm install
```

Gere o client do Prisma:

```bash
pnpm exec prisma generate
```

Se necessario, aplique as migrations:

```bash
pnpm exec prisma migrate dev
```

Inicie o ambiente de desenvolvimento:

```bash
pnpm dev
```

A API ficara disponivel em:

```bash
http://localhost:8081
```

Para gerar build:

```bash
pnpm build
```

## Qualidade de codigo

O projeto utiliza TypeScript com compilacao e geracao do Prisma no processo de build:

```bash
pnpm build
```

Quando necessario, tambem e possivel regenerar o client manualmente:

```bash
pnpm exec prisma generate
```

## Repositorios relacionados

Este backend faz parte do ecossistema do projeto Fit.IA:

- Frontend web: `https://github.com/danielfeitoza/fit-ai-front`
- Smartwatch: `https://github.com/danielfeitoza/fit-ai-watch`

Se o repositorio do frontend tiver outro nome no GitHub, ajuste este link para o repositorio oficial.

## Estado atual

Este projeto representa um MVP funcional. Ele atende os principais fluxos propostos durante o bootcamp e ja sustenta a comunicacao entre aplicacao web, banco de dados, autenticacao e smartwatch.

Ainda assim, existem oportunidades claras de evolucao:

- ampliacao da cobertura de testes
- refinamento do tratamento de erros
- endurecimento de seguranca para integracoes com smartwatch
- evolucao da modelagem de progresso intra-treino
- melhoria de observabilidade e logs
- amadurecimento dos fluxos de IA

Mesmo como MVP, o projeto cumpriu bem o papel de consolidar pratica real de backend, integracao entre clientes diferentes e desenho de regras de negocio orientadas a produto.

## Autor

Desenvolvido por Daniel Feitoza durante o Bootcamp da Full Stack Club.
