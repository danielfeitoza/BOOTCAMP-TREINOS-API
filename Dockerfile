FROM node:24-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable && corepack prepare pnpm@10.30.0 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

# ------ Dependencies ------
FROM base AS deps

# Instala todas as dependências (incluindo devDependencies) para build
RUN pnpm install --frozen-lockfile

# ------ Build ------
FROM deps AS build

COPY . .

RUN pnpm run build && cp -r src/generated dist/generated

# ------ Production ------
FROM node:24-slim AS production

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable && corepack prepare pnpm@10.30.0 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

# Instala apenas dependências de produção
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

COPY --from=build /app/dist ./dist
COPY --from=build /app/dist/generated ./dist/generated

CMD ["node", "dist/index.js"]

# Multi-stage build