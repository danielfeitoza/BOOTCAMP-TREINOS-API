# Copilot Instructions (Projeto Treinos API)

## Contexto do projeto

- API Node.js com TypeScript.
- Framework HTTP: Fastify.
- Validação e schema: Zod + fastify-type-provider-zod.
- Persistência: Prisma + PostgreSQL.
- Autenticação: Better Auth com rotas proxied em `/api/auth/*`.
- Módulo ESM (`type: module`) e TS estrito (`strict: true`).

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

## Regras de API (Fastify)

- Registrar rotas usando o padrão já existente no servidor.
- Sempre tipar request/response com Zod quando houver entrada/saída estruturada.
- Respostas devem ser consistentes em formato e códigos HTTP.
- Evitar lógica de negócio pesada no arquivo principal da API.
- Se necessário, extrair responsabilidades para módulos em `src/` mantendo organização por domínio.

## Regras de validação (Zod)

- Toda entrada externa (params, query, body) deve ser validada.
- Toda resposta estruturada deve ter schema de resposta quando aplicável.
- Mensagens de erro devem ser claras e úteis para o consumidor da API.

## Regras de banco (Prisma)

- Modelagem deve respeitar o domínio existente (`WorkoutPlan`, `WorkoutDay`, `WorkoutExercise`, `WorkoutSession`).
- Não quebrar relações existentes sem solicitação explícita.
- Em mudanças de schema, sugerir/considerar migration correspondente.
- Evitar consultas N+1 quando possível.

## Regras de autenticação

- Não contornar o fluxo do Better Auth.
- Rotas protegidas devem validar sessão/usuário autenticado.
- Preservar comportamento de proxy em `/api/auth/*`.
- Considerar `trustedOrigins` e CORS ao propor integração com frontend.

## Regras de erros e observabilidade

- Tratar erros com códigos HTTP corretos (`400`, `401`, `403`, `404`, `409`, `422`, `500`).
- Não vazar detalhes sensíveis de exceções para o cliente.
- Logs devem ajudar debug, sem expor segredo/token.

## Regras de qualidade

- Priorizar legibilidade e simplicidade.
- Evitar duplicação; reutilizar utilitários existentes.
- Se houver testes no escopo afetado, atualizar/adicionar de forma pontual.
- Não corrigir problemas não relacionados ao pedido, mas mencionar achados relevantes.

## Regras de resposta do assistente

Ao implementar mudanças, o assistente deve:

1. Informar resumidamente o que foi alterado.
2. Referenciar arquivos modificados.
3. Informar validações executadas (lint/test/build), quando aplicável.
4. Citar riscos ou pendências curtas, se houver.
5. Sugerir próximo passo objetivo.

## Preferências de estilo

- Nomes claros e descritivos.
- Evitar variáveis de uma letra.
- Funções curtas, com responsabilidade única.
- Retorno antecipado quando melhora legibilidade.

## Fora de escopo por padrão

- Refatoração ampla sem pedido explícito.
- Mudança visual/UX (este repositório é API).
- Troca de stack, libs centrais ou padrão arquitetural sem aprovação.
