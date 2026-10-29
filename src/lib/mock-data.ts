/**
 * ViralForge AI — Shared types & mock data for the demo experience.
 *
 * In production these types live in packages/db and the data comes from
 * the PostgreSQL-backed API. Here we provide a rich, realistic dataset so
 * the UI demonstrates real product flows: dashboard, wizard, render queue,
 * project detail, brand kit, billing, and admin.
 */

export type View =
  | "landing"
  | "dashboard"
  | "create"
  | "project"
  | "templates"
  | "brandkit"
  | "billing"
  | "settings"
  | "admin";

export type Language = "en" | "fa" | "es" | "fr" | "de" | "ar" | "tr";
export type AspectRatio = "9:16" | "1:1" | "16:9";
export type Plan = "Free" | "Creator" | "Pro" | "Business" | "Agency";

export type ProjectStatus =
  | "DRAFT"
  | "QUEUED"
  | "SCRIPTING"
  | "ASSET_PLANNING"
  | "ASSET_GENERATION"
  | "VOICEOVER"
  | "CAPTION_SYNC"
  | "ASSEMBLING"
  | "RENDERING"
  | "QC"
  | "COMPLETED"
  | "FAILED";

export type SceneAssetType = "AI_VIDEO" | "AI_IMAGE" | "STOCK" | "TEXT" | "MIXED";

export interface Scene {
  id: string;
  index: number;
  scriptText: string;
  visualPrompt: string;
  assetType: SceneAssetType;
  startMs: number;
  endMs: number;
  caption: string;
  status: "ready" | "regenerating" | "failed";
  thumbnail: string; // gradient identifier
  provider: string;
}

export interface RenderJob {
  id: string;
  projectId: string;
  projectTitle: string;
  status: ProjectStatus;
  progress: number;
  aspectRatio: AspectRatio;
  durationSec: number;
  resolution: "720p" | "1080p" | "4K";
  model: string;
  estimatedCostCredits: number;
  actualCostCredits: number | null;
  createdAt: string;
  completedAt: string | null;
  error: string | null;
  thumbnail: string;
  category: string;
}

export interface CreditLedgerEntry {
  id: string;
  delta: number;
  reason: "subscription_grant" | "render_spend" | "render_refund" | "topup" | "adjustment" | "trial_bonus";
  refId: string;
  balanceAfter: number;
  createdAt: string;
}

export interface Invoice {
  id: string;
  number: string;
  amount: number;
  currency: string;
  status: "paid" | "open" | "void";
  period: string;
  date: string;
  url: string;
}

export interface Template {
  id: string;
  category: string;
  name: string;
  description: string;
  config: string;
  isPublic: boolean;
  uses: number;
  gradient: string;
  hook: string;
  scenes: number;
  duration: number;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "OWNER" | "ADMIN" | "EDITOR" | "VIEWER";
  avatar: string;
  lastActive: string;
}

export interface AdminOrg {
  id: string;
  name: string;
  slug: string;
  plan: Plan;
  credits: number;
  members: number;
  jobs: number;
  createdAt: string;
  status: "active" | "suspended" | "trialing";
}

export interface AdminProviderUsage {
  provider: string;
  category: "LLM" | "TTS" | "Video" | "Image" | "Stock";
  calls: number;
  costUsd: number;
  avgLatencyMs: number;
  errorRate: number;
  trend: "up" | "down" | "flat";
}

export interface AdminModerationItem {
  id: string;
  type: "text" | "image" | "video" | "music";
  reason: string;
  status: "pending" | "approved" | "blocked" | "flagged";
  orgName: string;
  createdAt: string;
  preview: string;
}

/* ===========================================================
   Pricing plans — exact match to product spec
   =========================================================== */
