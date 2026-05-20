# Multi-stage Dockerfile for @snifff/api
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app

# 1. Install workspace deps
FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json ./
COPY apps/api/package.json apps/api/
COPY packages/shared/package.json packages/shared/
RUN pnpm install --frozen-lockfile

# 2. Build
FROM deps AS build
COPY . .
RUN pnpm --filter @snifff/api prisma:generate
RUN pnpm --filter @snifff/api build

# 3. Runtime
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/apps/api/dist          ./apps/api/dist
COPY --from=build /app/apps/api/prisma        ./apps/api/prisma
COPY --from=build /app/apps/api/node_modules  ./apps/api/node_modules
COPY --from=build /app/node_modules           ./node_modules
COPY --from=build /app/apps/api/package.json  ./apps/api/package.json
EXPOSE 4000
WORKDIR /app/apps/api
CMD ["node", "dist/main.js"]
