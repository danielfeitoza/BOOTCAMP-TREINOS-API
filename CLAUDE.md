# CLAUDE.md

## Visão geral da aplicação

Esta aplicação é uma API em Node.js + TypeScript para um contexto de **treinos** (planos, dias, exercícios e sessões), com autenticação pronta via Better Auth e persistência em PostgreSQL via Prisma.

Hoje o projeto já tem:

- servidor HTTP com Fastify
- documentação OpenAPI (Swagger JSON + interface Scalar)
- endpoint de health/hello (`GET /`)
- proxy de autenticação em `GET/POST /api/auth/*`
- modelagem de domínio de treino no Prisma

## Arquitetura atual

### Camadas principais

1. **API/Servidor**
   - Arquivo principal: `src/index.ts`
   - Inicializa o Fastify, plugins de documentação, CORS e rotas.

2. **Autenticação**
   - Arquivo: `src/lib/auth.ts`
   - Instancia o Better Auth com adapter Prisma e plugins (`openAPI` e `dash`).
   - O servidor encaminha requisições `/api/auth/*` para o handler do Better Auth.

3. **Persistência / Banco**
   - Arquivo: `prisma/schema.prisma`
   - Define modelos de domínio e tabelas de autenticação.
   - Cliente Prisma é gerado em `src/generated/prisma`.

### Fluxo de requisição (alto nível)

- Requisições comuns (ex.: `GET /`) são tratadas diretamente pelo Fastify.
- Requisições de autenticação (`/api/auth/*`) passam por um adapter manual:
  - converte `FastifyRequest` em `Request` padrão Web Fetch API
  - chama `auth.handler(req)`
  - devolve status/headers/body para o cliente

Esse desenho isola a lógica de auth no Better Auth e mantém Fastify como gateway principal.

## Domínio de negócio modelado

No `prisma/schema.prisma`, o domínio principal está em:

- `WorkoutPlan`: plano de treino do usuário
- `WorkoutDay`: dia de treino/descanso com `weekday`
- `WorkoutExercise`: exercícios ordenados do dia
- `WorkoutSession`: execução real de um treino (início/fim)

Também existem entidades de autenticação:

- `User`
- `Session`
- `Account`
- `Verification`

Relações importantes:

- `User 1:N WorkoutPlan`
- `WorkoutPlan 1:N WorkoutDay`
- `WorkoutDay 1:N WorkoutExercise`
- `WorkoutDay 1:N WorkoutSession`
- `User 1:N Session` e `User 1:N Account`

## Bibliotecas usadas e papel de cada uma

## Runtime/API

- **fastify**
  - Framework HTTP de alta performance.
  - Papel aqui: criar servidor, registrar plugins, definir rotas e logging.

- **@fastify/cors**
  - Plugin CORS para Fastify.
  - Papel aqui: permitir origem `http://localhost:8081` e credenciais.

## Validação e tipagem de schema

- **zod**
  - Biblioteca de schema/validação com inferência de tipos TypeScript.
  - Papel aqui: definir schemas de resposta das rotas (ex.: `GET /`).

- **fastify-type-provider-zod**
  - Integra Zod com Fastify para validação e geração de schema.
  - Papel aqui:
    - `validatorCompiler` para validar input
    - `serializerCompiler` para serializar output
    - `jsonSchemaTransform` para transformar schemas Zod em OpenAPI

## Documentação da API

- **@fastify/swagger**
  - Gera especificação OpenAPI a partir das rotas.
  - Papel aqui: expor `app.swagger()` e base de documentação.

- **@scalar/fastify-api-reference**
  - UI moderna para explorar especificações OpenAPI.
  - Papel aqui: servir docs em `/docs`, agregando a spec da API e da auth.

- **@fastify/swagger-ui**
  - UI Swagger oficial para OpenAPI.
  - Papel no projeto: dependência instalada, mas atualmente comentada no código (não está em uso ativo).

## Autenticação

- **better-auth**
  - Solução de autenticação para apps TypeScript/JS.
  - Papel aqui: login com email/senha, sessões e rotas de auth.

- **better-auth/adapters/prisma**
  - Adapter oficial para persistir dados de auth via Prisma.
  - Papel aqui: conectar Better Auth ao banco PostgreSQL usando Prisma.