export interface PricingPlan {
  id: Plan;
  price: number;
  credits: number;
  resolution: "720p" | "1080p" | "4K";
  watermark: boolean;
  seats: number | string;
  features: string[];
  highlight: boolean;
  cta: string;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "Free",
    price: 0,
    credits: 30,
    resolution: "720p",
    watermark: true,
    seats: 1,
    features: ["30 credits / month", "720p output", "Watermark", "5 templates", "Community support"],
    highlight: false,
    cta: "Start free",
  },
  {
    id: "Creator",
    price: 19,
    credits: 300,
    resolution: "1080p",
    watermark: false,
    seats: 1,
    features: [
      "300 credits / month",
      "1080p, no watermark",
      "All 20+ templates",
      "Standard queue",
      "Email support",
    ],
    highlight: false,
    cta: "Choose Creator",
  },
  {
    id: "Pro",
    price: 49,
    credits: 900,
    resolution: "1080p",
    watermark: false,
    seats: 3,
    features: [
      "900 credits / month",
      "1080p, priority queue",
      "Voice clone + brand kit",
      "3 seats",
      "Priority support",
    ],
    highlight: true,
    cta: "Choose Pro",
  },
  {
    id: "Business",
    price: 149,
    credits: 3000,
    resolution: "4K",
    watermark: false,
    seats: 10,
    features: [
      "3000 credits / month",
      "4K output",
      "API access",
      "Custom templates + webhook",
      "10 seats",
    ],
    highlight: false,
    cta: "Choose Business",
  },
  {
    id: "Agency",
    price: 399,
    credits: 9000,
    resolution: "4K",
    watermark: false,
    seats: 25,
    features: [
      "9000 credits / month",
      "4K, white-label",
      "Subdomain + SLA",
      "25 seats",
      "Dedicated manager",
    ],
    highlight: false,
    cta: "Talk to sales",
  },
];

/* ===========================================================
   Categories
   =========================================================== */
export interface Category {
  id: string;
  label: string;
  description: string;
  emoji: string;
  gradient: string;
  uses: number;
}

export const CATEGORIES: Category[] = [
  { id: "news", label: "Automated News", description: "Daily news with AI voice and imagery.", emoji: "📰", gradient: "from-sky-500/40 to-indigo-600/30", uses: 12480 },
  { id: "article", label: "Article → Video", description: "Turn Wikipedia or blog posts into video.", emoji: "📖", gradient: "from-emerald-500/40 to-teal-600/30", uses: 8210 },
  { id: "motivation", label: "Motivational", description: "Quotes with calm music and nature imagery.", emoji: "🌅", gradient: "from-amber-500/40 to-orange-600/30", uses: 22940 },
  { id: "google-questions", label: "Google Questions", description: "High-search questions with short answers.", emoji: "🔍", gradient: "from-rose-500/40 to-pink-600/30", uses: 6710 },
  { id: "asmr", label: "Automated ASMR", description: "Relaxing sounds with looped visuals.", emoji: "🌧️", gradient: "from-violet-500/40 to-purple-600/30", uses: 4520 },
  { id: "make-money", label: "Make Money Online", description: "Monetization methods with AI script.", emoji: "💸", gradient: "from-lime-500/40 to-green-600/30", uses: 9890 },
  { id: "funny-animals", label: "Funny Animals", description: "Funny clips with captions and music.", emoji: "🐶", gradient: "from-yellow-500/40 to-amber-600/30", uses: 15320 },
  { id: "language", label: "Language Learning", description: "Words and sentences with images + AI audio.", emoji: "🗣️", gradient: "from-cyan-500/40 to-blue-600/30", uses: 5210 },
  { id: "science", label: "Science Facts", description: "Interesting facts with simple animation.", emoji: "🔬", gradient: "from-fuchsia-500/40 to-pink-600/30", uses: 11240 },
  { id: "market", label: "Market Analysis", description: "Automated market analysis with charts + AI voice.", emoji: "📈", gradient: "from-teal-500/40 to-emerald-600/30", uses: 7320 },
];

/* ===========================================================
   Templates
   =========================================================== */
