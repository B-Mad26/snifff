FROM node:22-alpine
RUN npm install -g pnpm@11
WORKDIR /app
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json turbo.json ./
COPY packages/ packages/
COPY apps/api/ apps/api/
RUN pnpm install --frozen-lockfile --filter @snifff/api...
RUN pnpm --filter @snifff/api prisma:generate
RUN pnpm --filter @snifff/api build
ENV NODE_ENV=production
EXPOSE 4000
CMD ["sh", "-c", "node node_modules/.bin/prisma migrate deploy --schema=apps/api/prisma/schema.prisma && node apps/api/dist/main.js"]
