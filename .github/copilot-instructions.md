# Copilot Instructions (Projeto Treinos API)

## Contexto do projeto

- API Node.js com TypeScript.
- Framework HTTP: Fastify.
- Validação e schema: Zod + fastify-type-provider-zod.
- Persistência: Prisma + PostgreSQL.
- Autenticação: Better Auth com rotas proxied em `/api/auth/*`.
- Módulo ESM (`type: module`) e TS estrito (`strict: true`).
- Organização atual por camadas: `src/routes`, `src/schemas`, `src/usecases`, `src/lib`, `src/erros`.

## Objetivo dessas regras

Sempre priorizar implementações simples, seguras, tipadas e consistentes com o padrão atual do repositório.

## Regras obrigatórias

1. Não alterar arquitetura sem necessidade.
2. Preferir mudanças pequenas e focadas no pedido do usuário.
3. Não criar arquivos/componentes extras sem necessidade explícita.
4. Não incluir comentários inline no código, a menos que seja solicitado.
5. Não renomear símbolos públicos sem motivo funcional claro.
6. Manter compatibilidade com ESM e TypeScript estrito.
7. Ao editar, preservar estilo e convenções já existentes no projeto.
8. Não editar manualmente arquivos em `src/generated/prisma`; qualquer ajuste deve partir de `prisma/schema.prisma` + geração do client.
9. Preservar padrão de erro de API no formato `{ error, code }`.
10. Evitar lógica de negócio em rotas; manter orquestração em `usecases`.

## Regras de Git

- Mensagens de commit devem seguir Conventional Commits (`feat:`, `fix:`, `docs:`, etc.).
- Nunca criar commit sem solicitação explícita do usuário.

## Regras de API (Fastify)

- Registrar rotas usando o padrão já existente no servidor.
- Seguir princípios REST para naming e semântica de rotas.
- Rotas de domínio devem ficar em `src/routes` e ser registradas no `src/index.ts` com `prefix` explícito.
- Usar `withTypeProvider<ZodTypeProvider>()` nas rotas com schema Zod.
- Sempre tipar request/response com Zod quando houver entrada/saída estruturada.
- Respostas devem ser consistentes em formato e códigos HTTP.
- Em endpoints de criação, preferir retorno `201` com payload criado.
- Preservar documentação em `/swagger.json` e `/docs` ao alterar servidor/rotas.
- Incluir `tags` e `summary` no schema da rota para documentação OpenAPI.
- Rotas devem instanciar e chamar um use case para executar regras de negócio.
- Rotas devem tratar erros lançados pelo use case e mapear para status HTTP apropriado.

## Regras de validação (Zod)

- Toda entrada externa (params, query, body) deve ser validada.
- Toda resposta estruturada deve ter schema de resposta quando aplicável.
- Mensagens de erro devem ser claras e úteis para o consumidor da API.
- Reutilizar schemas centralizados em `src/schemas` e derivar variações com `omit/pick/extend` quando possível.
- Para enums de domínio mapeados no Prisma, reutilizar enums gerados (ex.: `Weekday`).
- Sempre que houver campo `weekday` em schema Zod, usar `z.enum(Weekday)` importado de `src/generated/prisma/enums` (não usar `z.string()` para dia da semana).

## Regras de banco (Prisma)

- Modelagem deve respeitar o domínio existente (`WorkoutPlan`, `WorkoutDay`, `WorkoutExercise`, `WorkoutSession`).
- Não quebrar relações existentes sem solicitação explícita.
- Em mudanças de schema, sugerir/considerar migration correspondente.
- Evitar consultas N+1 quando possível.
- Em operações dependentes (ex.: desativar plano anterior + criar novo), usar transação (`prisma.$transaction`).
- Preservar regra de negócio atual: apenas um `WorkoutPlan` ativo por usuário.
- Usar o client centralizado em `src/lib/db.ts`.

## Regras de Use Cases

- Use cases devem ficar em `src/usecases` e ser implementados como classes com método `execute`.
- O nome do use case deve representar uma ação (verbo).
- Quando houver entrada estruturada, usar interface DTO de entrada no mesmo arquivo (`InputDto` ou nome equivalente).
- O retorno do use case deve ser tipado por interface DTO de saída no mesmo arquivo (`OutputDto` ou nome equivalente).
- Não retornar model Prisma diretamente quando isso acoplar a camada de negócio ao banco; mapear para DTO de saída.
- Use case não deve fazer `try/catch` para resposta HTTP; exceções são tratadas na rota.
- Ao lançar erro de domínio, usar classes de erro em `src/erros`.

## Regras de autenticação

- Não contornar o fluxo do Better Auth.
- Rotas protegidas devem validar sessão/usuário autenticado.
- Preservar comportamento de proxy em `/api/auth/*`.
- Considerar `trustedOrigins` e CORS ao propor integração com frontend.
- Em rotas protegidas Fastify, seguir padrão atual de sessão: `auth.api.getSession({ headers: fromNodeHeaders(request.headers) })`.
- Se sessão ausente, responder `401` com payload de erro padronizado.

## Regras de erros e observabilidade

- Tratar erros com códigos HTTP corretos (`400`, `401`, `403`, `404`, `409`, `422`, `500`).
- Não vazar detalhes sensíveis de exceções para o cliente.
- Logs devem ajudar debug, sem expor segredo/token.
- Erros de domínio devem ser representados por classes em `src/erros` quando fizer sentido.
- Para falhas inesperadas, retornar mensagem genérica e manter detalhes apenas no log.

## Regras de qualidade

- Priorizar legibilidade e simplicidade.
- Evitar duplicação; reutilizar utilitários existentes.
- Se houver testes no escopo afetado, atualizar/adicionar de forma pontual.
- Não corrigir problemas não relacionados ao pedido, mas mencionar achados relevantes.
- Respeitar ordenação de imports e regras de lint existentes.
- Evitar `any`; preferir tipagem explícita e inferência segura.
- Preferir named exports em vez de default exports, salvo necessidade clara.
- Ao receber mais de 2 parâmetros em função/método, preferir objeto como argumento.

## Regras de resposta do assistente

Ao implementar mudanças, o assistente deve:

1. Informar resumidamente o que foi alterado.
2. Referenciar arquivos modificados.
3. Informar validações executadas (lint/test/build), quando aplicável.
4. Citar riscos ou pendências curtas, se houver.
5. Sugerir próximo passo objetivo.
6. Quando não houver script de validação disponível para uma checagem, declarar explicitamente a limitação.

## MCPs

- **SEMPRE** usar Context7 para buscar documentações.
- **SEMPRE** validar se a implementação está de acordo com a documentação, considerando compatibilidade com as versões usadas na aplicação.

## Preferências de estilo

- Nomes claros e descritivos.
- Evitar variáveis de uma letra.
- Funções curtas, com responsabilidade única.
- Retorno antecipado quando melhora legibilidade.
- Preferir `interface` em vez de `type` quando a modelagem permitir.
- Usar `camelCase` para variáveis/funções/métodos e `PascalCase` para classes.
- Manter `kebab-case` em nomes de arquivo; exceção: arquivos de use case em `PascalCase`.

## Fora de escopo por padrão

- Refatoração ampla sem pedido explícito.
- Mudança visual/UX (este repositório é API).
- Troca de stack, libs centrais ou padrão arquitetural sem aprovação.
