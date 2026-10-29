# ViralForge AI

> Cinematic AI video studio for teams that ship daily.
>
> ViralForge turns a one-paragraph brief into a finished short-form video —
> script, scenes, voiceover, captions, music, and final render — in 9:16, 1:1,
> or 16:9. No editing skills, no timeline, no Make.com or n8n glue — just your
> own orchestration layer on PostgreSQL, Redis, BullMQ, and Remotion.

---

## ✨ What it is

ViralForge AI is a multi-tenant SaaS platform that generates short-form viral
videos for customers and businesses. The user provides a brief — topic,
category, audience, language, tone, duration, aspect ratio, CTA — and the
platform creates the script, scenes, voiceover, captions, music, and final
video. The user can regenerate any scene, edit captions, and export.

**Outputs**: MP4 vertical 9:16, square 1:1, horizontal 16:9, with burned-in
captions and an AI-disclosure bumper. Each organization has its own space,
brand kit, credit balance, and render history.

### What we optimize for — and what we never claim

We optimize for **Hook, Retention, and Caption** — the parts you can control.
We **never** claim "guaranteed virality," "guaranteed views," or "guaranteed
YouTube income." Fully automated channels can only be monetized if they meet
AdSense, copyright, and quality standards. The product must not promise income.

---

## 🏗 Architecture

```
Browser/Mobile Web (Next.js 16, dark theme)
        │
        ▼
API Layer / BFF  ──  Auth, RBAC, Projects, Billing, Credits, SSE progress
        │
        ├──────────────────────────────────────────────┐
        ▼                                              ▼
   PostgreSQL 16                              Redis 7 + BullMQ
   (Prisma, RLS)                              (5 queues, DLQ, retries)
        │                                              │
        ▼                                              ▼
   S3 / MinIO  ◀──────────────────────  Worker Pool
   (assets, outputs)   ┌───────────────────────────────────┐
                       │ ScriptWorker  → LLM script          │
                       │ AssetWorker   → AI video/image/stock │
                       │ VoiceWorker   → TTS + timestamps    │
                       │ RenderWorker  → Remotion + FFmpeg   │
                       │ QCWorker      → safety + copyright  │
                       └───────────────────────────────────┘
                                       │
                                       ▼
                            AI Provider Gateway
                            (rate limit · cost meter · circuit breaker · fallback)
                                       │
                                       ▼
                  OpenAI · Anthropic · Gemini · ElevenLabs · Runway · Pika ·
                  Luma · Kling · Hailuo · Veo · Storyblocks · Pexels · Pixabay
```

### Pipeline state machine

```
DRAFT → QUEUED → SCRIPTING → ASSET_PLANNING → ASSET_GENERATION → VOICEOVER
       → CAPTION_SYNC → ASSEMBLING → RENDERING → QC → COMPLETED
                                                       └→ FAILED
```

Each step runs in its own BullMQ queue with exponential backoff retry,
dead-letter queue, and idempotency keys. Progress updates flow to the
frontend over SSE.

---

## 📦 Monorepo structure

```
viralforge-ai/
├── apps/
│   ├── web/          Next.js 16 App Router + shadcn/ui (this is the dark-first UI)
│   ├── api/          Fastify API (auth, RBAC, projects, billing, SSE)
│   └── worker/       BullMQ workers + Remotion renderer + FFmpeg
├── packages/
│   ├── db/           Prisma schema + client + tenant middleware + credit ledger
│   ├── ai/           Internal AI provider gateway (circuit breaker, fallback)
│   ├── video/        Remotion compositions + FFmpeg helpers + QC utilities
│   ├── ui/           Shared shadcn/ui components
│   └── config/       Shared eslint, tsconfig, tailwind config
├── docker-compose.yml
├── .env.example
├── .github/workflows/ci.yml
└── README.md
```

---

## 🚀 Quick start (local)

### Prerequisites
- Node.js 20+
- pnpm 9+
- Docker & Docker Compose (for PostgreSQL, Redis, MinIO)

