"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Play,
  Sparkles,
  Zap,
  Shield,
  Globe,
  Captions,
  Mic,
  Film,
  CheckCircle2,
  Layers,
  Workflow,
  CreditCard,
  Cpu,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES, PRICING_PLANS } from "@/lib/mock-data";
import type { View } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface LandingViewProps {
  setView: (v: View) => void;
}

export function LandingView({ setView }: LandingViewProps) {
  return (
    <div className="relative">
      {/* Hero */}
      <section className="relative overflow-hidden grid-pattern noise">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -start-40 h-[600px] w-[600px] rounded-full bg-primary/20 blur-[120px]" />
          <div className="absolute -top-20 end-0 h-[500px] w-[500px] rounded-full bg-accent/20 blur-[120px]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-24 lg:pt-28 lg:pb-32">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <Badge className="mb-5 border-primary/40 bg-primary/10 text-primary hover:bg-primary/15 px-3 py-1.5 text-xs gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Optimized for Hook, Retention &amp; Caption
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]">
              The cinematic AI video studio for{" "}
              <span className="gradient-text animate-gradient">teams that ship daily.</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl">
              ViralForge AI turns a one-paragraph brief into a finished short-form video — script,
              scenes, voiceover, captions, music, and final render — in 9:16, 1:1, or 16:9. No
              editing skills, no timeline, no Make.com or n8n glue — just your own orchestration
              layer on PostgreSQL, Redis, BullMQ, and Remotion.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                className="h-12 px-6 text-base glow-primary"
                onClick={() => setView("create")}
              >
                Create your first video
                <ArrowRight className="h-5 w-5 ms-2 ltr-flip" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-6 text-base border-border/70 bg-surface/40 hover:bg-surface/70"
                onClick={() => setView("dashboard")}
              >
                <Play className="h-4 w-4 me-2" fill="currentColor" />
                Live product tour
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              {[
                "No credit card on Free",
                "30 credits / month free",
                "Cancel anytime",
                "Multi-tenant by design",
              ].map((line) => (
                <span key={line} className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  {line}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Hero visual — three phone previews */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-16 grid lg:grid-cols-3 gap-4 lg:gap-6"
          >
            <PhonePreview gradient="from-emerald-500/50 via-teal-600/40 to-cyan-600/30" label="9:16 vertical" caption="Did you know the sky isn't actually blue?" progress={100} status="COMPLETED" />
            <PhonePreview gradient="from-fuchsia-500/50 via-purple-600/40 to-indigo-600/30" label="9:16 vertical" caption="It's called Rayleigh scattering." progress={64} status="RENDERING" />
            <PhonePreview gradient="from-amber-500/50 via-orange-600/40 to-rose-600/30" label="9:16 vertical" caption="Morning motivation: discipline." progress={100} status="COMPLETED" />
          </motion.div>
        </div>
      </section>

      {/* Pipeline strip */}
      <section className="border-y border-border/60 bg-surface/30">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {[
              { label: "Brief", icon: Wand2, sub: "topic + tone" },
              { label: "Script", icon: Captions, sub: "LLM + Zod" },
              { label: "Assets", icon: Layers, sub: "AI + stock" },
              { label: "Voiceover", icon: Mic, sub: "TTS + timestamps" },
              { label: "Captions", icon: Captions, sub: "SRT + burn-in" },
              { label: "Render", icon: Film, sub: "Remotion + FFmpeg" },
              { label: "QC", icon: Shield, sub: "safety + copyright" },
            ].map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.label}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-xl glass p-4 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary/15 grid place-items-center">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <p className="text-sm font-semibold">{step.label}</p>
                  <p className="text-[11px] text-muted-foreground">{step.sub}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories grid */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="max-w-2xl mb-10">
          <Badge variant="outline" className="mb-3 text-xs">10 categories</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Built for every short-form format that works.</h2>
          <p className="mt-3 text-muted-foreground">
            Pick a category, write a one-line brief, and ViralForge handles the rest. Every template
            ships with proven hook patterns — Direct Address, Intrigue, Question Opener.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {CATEGORIES.map((cat, i) => (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (i % 5) * 0.04 }}
              onClick={() => setView("create")}
              className="group text-start rounded-2xl glass overflow-hidden hover:glow-primary transition-all"
            >
              <div className={cn("aspect-video bg-gradient-to-br relative", cat.gradient)}>
                <div className="absolute inset-0 grid-pattern opacity-30" />
                <div className="absolute inset-0 grid place-items-center">
                  <span className="text-4xl">{cat.emoji}</span>
                </div>
                <div className="absolute bottom-2 end-2 text-[10px] font-mono text-foreground/70 bg-background/40 px-1.5 py-0.5 rounded">
                  {cat.uses.toLocaleString()} renders
                </div>
              </div>
              <div className="p-3.5">
                <p className="text-sm font-semibold">{cat.label}</p>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{cat.description}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section className="border-y border-border/60 bg-surface/30">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="max-w-2xl mb-10">
            <Badge variant="outline" className="mb-3 text-xs">Engineering</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Production architecture, not a hack.</h2>
            <p className="mt-3 text-muted-foreground">
              Built on a real orchestration layer: PostgreSQL + Prisma, Redis + BullMQ, separate
              worker pools, an internal AI provider gateway with circuit breakers, and a
              double-entry credit ledger. No no-code automation anywhere.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (i % 3) * 0.04 }}
                  className="rounded-2xl glass p-5 space-y-3 hover:border-primary/40 transition-colors"
                >
                  <div className="h-10 w-10 rounded-xl bg-primary/15 grid place-items-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-base">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.body}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge variant="outline" className="mb-3 text-xs">Pricing</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Credits, not guesses.</h2>
          <p className="mt-3 text-muted-foreground">
            1 credit = 1 second of 720p video with the standard model. 1080p = 2×, 4K = 4×, premium
            models 2–4×. Free plan ships with a watermark.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {PRICING_PLANS.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                "relative rounded-2xl p-5 space-y-4 flex flex-col",
                plan.highlight
                  ? "glass-strong gradient-border glow-primary"
                  : "glass border border-border/60",
              )}
            >
              {plan.highlight && (
                <div className="absolute -top-3 start-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
                    Most popular
                  </Badge>
                </div>
              )}
              <div>
                <p className="text-sm font-semibold">{plan.id}</p>
                <p className="mt-2 text-3xl font-bold tracking-tight">
                  ${plan.price}
                  <span className="text-sm text-muted-foreground font-normal">/mo</span>
                </p>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <span className="font-semibold">{plan.credits.toLocaleString()}</span>
                  <span className="text-muted-foreground">credits/mo</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Film className="h-4 w-4" />
                  <span>{plan.resolution}{plan.watermark ? " + watermark" : ""}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Layers className="h-4 w-4" />
                  <span>{plan.seats} {plan.seats === 1 ? "seat" : "seats"}</span>
                </div>
              </div>
              <ul className="space-y-1.5 text-xs text-muted-foreground flex-1">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
              <Button
                variant={plan.highlight ? "default" : "outline"}
                className="w-full"
                onClick={() => setView("billing")}
              >
                {plan.cta}
              </Button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/60 bg-surface/30">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="relative rounded-3xl overflow-hidden glass-strong p-8 sm:p-12 lg:p-16 text-center">
            <div className="absolute -top-20 start-1/2 -translate-x-1/2 h-80 w-80 rounded-full bg-primary/20 blur-[120px]" />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight max-w-2xl mx-auto">
                Your first viral short is{" "}
                <span className="gradient-text">90 seconds of typing</span> away.
              </h2>
              <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
                We don&apos;t promise guaranteed virality or YouTube income. We optimize for Hook,
                Retention, and Caption — the parts you can actually control.
              </p>
              <div className="mt-8 flex justify-center gap-3">
                <Button size="lg" className="h-12 px-6 glow-primary" onClick={() => setView("create")}>
                  Start free
                  <ArrowRight className="h-5 w-5 ms-2 ltr-flip" />
                </Button>
                <Button size="lg" variant="outline" className="h-12 px-6" onClick={() => setView("templates")}>
                  Browse templates
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ===========================================================
   Features list
   =========================================================== */
const FEATURES: { title: string; body: string; icon: typeof Zap }[] = [
  {
    title: "Multi-tenant by design",
    body: "Every record carries an organizationId. Postgres RLS and Prisma middleware enforce isolation — no leaks between orgs.",
    icon: Layers,
  },
  {
    title: "BullMQ pipeline, 5 queues",
    body: "Separate queues for script, asset, voice, render, and QC. Exponential backoff, dead-letter queue, idempotency keys on every job.",
    icon: Workflow,
  },
  {
    title: "Internal AI gateway",
    body: "One adapter for OpenAI, Anthropic, Gemini, ElevenLabs, Runway, Pika, Luma, Kling, Hailuo. Cost meter, rate limit, fallback, circuit breaker.",
    icon: Cpu,
  },
  {
    title: "Stripe + credit ledger",
    body: "Stripe Checkout + Customer Portal + idempotent webhook. Double-entry, append-only ledger — credits are never mutated without an entry.",
    icon: CreditCard,
  },
  {
    title: "Scene-level control",
    body: "Don&apos;t like scene 3? Regenerate it. Drag-and-drop ordering. Caption editor with safe-zone preview for 9:16.",
    icon: Film,
  },
  {
    title: "Safety, copyright, disclosure",
    body: "Pre-generation moderation, image-match for copyright, AI-disclosure bumper on every export.",
    icon: Shield,
  },
];

/* ===========================================================
   Phone preview component (hero visual)
   =========================================================== */
function PhonePreview({
  gradient,
  label,
  caption,
  progress,
  status,
}: {
  gradient: string;
  label: string;
  caption: string;
  progress: number;
  status: "COMPLETED" | "RENDERING";
}) {
  return (
    <div className="relative mx-auto w-full max-w-[260px]">
      <div className="relative aspect-[9/16] rounded-[2rem] glass-strong overflow-hidden gradient-border">
        <div className={cn("absolute inset-0 bg-gradient-to-br", gradient)} />
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="absolute inset-0 noise" />

        {/* Notch */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 h-6 w-20 rounded-full bg-background/80" />

        {/* Caption */}
        <div className="absolute inset-x-3 bottom-16 text-center">
          <p className="text-sm font-bold text-white drop-shadow-lg leading-snug">
            {caption}
          </p>
        </div>

        {/* Progress overlay */}
        {status === "RENDERING" && (
          <div className="absolute inset-0 bg-background/70 grid place-items-center">
            <div className="text-center space-y-2">
              <div className="mx-auto h-12 w-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <p className="text-xs font-mono text-primary">{progress}%</p>
            </div>
          </div>
        )}

        {/* Bottom bar */}
        <div className="absolute bottom-3 inset-x-3 flex items-center justify-between">
          <Badge className="text-[10px] bg-black/40 text-white border-white/20 backdrop-blur">
            {label}
          </Badge>
          <Badge
            className={cn(
              "text-[10px] border",
              status === "COMPLETED"
                ? "bg-primary/30 text-primary border-primary/40"
                : "bg-amber-500/30 text-amber-300 border-amber-500/40",
            )}
          >
            {status === "COMPLETED" ? "DONE" : "RENDER"}
          </Badge>
        </div>
      </div>
    </div>
  );
}
