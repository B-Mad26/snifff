FROM node:22-alpine AS base
RUN npm install -g pnpm@11
WORKDIR /app
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json turbo.json ./
COPY packages/ packages/
COPY apps/api/ apps/api/

FROM base AS deps
RUN pnpm install --frozen-lockfile --filter @snifff/api...

FROM deps AS builder
RUN pnpm --filter @snifff/api prisma:generate
RUN pnpm --filter @snifff/api build

FROM node:22-alpine AS runner
RUN npm install -g pnpm@11
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY apps/api/package.json ./apps/api/package.json
COPY packages/ packages/

ENV NODE_ENV=production
EXPOSE 4000

CMD ["sh", "-c", "node node_modules/.bin/prisma migrate deploy --schema=apps/api/prisma/schema.prisma && node apps/api/dist/main.js"]