### Steps

```bash
# 1. Clone & install
git clone https://github.com/YOUR_USERNAME/viralforge-ai.git
cd viralforge-ai
pnpm install

# 2. Configure environment
cp .env.example .env
# Edit .env — at minimum set AUTH_SECRET (openssl rand -hex 32)

# 3. Boot dependencies
docker compose up -d postgres redis minio minio-init

# 4. Initialize the database
pnpm --filter @viralforge/db db:migrate
pnpm --filter @viralforge/db db:seed

# 5. Run the apps (in separate terminals)
pnpm --filter web dev           # http://localhost:3000
pnpm --filter @viralforge/api dev   # http://localhost:4000
pnpm --filter @viralforge/worker dev
```

### Or run everything with Docker

```bash
docker compose up -d
```

---

## 🎨 UI / UX

### Dark-first, premium, cinematic
- **OKLCH color tokens** (see `apps/web/src/app/globals.css`):
  - `background` `oklch(0.14 0.02 260)` — cinematic dark base
  - `primary`   `oklch(0.72 0.20 155)` — soft neon green
  - `accent`    `oklch(0.70 0.24 295)` — cinematic purple
  - `warning`   `oklch(0.80 0.16 85)`
  - `danger`    `oklch(0.65 0.22 25)`
- **No flash of light theme on first load** — inline script in `<head>` sets `class="dark"` before paint.
- **RTL + LTR** — full Persian (فارسی) and Arabic (العربية) RTL support via `dir` attribute; English LTR by default.
- **Mobile-first** for the video creation page; responsive across the app.
- **Accessibility** — semantic HTML, ARIA labels, keyboard navigation, `prefers-reduced-motion` honored. Target Lighthouse a11y ≥ 90.
- **Stack** — Tailwind CSS v4, shadcn/ui, Radix, Motion (framer-motion), Lucide, Sonner.

### Main pages
| Page              | Description                                                          |
|-------------------|----------------------------------------------------------------------|
| Landing           | Dark hero, demo previews, categories, pricing, CTA                   |
| Dashboard         | Credit meter, recent jobs, usage chart, quick actions                |
| Create Wizard     | 5 steps: category → brief → script → voice/style → confirm & render |
| Project Detail    | Vertical preview, scene list, regenerate, caption editor, live status|
| Templates         | Gallery with category filter & "Use template"                        |
| Brand Kit         | Logo, colors, fonts, intro/outro, watermark, default music           |
| Billing           | Plan, credits, ledger, invoices, upgrade                             |
| Settings          | Team (RBAC), API keys, webhooks, security, audit log                 |
| Admin             | Organizations, jobs, provider costs, moderation queue                |

---

## 💳 Billing & Credits

### Plans
| Plan     | Price  | Credits | Resolution | Seats | Notes                       |
|----------|--------|---------|------------|-------|------------------------------|
| Free     | $0     | 30      | 720p + WM  | 1     | Watermark                    |
| Creator  | $19    | 300     | 1080p      | 1     | No watermark                 |
| Pro      | $49    | 900     | 1080p      | 3     | Priority queue, voice clone  |
| Business | $149   | 3,000   | 4K         | 10    | API + webhooks               |
| Agency   | $399   | 9,000   | 4K         | 25    | White-label, SLA             |

### Credit unit economics
- **1 credit = 1 second of 720p video with a standard model.**
- 1080p = 2×, 4K = 4×.
- Premium models (Luma, Kling, Veo, Runway Gen-4.5) = 2–4× multiplier.
- Approx provider cost per 720p second (Oct 2026): Pika $0.04, Hailuo $0.047, Runway Gen-4 Turbo $0.05, Luma $0.06, Kling $0.084, Veo $0.10, Runway Gen-4.5 $0.12.

