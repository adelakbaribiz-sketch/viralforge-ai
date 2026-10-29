"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Building2,
  Cpu,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Minus,
  Ban,
  Eye,
  Globe,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ADMIN_ORGS,
  ADMIN_PROVIDER_USAGE,
  ADMIN_MODERATION,
  RECENT_JOBS,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const STATUS_COLOR: Record<string, string> = {
  active: "bg-primary/15 text-primary border-primary/30",
  suspended: "bg-danger/15 text-danger border-danger/30",
  trialing: "bg-amber-500/15 text-amber-300 border-amber-500/40",
};

const MOD_STATUS_COLOR: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-300 border-amber-500/40",
  approved: "bg-primary/15 text-primary border-primary/30",
  blocked: "bg-danger/15 text-danger border-danger/30",
  flagged: "bg-accent/15 text-accent border-accent/30",
};

export function AdminView() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 lg:py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Admin panel</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Platform-wide view. All access is logged.
          </p>
        </div>
        <Badge variant="outline" className="border-danger/40 bg-danger/10 text-danger">
          <Shield className="h-3.5 w-3.5 me-1.5" />
          Super-admin
        </Badge>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <KpiCard label="Total orgs" value={ADMIN_ORGS.length.toString()} sub="1 suspended" icon={Building2} />
        <KpiCard label="Active jobs" value={RECENT_JOBS.filter(j => !["COMPLETED", "FAILED"].includes(j.status)).length.toString()} sub="across all queues" icon={Activity} />
        <KpiCard label="Provider spend (30d)" value="$3,860" sub="+8.4% vs prev" icon={Cpu} />
        <KpiCard label="Pending moderation" value={ADMIN_MODERATION.filter(m => m.status === "pending").length.toString()} sub="1 blocked today" icon={Shield} danger />
      </div>

      <Tabs defaultValue="orgs">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="orgs"><Building2 className="h-4 w-4 me-2" /> Organizations</TabsTrigger>
          <TabsTrigger value="jobs"><Activity className="h-4 w-4 me-2" /> Jobs</TabsTrigger>
          <TabsTrigger value="providers"><Cpu className="h-4 w-4 me-2" /> Provider costs</TabsTrigger>
          <TabsTrigger value="moderation"><Shield className="h-4 w-4 me-2" /> Moderation</TabsTrigger>
        </TabsList>

        {/* Organizations */}
        <TabsContent value="orgs" className="mt-4">
          <Card className="p-5 glass">
            <div className="overflow-x-auto -mx-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Organization</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead>Jobs</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ADMIN_ORGS.map((org) => (
                    <TableRow key={org.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{org.name}</p>
                          <p className="text-xs text-muted-foreground font-mono">{org.slug}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">{org.plan}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm tabular-nums">{org.credits.toLocaleString()}</TableCell>
                      <TableCell className="text-sm">{org.members}</TableCell>
                      <TableCell className="text-sm">{org.jobs.toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{org.createdAt}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("text-[10px]", STATUS_COLOR[org.status])}>
                          {org.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-end">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast("Impersonating...")}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:text-danger"
                            onClick={() => toast.success(org.status === "suspended" ? "Org reactivated" : "Org suspended", { description: org.name })}
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* Jobs */}
        <TabsContent value="jobs" className="mt-4">
          <Card className="p-5 glass">
            <h2 className="font-semibold mb-3">All jobs across all orgs</h2>
            <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
              {RECENT_JOBS.map((job) => (
                <div key={job.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-surface/60 border border-transparent hover:border-border/60">
                  <div className={cn("h-9 w-9 rounded-lg bg-gradient-to-br shrink-0 overflow-hidden", job.thumbnail)}>
                    <div className="w-full h-full grid place-items-center">
                      <Activity className="h-4 w-4 text-white/80" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{job.projectTitle}</p>
                    <p className="text-xs text-muted-foreground">{job.model} · {job.resolution} · {job.durationSec}s</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono">{job.id}</Badge>
                  <Badge variant="outline" className="text-[10px]">{job.status}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Provider costs */}
        <TabsContent value="providers" className="mt-4">
          <Card className="p-5 glass">
            <h2 className="font-semibold mb-1">Provider usage &amp; cost</h2>
            <p className="text-xs text-muted-foreground mb-3">All AI gateway calls in the last 30 days. Cost-meter is logged per request.</p>
            <div className="overflow-x-auto -mx-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Provider</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Calls</TableHead>
                    <TableHead>Cost (USD)</TableHead>
                    <TableHead>Avg latency</TableHead>
                    <TableHead>Error rate</TableHead>
                    <TableHead>Trend</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ADMIN_PROVIDER_USAGE.map((p) => (
                    <TableRow key={p.provider}>
                      <TableCell className="font-medium text-sm">{p.provider}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">{p.category}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm tabular-nums">{p.calls.toLocaleString()}</TableCell>
                      <TableCell className="font-mono text-sm tabular-nums">${p.costUsd.toFixed(2)}</TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">{p.avgLatencyMs.toLocaleString()}ms</TableCell>
                      <TableCell className={cn("font-mono text-sm tabular-nums", p.errorRate > 2 ? "text-warning" : p.errorRate > 0.5 ? "text-muted-foreground" : "text-primary")}>
                        {p.errorRate.toFixed(1)}%
                      </TableCell>
                      <TableCell>
                        {p.trend === "up" ? <TrendingUp className="h-4 w-4 text-primary" /> :
                         p.trend === "down" ? <TrendingDown className="h-4 w-4 text-danger" /> :
                         <Minus className="h-4 w-4 text-muted-foreground" />}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Separator className="my-4" />
            <p className="text-xs text-muted-foreground">
              The AI gateway applies a circuit breaker per provider. When error rate exceeds 5%
              over 1 minute, the provider is tripped and fallback providers are used. After 30s,
              a half-open probe re-checks the provider.
            </p>
          </Card>
        </TabsContent>

        {/* Moderation */}
        <TabsContent value="moderation" className="mt-4 space-y-4">
          <Card className="p-5 glass">
            <h2 className="font-semibold mb-3">Moderation queue</h2>
            <div className="space-y-2">
              {ADMIN_MODERATION.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-lg border border-border/60 bg-surface/40"
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "h-9 w-9 rounded-lg grid place-items-center shrink-0",
                      item.status === "blocked" ? "bg-danger/15 text-danger" :
                      item.status === "flagged" ? "bg-accent/15 text-accent" :
                      item.status === "pending" ? "bg-amber-500/15 text-amber-300" :
                      "bg-primary/15 text-primary"
                    )}>
                      {item.status === "blocked" ? <Ban className="h-4 w-4" /> :
                       item.status === "approved" ? <CheckCircle2 className="h-4 w-4" /> :
                       <AlertTriangle className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">{item.type}</Badge>
                        <Badge variant="outline" className={cn("text-[10px]", MOD_STATUS_COLOR[item.status])}>{item.status}</Badge>
                        <span className="text-xs text-muted-foreground">· {item.orgName} · {new Date(item.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-sm font-medium mt-1">{item.reason}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 font-mono">{item.preview}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {item.status === "pending" && (
                        <>
                          <Button size="sm" variant="outline" className="h-7" onClick={() => toast.success("Approved")}>
                            Approve
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 border-danger/40 text-danger hover:bg-danger/10" onClick={() => toast.success("Blocked")}>
                            Block
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>

          <div className="grid sm:grid-cols-2 gap-3">
            <Card className="p-4 glass">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-sm">Copyright checks</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Music and stock assets come only from licensed sources (Storyblocks, Pexels, Pixabay).
                AI-generated images run through perceptual-hash matching against a known copyright registry.
                Matches above 0.85 similarity are auto-flagged for human review.
              </p>
            </Card>
            <Card className="p-4 glass">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-sm">AI disclosure</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Every export includes an "AI-generated with ViralForge AI" bumper at the end. This
                complies with YouTube&apos;s 2024 AI disclosure policy and the EU AI Act&apos;s
                transparency requirements for synthetic media.
              </p>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function KpiCard({ label, value, sub, icon: Icon, danger }: { label: string; value: string; sub: string; icon: typeof Building2; danger?: boolean }) {
  return (
    <Card className={cn("p-4 glass relative overflow-hidden", danger && "border-danger/30")}>
      <div className={cn("absolute -top-8 -end-8 h-24 w-24 rounded-full blur-2xl", danger ? "bg-danger/15" : "bg-primary/10")} />
      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold tabular-nums">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-[11px] text-muted-foreground/70 mt-0.5">{sub}</p>
        </div>
        <div className={cn("h-9 w-9 rounded-lg grid place-items-center", danger ? "bg-danger/15" : "bg-primary/15")}>
          <Icon className={cn("h-4.5 w-4.5", danger ? "text-danger" : "text-primary")} />
        </div>
      </div>
    </Card>
  );
}
