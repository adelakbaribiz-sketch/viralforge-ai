# Multi-stage Dockerfile for ViralForge AI Web (Next.js 16)
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml* ./
COPY apps/web/package.json ./apps/web/
COPY packages/db/package.json ./packages/db/
COPY packages/ui/package.json ./packages/ui/
RUN npm i -g pnpm@9 && pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm i -g pnpm@9 && pnpm --filter web build

FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/package.json ./apps/web/package.json
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
USER nextjs
CMD ["node", "apps/web/server.js"]