export const TEMPLATES: Template[] = [
  {
    id: "tpl_motivation_quote",
    category: "motivation",
    name: "Cinematic Quote",
    description: "Motivational quote with calm music and cinematic imagery. 9:16 vertical, 30s.",
    config: "sceneType=text-overlay, bRoll=nature, music=ambient-calm, cta=subscribe",
    isPublic: true,
    uses: 4821,
    gradient: "from-amber-500/40 via-orange-600/30 to-rose-600/20",
    hook: "Direct Address",
    scenes: 4,
    duration: 30,
  },
  {
    id: "tpl_science_didyouknow",
    category: "science",
    name: "Did You Know?",
    description: "Science fact with simple animation. 9:16, 25s, English/Farsi.",
    config: "sceneType=animated-text, bRoll=science-clip, music=curiosity",
    isPublic: true,
    uses: 3120,
    gradient: "from-fuchsia-500/40 via-purple-600/30 to-indigo-600/20",
    hook: "Intrigue",
    scenes: 3,
    duration: 25,
  },
  {
    id: "tpl_news_short",
    category: "news",
    name: "Short News",
    description: "Short news with screenshots and AI voice. 9:16, 35s.",
    config: "sceneType=screenshot, bRoll=stock-footage, music=tense",
    isPublic: true,
    uses: 6740,
    gradient: "from-sky-500/40 via-blue-600/30 to-indigo-600/20",
    hook: "News Anchor",
    scenes: 5,
    duration: 35,
  },
  {
    id: "tpl_howto_3tips",
    category: "article",
    name: "3 Quick Tips",
    description: "Educational how-to with three quick tips. 9:16, 28s.",
    config: "sceneType=step-list, bRoll=process-shot, music=upbeat",
    isPublic: true,
    uses: 2890,
    gradient: "from-emerald-500/40 via-teal-600/30 to-cyan-600/20",
    hook: "Listicle",
    scenes: 5,
    duration: 28,
  },
  {
    id: "tpl_product_ugc",
    category: "make-money",
    name: "UGC Product Ad",
    description: "UGC-style product ad with hook → demo → testimonial. 9:16, 22s.",
    config: "sceneType=ugc, bRoll=product-shot, music=energetic, cta=link-in-bio",
    isPublic: true,
    uses: 4110,
    gradient: "from-lime-500/40 via-green-600/30 to-emerald-600/20",
    hook: "Problem → Solution",
    scenes: 4,
    duration: 22,
  },
  {
    id: "tpl_story_reddit",
    category: "motivation",
    name: "Reddit Story",
    description: "Narrative story with b-roll and AI voiceover. 9:16, 45s.",
    config: "sceneType=narrative, bRoll=stock, music=ambient, cta=subscribe",
    isPublic: true,
    uses: 5210,
    gradient: "from-violet-500/40 via-purple-600/30 to-fuchsia-600/20",
    hook: "Story Opener",
    scenes: 6,
    duration: 45,
  },
  {
    id: "tpl_top5_countdown",
    category: "google-questions",
    name: "Top 5 Countdown",
    description: "Quick countdown of top 5 items. 9:16, 30s.",
    config: "sceneType=countdown, bRoll=item-shots, music=hype, cta=follow",
    isPublic: true,
    uses: 3720,
    gradient: "from-rose-500/40 via-pink-600/30 to-purple-600/20",
    hook: "Question Opener",
    scenes: 6,
    duration: 30,
  },
  {
    id: "tpl_local_business",
    category: "make-money",
    name: "Local Business",
    description: "Service introduction with CTA. 9:16, 25s.",
    config: "sceneType=service, bRoll=local-footage, music=warm, cta=call-now",
    isPublic: true,
    uses: 1980,
    gradient: "from-yellow-500/40 via-amber-600/30 to-orange-600/20",
    hook: "Direct Address",
    scenes: 4,
    duration: 25,
  },
];

/* ===========================================================
   Recent render jobs (used in dashboard + project detail)
   =========================================================== */