- **@better-auth/infra**
  - Extensões/plugins da stack Better Auth.
  - Papel aqui: plugin `dash()` habilitado junto ao `openAPI()`.

## Banco e ORM

- **prisma** (devDependency)
  - CLI e tooling de schema/migrations/generate.
  - Papel aqui: manter schema, gerar cliente e administrar banco no desenvolvimento.

- **@prisma/client**
  - Cliente ORM gerado para acesso tipado ao banco.
  - Papel aqui: usado em runtime para operações de banco e integração do auth.

- **@prisma/adapter-pg**
  - Adapter de driver PostgreSQL para Prisma Client (modo novo de driver adapter).
  - Papel aqui: conectar Prisma ao PostgreSQL com `DATABASE_URL`.

## Ambiente e produtividade

- **dotenv**
  - Carrega variáveis de ambiente de `.env`.
  - Papel aqui: disponibilizar `DATABASE_URL` e `PORT` no runtime e Prisma config.

- **tsx** (devDependency)
  - Runner TypeScript para desenvolvimento sem build manual.
  - Papel aqui: script `pnpm dev` com watch em `src/index.ts`.

- **typescript**
  - Tipagem estática e compilação TS.
  - Papel aqui: base da aplicação com `strict: true`.

- **eslint**, **@eslint/js**, **typescript-eslint**, **eslint-config-prettier**, **eslint-plugin-simple-import-sort**, **globals**
  - Qualidade de código (linting), consistência e ordenação de imports.
  - Papel aqui: regras de lint para JS/TS Node e imports ordenados.

- **prettier**
  - Formatação de código.
  - Papel aqui: padronizar estilo (integrado ao fluxo de lint/edição).

- **husky**
  - Hooks de Git.
  - Papel aqui: preparar automações locais (ex.: lint/test pre-commit), embora a configuração de hooks não esteja detalhada no repositório atual.

## Configurações importantes do projeto

- `package.json`
  - `type: "module"` (ESM)
  - `node: "24.x"`
  - script ativo: `pnpm dev`

- `tsconfig.json`
  - `module` e `moduleResolution`: `nodenext`
  - `target`: `es2024`
  - `strict: true`

- `prisma.config.ts`
  - aponta para `prisma/schema.prisma`
  - lê `DATABASE_URL` do ambiente

## Variáveis de ambiente esperadas

- `DATABASE_URL`: conexão PostgreSQL (obrigatória para Prisma/Auth)
- `PORT`: porta HTTP (opcional, fallback para `8081`)

## Endpoints relevantes hoje

- `GET /` → resposta simples de teste
- `GET /swagger.json` → schema OpenAPI da API
- `GET /docs` → interface Scalar com documentação
- `GET/POST /api/auth/*` → endpoints do Better Auth proxied pelo Fastify

## Pontos de atenção importantes

1. **CORS vs origem de frontend**
   - CORS está com `http://localhost:8081`, enquanto `trustedOrigins` do auth está em `http://localhost:3000`.
   - Em integração real de frontend, alinhar essas origens evita erro de sessão/cookie.

2. **Origem/proxy em auth**
   - Há leitura de `x-forwarded-proto` e `x-forwarded-host` para compor URL.
   - Em deploy com reverse proxy (Nginx, Vercel, etc.), isso é essencial para callbacks corretos.

3. **Migrations ainda não versionadas**
   - A pasta `prisma/migrations` ainda não existe no estado atual.
   - O schema está definido, mas o histórico de migration precisa ser criado/aplicado no banco.

4. **Swagger UI não ativo**
   - Dependência instalada, porém comentada.
   - O projeto está usando Scalar como interface principal de documentação.

## Como rodar (resumo)

1. Criar/ajustar `.env` com `DATABASE_URL` (e opcionalmente `PORT`)
2. Instalar deps: `pnpm install`
3. Subir API: `pnpm dev`
4. Abrir docs em `/docs`

## Resumo executivo

A base está bem montada para evoluir rapidamente: Fastify + Zod + OpenAPI para API, Better Auth para autenticação, e Prisma/PostgreSQL para persistência com tipagem forte. O próximo passo natural é criar as migrations iniciais e começar a expor rotas de domínio de treino (CRUD de planos/dias/exercícios) reutilizando o padrão de validação já adotado.
