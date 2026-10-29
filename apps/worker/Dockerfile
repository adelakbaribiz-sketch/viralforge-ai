# Dockerfile for ViralForge Worker (BullMQ + Remotion + FFmpeg)
# FFmpeg is required for audio mix/normalize/burn-in. Chromium is required for Remotion.
FROM node:20-alpine AS base
WORKDIR /app

# Install ffmpeg + Chromium + fonts for Remotion
RUN apk add --no-cache \
    ffmpeg \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    font-noto-emoji \
    font-noto \
    font-vazirmatn \
    && rm -rf /var/cache/apk/*

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV REMOTION_COMPOSITION_RENDER_BINARY=/usr/bin/chromium-browser

FROM base AS deps
COPY package.json pnpm-lock.yaml* ./
COPY apps/worker/package.json ./apps/worker/
COPY packages/db/package.json ./packages/db/
COPY packages/ai/package.json ./packages/ai/
COPY packages/video/package.json ./packages/video/
RUN npm i -g pnpm@9 && pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm i -g pnpm@9 && pnpm --filter @viralforge/worker build

FROM base AS runner
ENV NODE_ENV=production
RUN addgroup -g 1001 -S nodejs && adduser -S worker -u 1001
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/worker/dist ./apps/worker/dist
COPY --from=builder /app/apps/worker/package.json ./apps/worker/package.json
USER worker
CMD ["node", "apps/worker/dist/index.js"]