export const RECENT_JOBS: RenderJob[] = [
  {
    id: "job_01HW",
    projectId: "prj_8af2",
    projectTitle: "5 Productivity Hacks That Actually Work",
    status: "RENDERING",
    progress: 64,
    aspectRatio: "9:16",
    durationSec: 30,
    resolution: "1080p",
    model: "Runway Gen-4 Turbo",
    estimatedCostCredits: 60,
    actualCostCredits: null,
    createdAt: "2026-10-29T09:12:00Z",
    completedAt: null,
    error: null,
    thumbnail: "from-emerald-500/40 via-teal-600/30 to-cyan-600/20",
    category: "Article → Video",
  },
  {
    id: "job_01HX",
    projectId: "prj_3b71",
    projectTitle: "Why The Sky Is Blue — Did You Know?",
    status: "COMPLETED",
    progress: 100,
    aspectRatio: "9:16",
    durationSec: 25,
    resolution: "1080p",
    model: "Pika 2.5",
    estimatedCostCredits: 50,
    actualCostCredits: 47,
    createdAt: "2026-10-29T08:40:00Z",
    completedAt: "2026-10-29T08:47:00Z",
    error: null,
    thumbnail: "from-fuchsia-500/40 via-purple-600/30 to-indigo-600/20",
    category: "Science Facts",
  },
  {
    id: "job_01HV",
    projectId: "prj_2c90",
    projectTitle: "Daily Market Recap — Oct 29",
    status: "QC",
    progress: 92,
    aspectRatio: "16:9",
    durationSec: 45,
    resolution: "1080p",
    model: "Luma Dream Machine",
    estimatedCostCredits: 90,
    actualCostCredits: null,
    createdAt: "2026-10-29T08:20:00Z",
    completedAt: null,
    error: null,
    thumbnail: "from-teal-500/40 via-emerald-600/30 to-cyan-600/20",
    category: "Market Analysis",
  },
  {
    id: "job_01HU",
    projectId: "prj_7d18",
    projectTitle: "Funny Cat Compilation #14",
    status: "FAILED",
    progress: 38,
    aspectRatio: "9:16",
    durationSec: 28,
    resolution: "1080p",
    model: "Hailuo",
    estimatedCostCredits: 56,
    actualCostCredits: 0,
    createdAt: "2026-10-29T07:55:00Z",
    completedAt: null,
    error: "Asset generation timeout — provider circuit breaker open after 3 retries.",
    thumbnail: "from-yellow-500/40 via-amber-600/30 to-orange-600/20",
    category: "Funny Animals",
  },
  {
    id: "job_01HT",
    projectId: "prj_5e44",
    projectTitle: "Morning Motivation — Discipline",
    status: "COMPLETED",
    progress: 100,
    aspectRatio: "9:16",
    durationSec: 30,
    resolution: "720p",
    model: "Pika 2.5",
    estimatedCostCredits: 30,
    actualCostCredits: 28,
    createdAt: "2026-10-28T22:10:00Z",
    completedAt: "2026-10-28T22:14:00Z",
    error: null,
    thumbnail: "from-amber-500/40 via-orange-600/30 to-rose-600/20",
    category: "Motivational",
  },
  {
    id: "job_01HS",
    projectId: "prj_9f02",
    projectTitle: "How To Say Hello In 5 Languages",
    status: "CAPTION_SYNC",
    progress: 72,
    aspectRatio: "9:16",
    durationSec: 35,
    resolution: "1080p",
    model: "Runway Gen-4 Turbo",
    estimatedCostCredits: 70,
    actualCostCredits: null,
    createdAt: "2026-10-28T21:30:00Z",
    completedAt: null,
    error: null,
    thumbnail: "from-cyan-500/40 via-blue-600/30 to-indigo-600/20",
    category: "Language Learning",
  },
];

/* ===========================================================
   Scenes for the active project (project detail view)
   =========================================================== */
export const PROJECT_SCENES: Scene[] = [
  {
    id: "sc_01",
    index: 0,
    scriptText:
      "Did you know the sky isn't actually blue? It just looks that way because of how sunlight scatters off the atmosphere.",
    visualPrompt: "Cinematic wide shot of a clear blue sky slowly transitioning to night, particles of light scattering in slow motion.",
    assetType: "AI_VIDEO",
    startMs: 0,
    endMs: 5500,
    caption: "Did you know the sky isn't actually blue?",
    status: "ready",
    thumbnail: "from-sky-500/40 via-blue-600/30 to-indigo-600/20",
    provider: "Runway Gen-4 Turbo",
  },
  {
    id: "sc_02",
    index: 1,
    scriptText:
      "It's called Rayleigh scattering. Shorter blue wavelengths bounce off air molecules more than red ones, reaching your eyes from every direction.",
    visualPrompt: "Macro animation of light waves splitting through a prism, blue waves scattering while red waves pass straight.",
    assetType: "AI_IMAGE",
    startMs: 5500,
    endMs: 12500,
    caption: "It's called Rayleigh scattering.",
    status: "ready",
    thumbnail: "from-fuchsia-500/40 via-purple-600/30 to-violet-600/20",
    provider: "Imagen 3",
  },
  {
    id: "sc_03",
    index: 2,
    scriptText:
      "That's why sunsets turn red — light travels through more atmosphere, scattering away the blue and leaving the warm colors behind.",
    visualPrompt: "Timelapse of a golden-red sunset over the ocean, slow push-in, lens flare.",
    assetType: "STOCK",
    startMs: 12500,
    endMs: 19500,
    caption: "Sunsets turn red for the same reason.",
    status: "regenerating",
    thumbnail: "from-amber-500/40 via-orange-600/30 to-rose-600/20",
    provider: "Storyblocks",
  },
  {
    id: "sc_04",
    index: 3,
    scriptText:
      "So next time you look up, remember — the sky isn't really blue. Your eyes are just receiving more blue light than anything else.",
    visualPrompt: "POV shot of someone looking up at the sky, slow zoom into the atmosphere, particles of light.",
    assetType: "AI_VIDEO",
    startMs: 19500,
    endMs: 25000,
    caption: "The sky isn't really blue.",
    status: "ready",
    thumbnail: "from-cyan-500/40 via-sky-600/30 to-blue-600/20",
    provider: "Runway Gen-4 Turbo",
  },
];

