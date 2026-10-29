# Dockerfile for ViralForge API (Fastify)
FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml* ./
COPY apps/api/package.json ./apps/api/
COPY packages/db/package.json ./packages/db/
COPY packages/ai/package.json ./packages/ai/
RUN npm i -g pnpm@9 && pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm i -g pnpm@9 && pnpm --filter @viralforge/api build

FROM base AS runner
ENV NODE_ENV=production
RUN addgroup -g 1001 -S nodejs && adduser -S api -u 1001
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
EXPOSE 4000
USER api
CMD ["node", "apps/api/dist/index.js"]
