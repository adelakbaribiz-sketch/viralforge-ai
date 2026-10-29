"use client";

import { motion } from "framer-motion";
import {
  Zap,
  Film,
  Clock,
  TrendingUp,
  Play,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Eye,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RECENT_JOBS, USAGE_DATA, type View, type RenderJob, type ProjectStatus } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";

interface DashboardViewProps {
  setView: (v: View) => void;
  setOpenProjectId: (id: string) => void;
  credits: number;
  plan: string;
  orgName: string;
}

export function DashboardView({ setView, setOpenProjectId, credits, plan, orgName }: DashboardViewProps) {
  const totalRenders = USAGE_DATA.reduce((s, d) => s + d.renders, 0);
  const totalCreditsUsed = USAGE_DATA.reduce((s, d) => s + d.credits, 0);
  const completedJobs = RECENT_JOBS.filter((j) => j.status === "COMPLETED").length;
  const activeJobs = RECENT_JOBS.filter((j) => !["COMPLETED", "FAILED"].includes(j.status)).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 lg:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Welcome back to <span className="gradient-text">{orgName}</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            You have {activeJobs} active renders and {completedJobs} completed this week.
          </p>
        </div>
        <Button size="lg" className="glow-primary" onClick={() => setView("create")}>
          <Plus className="h-4 w-4 me-2" />
          New video
        </Button>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatCard
          label="Credits remaining"
          value={credits.toLocaleString()}
          sub="of 900 monthly"
          icon={Zap}
          trend={`${Math.round((credits / 900) * 100)}% left`}
          trendUp
        />
        <StatCard
          label="Renders (30d)"
          value={totalRenders.toString()}
          sub="across 6 categories"
          icon={Film}
          trend="+24% vs prev"
          trendUp
        />
        <StatCard
          label="Avg render time"
          value="4m 12s"
          sub="1080p, Runway Gen-4"
          icon={Clock}
          trend="-18s"
          trendUp
        />
        <StatCard
          label="Provider cost (30d)"
          value="$3,860"
          sub="across 11 providers"
          icon={TrendingUp}
          trend="+8.4%"
          trendUp={false}
        />
      </div>

      {/* Main grid: usage chart + queue */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Usage chart */}
        <Card className="lg:col-span-2 p-5 glass">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold">Render &amp; credit usage</h2>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-primary" />
                Renders
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-accent" />
                Credits
              </span>
            </div>
          </div>
          <div className="h-[260px] -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={USAGE_DATA} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gRenders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.72 0.20 155)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="oklch(0.72 0.20 155)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gCredits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.70 0.24 295)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="oklch(0.70 0.24 295)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="oklch(0.30 0.02 260 / 0.5)" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="day"
                  stroke="oklch(0.68 0.02 260)"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  interval={4}
                />
                <YAxis stroke="oklch(0.68 0.02 260)" fontSize={10} tickLine={false} axisLine={false} />
                <RTooltip
                  cursor={{ stroke: "oklch(0.72 0.20 155)", strokeWidth: 1 }}
                  contentStyle={{
                    backgroundColor: "oklch(0.18 0.02 260)",
                    border: "1px solid oklch(0.30 0.02 260)",
                    borderRadius: "0.5rem",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="renders"
                  stroke="oklch(0.72 0.20 155)"
                  strokeWidth={2}
                  fill="url(#gRenders)"
                />
                <Area
                  type="monotone"
                  dataKey="credits"
                  stroke="oklch(0.70 0.24 295)"
                  strokeWidth={2}
                  fill="url(#gCredits)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Credit meter */}
        <Card className="p-5 glass flex flex-col">
          <h2 className="font-semibold">Credit meter</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Renews on Nov 1</p>

          <div className="mt-4 flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold tabular-nums">{credits}</p>
              <p className="text-xs text-muted-foreground">/ 900 credits</p>
            </div>
            <Badge className="bg-primary/15 text-primary border-primary/30">{plan}</Badge>
          </div>
          <Progress value={(credits / 900) * 100} className="mt-3 h-2" />
          <p className="mt-2 text-xs text-muted-foreground">
            ≈ {Math.floor(credits / 60)} min of 1080p video remaining
          </p>

          <Separator className="my-4" />

          <div className="space-y-2 text-xs">
            <Row label="Reserved in active jobs" value="−90" hint="2 renders queued" />
            <Row label="Spent this month" value={totalCreditsUsed.toString()} />
            <Row label="Refunded (failures)" value="+30" hint="1 retried job" />
          </div>

          {credits < 100 && (
            <div className="mt-4 rounded-lg border border-warning/40 bg-warning/10 p-3 text-xs">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-warning">Low on credits</p>
                  <p className="text-warning/80 mt-0.5">Upgrade to Business for 3,000 credits/mo.</p>
                </div>
              </div>
              <Button size="sm" variant="outline" className="mt-3 w-full border-warning/40" onClick={() => setView("billing")}>
                View plans
              </Button>
            </div>
          )}

          <Button variant="ghost" className="mt-auto" onClick={() => setView("billing")}>
            Open billing
          </Button>
        </Card>
      </div>

      {/* Recent jobs table */}
      <Card className="p-5 glass">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold">Recent jobs</h2>
            <p className="text-xs text-muted-foreground">Live render queue with retries &amp; DLQ</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setView("project")}>
            View all
          </Button>
        </div>
        <div className="space-y-2">
          {RECENT_JOBS.map((job, i) => (
            <JobRow key={job.id} job={job} index={i} setOpenProjectId={setOpenProjectId} setView={setView} />
          ))}
        </div>
      </Card>

      {/* Footer notice — never guaranteed */}
      <div className="rounded-xl glass p-4 flex items-start gap-3 text-sm">
        <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">A note on virality.</p>
          <p className="text-muted-foreground mt-1">
            ViralForge AI optimizes for Hook, Retention, and Caption — the parts you can control.
            We do not promise guaranteed views, virality, or YouTube income. Automated channels
            can only be monetized if they meet AdSense, copyright, and quality standards.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ===========================================================
   Stat card
   =========================================================== */
function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  trend,
  trendUp,
}: {
  label: string;
  value: string;
  sub: string;
  icon: typeof Zap;
  trend: string;
  trendUp: boolean;
}) {
  return (
    <Card className="p-4 glass relative overflow-hidden">
      <div className="absolute -top-8 -end-8 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <div className="h-9 w-9 rounded-lg bg-primary/15 grid place-items-center">
            <Icon className="h-4.5 w-4.5 text-primary" />
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className={cn("text-xs font-medium inline-flex items-center gap-0.5", trendUp ? "text-primary" : "text-warning")}>
                {trendUp ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                {trend}
              </span>
            </TooltipTrigger>
            <TooltipContent>vs previous period</TooltipContent>
          </Tooltip>
        </div>
        <p className="mt-3 text-2xl font-bold tracking-tight tabular-nums">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
        <p className="text-[11px] text-muted-foreground/70">{sub}</p>
      </div>
    </Card>
  );
}

/* ===========================================================
   Job row
   =========================================================== */
function JobRow({
  job,
  index,
  setOpenProjectId,
  setView,
}: {
  job: RenderJob;
  index: number;
  setOpenProjectId: (id: string) => void;
  setView: (v: View) => void;
}) {
  const statusMap: Record<ProjectStatus, { label: string; color: string; icon: typeof CheckCircle2 }> = {
    DRAFT: { label: "Draft", color: "text-muted-foreground", icon: Eye },
    QUEUED: { label: "Queued", color: "text-muted-foreground", icon: Clock },
    SCRIPTING: { label: "Scripting", color: "text-sky-400", icon: Loader2 },
    ASSET_PLANNING: { label: "Asset plan", color: "text-sky-400", icon: Loader2 },
    ASSET_GENERATION: { label: "Assets", color: "text-violet-400", icon: Loader2 },
    VOICEOVER: { label: "Voiceover", color: "text-violet-400", icon: Loader2 },
    CAPTION_SYNC: { label: "Captions", color: "text-fuchsia-400", icon: Loader2 },
    ASSEMBLING: { label: "Assembling", color: "text-amber-400", icon: Loader2 },
    RENDERING: { label: "Rendering", color: "text-amber-400", icon: Loader2 },
    QC: { label: "QC", color: "text-teal-400", icon: Loader2 },
    COMPLETED: { label: "Completed", color: "text-primary", icon: CheckCircle2 },
    FAILED: { label: "Failed", color: "text-danger", icon: AlertTriangle },
  };
  const S = statusMap[job.status];
  const StatusIcon = S.icon;
  const isRunning = ["SCRIPTING", "ASSET_PLANNING", "ASSET_GENERATION", "VOICEOVER", "CAPTION_SYNC", "ASSEMBLING", "RENDERING", "QC"].includes(job.status);

  return (
    <motion.button
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={() => {
        setOpenProjectId(job.projectId);
        setView("project");
      }}
      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-surface/60 transition-colors text-start group"
    >
      {/* Thumbnail */}
      <div className={cn("relative h-14 w-14 sm:h-16 sm:w-16 rounded-lg bg-gradient-to-br shrink-0 overflow-hidden", job.thumbnail)}>
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="absolute inset-0 grid place-items-center">
          <Play className="h-5 w-5 text-white/80" fill="currentColor" />
        </div>
        {isRunning && (
          <div className="absolute inset-0 bg-background/50 grid place-items-center">
            <Loader2 className="h-5 w-5 text-primary animate-spin" />
          </div>
        )}
      </div>

      {/* Title & meta */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-sm truncate">{job.projectTitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-xs text-muted-foreground">
          <Badge variant="outline" className="text-[10px] py-0 px-1.5">{job.aspectRatio}</Badge>
          <Badge variant="outline" className="text-[10px] py-0 px-1.5">{job.resolution}</Badge>
          <Badge variant="outline" className="text-[10px] py-0 px-1.5">{job.durationSec}s</Badge>
          <span className="text-muted-foreground/70">·</span>
          <span>{job.model}</span>
          <span className="text-muted-foreground/70">·</span>
          <span>{job.category}</span>
        </div>
        {job.error && (
          <p className="text-[11px] text-danger mt-1 truncate">{job.error}</p>
        )}
      </div>

      {/* Status + progress */}
      <div className="hidden sm:flex flex-col items-end gap-1.5 w-44">
        <div className="inline-flex items-center gap-1.5 text-xs">
          <StatusIcon className={cn("h-3.5 w-3.5", S.color, isRunning && "animate-spin")} />
          <span className={S.color}>{S.label}</span>
        </div>
        {job.status !== "COMPLETED" && job.status !== "FAILED" && (
          <div className="w-full">
            <Progress value={job.progress} className="h-1.5" />
          </div>
        )}
      </div>

      {/* Cost */}
      <div className="hidden md:flex flex-col items-end w-20">
        <span className="text-xs font-mono tabular-nums">
          {job.actualCostCredits ?? `~${job.estimatedCostCredits}`}
        </span>
        <span className="text-[10px] text-muted-foreground">credits</span>
      </div>
    </motion.button>
  );
}

function Row({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p>{label}</p>
        {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
      </div>
      <span className="font-mono tabular-nums">{value}</span>
    </div>
  );
}