/* ===========================================================
   Credit ledger — append-only, double-entry
   =========================================================== */
export const CREDIT_LEDGER: CreditLedgerEntry[] = [
  { id: "led_01J2", delta: 900, reason: "subscription_grant", refId: "sub_pro_oct2026", balanceAfter: 900, createdAt: "2026-10-01T00:00:00Z" },
  { id: "led_01J3", delta: -50, reason: "render_spend", refId: "job_01HX", balanceAfter: 850, createdAt: "2026-10-29T08:47:00Z" },
  { id: "led_01J4", delta: -30, reason: "render_spend", refId: "job_01HT", balanceAfter: 820, createdAt: "2026-10-28T22:14:00Z" },
  { id: "led_01J5", delta: 30, reason: "render_refund", refId: "job_01HU", balanceAfter: 850, createdAt: "2026-10-29T07:58:00Z" },
  { id: "led_01J6", delta: -60, reason: "render_spend", refId: "job_01HW (reserve)", balanceAfter: 790, createdAt: "2026-10-29T09:12:00Z" },
];

export const INVOICES: Invoice[] = [
  { id: "inv_01H2", number: "VF-2026-0010", amount: 49, currency: "usd", status: "paid", period: "Oct 2026", date: "2026-10-01", url: "#" },
  { id: "inv_01G9", number: "VF-2026-0009", amount: 49, currency: "usd", status: "paid", period: "Sep 2026", date: "2026-09-01", url: "#" },
  { id: "inv_01G6", number: "VF-2026-0008", amount: 49, currency: "usd", status: "paid", period: "Aug 2026", date: "2026-08-01", url: "#" },
  { id: "inv_01G3", number: "VF-2026-0007", amount: 19, currency: "usd", status: "paid", period: "Jul 2026", date: "2026-07-01", url: "#" },
];

/* ===========================================================
   Team members
   =========================================================== */
export const TEAM_MEMBERS: TeamMember[] = [
  { id: "u_01", name: "Sina Karimi", email: "sina@viralforge.ai", role: "OWNER", avatar: "SK", lastActive: "now" },
  { id: "u_02", name: "Mina Hashemi", email: "mina@viralforge.ai", role: "ADMIN", avatar: "MH", lastActive: "12m ago" },
  { id: "u_03", name: "Arman Tehrani", email: "arman@viralforge.ai", role: "EDITOR", avatar: "AT", lastActive: "1h ago" },
  { id: "u_04", name: "Niloofar Rostami", email: "niloofar@viralforge.ai", role: "EDITOR", avatar: "NR", lastActive: "3h ago" },
  { id: "u_05", name: "Babak Najafi", email: "babak@viralforge.ai", role: "VIEWER", avatar: "BN", lastActive: "yesterday" },
];

/* ===========================================================
   Admin — organizations
   =========================================================== */