### Credit ledger
- **Append-only, double-entry.** Never updated, never deleted.
- `Organization.credits` is recomputed atomically in every transaction.
- `SELECT ... FOR UPDATE` guarantees balance correctness under concurrency.
- All operations go through `packages/db/src/credits.ts`:
  - `grantCredits` (subscription, top-up, trial bonus)
  - `reserveCredits` (deduct before render)
  - `settleJobCredits` (final cost on completion)
  - `refundCredits` (release reservation on failure)

### Stripe
- Checkout + Customer Portal + idempotent webhook.
- Webhook events stored by `event.id` in `stripe_events` table.
- Re-deliveries are no-ops.
- Signature verification mandatory.

---

## 🛡 Multi-tenancy, security, and moderation

### Tenant isolation (defense in depth)
1. **Application layer** — every API route enforces `organizationId` from the auth session.
2. **Prisma middleware** (`packages/db/src/index.ts`) — auto-injects `organizationId` into all queries on tenant-scoped models.
3. **PostgreSQL RLS** — `packages/db/migrations/rls.sql` enforces row-level security at the DB level.

### RBAC
- `OWNER` (full) · `ADMIN` (members, billing) · `EDITOR` (create/edit projects) · `VIEWER` (read-only).

### Auth
- Better Auth with email/password + SSO (SAML/OIDC for Business+).
- Secure session tokens, 2FA optional.
- Sessions table with IP + user agent tracking.