export const ADMIN_ORGS: AdminOrg[] = [
  { id: "org_01", name: "ViralForge Studio", slug: "viralforge-studio", plan: "Agency", credits: 8120, members: 25, jobs: 4210, createdAt: "2026-03-14", status: "active" },
  { id: "org_02", name: "Tehran Trends", slug: "tehran-trends", plan: "Business", credits: 1820, members: 10, jobs: 1240, createdAt: "2026-05-22", status: "active" },
  { id: "org_03", name: "Daily Dose Media", slug: "daily-dose-media", plan: "Pro", credits: 480, members: 3, jobs: 620, createdAt: "2026-07-09", status: "active" },
  { id: "org_04", name: "Creator Hub", slug: "creator-hub", plan: "Creator", credits: 90, members: 1, jobs: 142, createdAt: "2026-08-18", status: "trialing" },
  { id: "org_05", name: "Free Tiers", slug: "free-tiers", plan: "Free", credits: 12, members: 1, jobs: 38, createdAt: "2026-09-30", status: "active" },
  { id: "org_06", name: "Suspended Co.", slug: "suspended-co", plan: "Business", credits: 0, members: 7, jobs: 88, createdAt: "2026-04-04", status: "suspended" },
];

export const ADMIN_PROVIDER_USAGE: AdminProviderUsage[] = [
  { provider: "OpenAI GPT-4o", category: "LLM", calls: 12480, costUsd: 187.20, avgLatencyMs: 1240, errorRate: 0.4, trend: "up" },
  { provider: "Anthropic Claude 3.5", category: "LLM", calls: 4210, costUsd: 96.40, avgLatencyMs: 980, errorRate: 0.2, trend: "flat" },
  { provider: "Pika 2.5", category: "Video", calls: 3120, costUsd: 1248.00, avgLatencyMs: 18400, errorRate: 3.1, trend: "up" },
  { provider: "Runway Gen-4 Turbo", category: "Video", calls: 2890, costUsd: 1445.00, avgLatencyMs: 22100, errorRate: 2.8, trend: "up" },
  { provider: "Hailuo", category: "Video", calls: 1640, costUsd: 770.80, avgLatencyMs: 16200, errorRate: 4.2, trend: "down" },
  { provider: "Luma Dream Machine", category: "Video", calls: 980, costUsd: 588.00, avgLatencyMs: 19800, errorRate: 3.5, trend: "flat" },
  { provider: "ElevenLabs Flash", category: "TTS", calls: 8420, costUsd: 33.68, avgLatencyMs: 420, errorRate: 0.1, trend: "up" },
  { provider: "ElevenLabs Multilingual v2", category: "TTS", calls: 3210, costUsd: 25.68, avgLatencyMs: 680, errorRate: 0.3, trend: "flat" },
  { provider: "OpenAI TTS", category: "TTS", calls: 4120, costUsd: 16.48, avgLatencyMs: 380, errorRate: 0.2, trend: "up" },
  { provider: "Imagen 3", category: "Image", calls: 6210, costUsd: 124.20, avgLatencyMs: 2100, errorRate: 1.4, trend: "up" },
  { provider: "Storyblocks", category: "Stock", calls: 4180, costUsd: 41.80, avgLatencyMs: 220, errorRate: 0.5, trend: "flat" },
];

export const ADMIN_MODERATION: AdminModerationItem[] = [
  { id: "mod_01", type: "text", reason: "Potential trademark claim in script", status: "pending", orgName: "Tehran Trends", createdAt: "2026-10-29T10:22:00Z", preview: "\"...just like Apple does every year...\"" },
  { id: "mod_02", type: "image", reason: "Likely copyrighted artwork detected", status: "flagged", orgName: "Creator Hub", createdAt: "2026-10-29T09:48:00Z", preview: "Generated asset flagged by image-match (0.92 similarity)" },
  { id: "mod_03", type: "video", reason: "Auto-flagged by content safety model", status: "blocked", orgName: "Free Tiers", createdAt: "2026-10-29T08:12:00Z", preview: "Violence threshold exceeded — video rejected" },
  { id: "mod_04", type: "music", reason: "License verified — Storyblocks", status: "approved", orgName: "ViralForge Studio", createdAt: "2026-10-29T07:55:00Z", preview: "Track ID sb-ambient-calm-0421" },
];

/* ===========================================================
   Usage chart data (last 30 days)
   =========================================================== */
export const USAGE_DATA: { day: string; renders: number; credits: number }[] = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(2026, 9, 30 - 29 + i);
  const base = 4 + Math.sin(i / 3) * 2 + Math.cos(i / 7) * 1.5;
  const renders = Math.max(0, Math.round(base + (i > 20 ? 3 : 0) + Math.random()));
  return {
    day: d.toISOString().slice(5, 10),
    renders,
    credits: renders * (40 + Math.round(Math.random() * 30)),
  };
});