### Moderation
- **Pre-generation**: text moderation (OpenAI Moderation API) blocks forbidden phrases including "guaranteed virality" and "guaranteed income."
- **Post-generation**: visual moderation via Google SafeSearch.
- **Copyright**: perceptual-hash matching against known-copyright registry; > 0.85 similarity → human review.
- **AI disclosure**: every export ends with an "AI-generated with ViralForge AI" bumper (compliant with YouTube's 2024 policy + EU AI Act).

### Audit log
- Every sensitive action: plan change, project delete, member role change, admin access, API key revocation.

### Secrets
- Only in `.env`. **Never committed** — `.gitignore` excludes `.env`, `uploads/`, `*.mp4`, etc.
- CI secrets-scan job blocks any merge that introduces an env file or API key.

---

## 🔌 AI Provider Gateway

A single adapter (`packages/ai`) for every AI provider. Each call goes through:

1. **Rate limit** (per org + provider, token bucket)
2. **Circuit breaker** (per provider; 5% error rate over 1 min → 30s trip)
3. **Retry** with exponential backoff (idempotency-key aware)
4. **Cost metering** (per-request, persisted to `ProviderUsage`)
5. **Fallback chain** (premium → standard → stock → animated text)

| Category | Providers                                                       |
|----------|----------------------------------------------------------------|
| LLM      | OpenAI GPT-4o, Anthropic Claude 3.5, Google Gemini 1.5         |
| TTS      | ElevenLabs Flash + Multilingual v2, OpenAI TTS                |
| Video    | Runway Gen-4 Turbo/Gen-4.5, Pika 2.5, Luma, Kling, Hailuo, Veo|
| Image    | Imagen 3, DALL-E 3, Flux Pro / Schnell                         |
| Stock    | Storyblocks, Pexels, Pixabay (licensed only)                  |

---

## 🎬 Video pipeline

### Scripting
- LLM produces structured JSON (hook, scenes[], voiceover, captions, CTA).
- Validated with **Zod** — invalid output triggers retry.
- Prompt template based on viral data: Direct Address, Intrigue, Question, Shock/Surprise, Question Opener. ~80% of viral clips use captions.

### Asset planning & generation
- Per-scene decision: AI_VIDEO, AI_IMAGE, STOCK, TEXT, or MIXED.
- Parallel generation with concurrency limits per provider.
- Cache by prompt hash + model (re-renders of the same prompt = 0 credits).
- Fallback: if expensive model fails, cheaper model or stock.

### Voiceover (TTS)
- ElevenLabs Flash for speed/cost; Multilingual v2 for quality and Persian/Arabic.
- Word-level timestamps stored for caption sync.
- Audio normalized to **−14 LUFS** in the render step.

### Caption sync
- SRT/ASS generated from word timestamps.
- Burned in with FFmpeg; safe zone enforced for 9:16 (avoids TikTok/Reels UI overlays).
- Persian/Arabic RTL handled correctly in Remotion + FFmpeg.

### Render
- **Remotion** composition per template.
- **FFmpeg** for audio mix, music ducking (−12 dB under voice), concatenate, encode.
- Output: 720p / 1080p / 4K, H.264 + AAC, faststart.
- Watermark on Free plan.

### QC
- Duration ±2s check, black frame detection, audio level check, caption safe zone check.
- Content safety + copyright check.
- AI disclosure bumper presence verification.
- On fail: retry or dead-letter; refund reserved credits.

---

## 🚫 Prohibited: no-code automation

ViralForge AI **does not use** Make.com, n8n, Zapier, or any no-code
automation platform. All orchestration is implemented in TypeScript with
BullMQ + Redis + PostgreSQL. The CI secrets-scan job blocks any PR that
introduces a reference to these platforms.

---

## 🧪 Testing & CI

GitHub Actions (`.github/workflows/ci.yml`):
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build` (web + api + worker)
- `prisma validate`
- Docker image build (smoke test)
- Secrets scan (no env files, no API keys, no Make/n8n/Zapier references)

---

## 🚢 Deployment

### Local
`docker compose up -d` brings up Postgres, Redis, MinIO, web, api, worker.

### Production
- **Kubernetes** or **AWS ECS** (recommended).
- Worker pool auto-scales based on queue depth.
- Postgres: managed (RDS / Cloud SQL).
- Redis: managed (ElastiCache / Memorystore).
- Storage: S3 / R2.
- AI provider keys: Vault / Doppler / Secrets Manager — never in git.
- Observability: Sentry (errors) + OpenTelemetry (traces) + Prometheus/Grafana (metrics) + Bull Board (queue admin).

---

## 📋 Environment variables

See [`.env.example`](.env.example) for the full list. Key ones:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | yes | PostgreSQL connection string |
| `REDIS_URL` | yes | Redis connection for BullMQ |
| `S3_ENDPOINT` / `S3_BUCKET` / `S3_ACCESS_KEY` / `S3_SECRET_KEY` | yes | S3/MinIO config |
| `AUTH_SECRET` | yes | 32-byte hex; `openssl rand -hex 32` |
| `STRIPE_SECRET_KEY` | yes | Stripe billing |
| `STRIPE_WEBHOOK_SECRET` | yes | Stripe webhook signature verification |
| `OPENAI_API_KEY` | one of | LLM + TTS fallback |
| `ELEVENLABS_API_KEY` | recommended | TTS |
| `RUNWAY_API_KEY` / `PIKA_API_KEY` / `LUMA_API_KEY` / `KLING_API_KEY` / `HAILUO_API_KEY` | one of | Video generation |
| `STORYBLOCKS_API_KEY` | recommended | Stock footage + music |

---

## ⚠️ Limitations & Phase 1 scope

**In scope (Phase 1)**: dashboard, video creation wizard, template gallery, brand kit, voice library, render queue, preview, download, billing, admin panel, multi-tenancy, credit system, render queue with retry + DLQ, live progress, model adapters, content safety, copyright compliance.

**Out of scope (Phase 1)**:
- Professional multi-layer timeline editor.
- Direct publishing to YouTube/TikTok.
- Training a proprietary video model from scratch.
- **Guaranteeing virality** — we don't, and never will.

---

## 📄 License

Proprietary. © 2026 ViralForge AI. All rights reserved.

## 🤝 Contributing

Internal team only. See `CONTRIBUTING.md` for branching strategy and PR template.

---

<p align="center">
  <em>Optimized for Hook, Retention &amp; Caption. Never promised.</em>
</p>
