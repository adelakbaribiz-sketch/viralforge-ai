"use client";

import { motion } from "framer-motion";
import {
  Zap,
  CreditCard,
  Download,
  TrendingUp,
  ArrowUpRight,
  Check,
  Receipt,
  Calendar,
  Coins,
  RefreshCw,
  ArrowDownRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PRICING_PLANS,
  CREDIT_LEDGER,
  INVOICES,
  type View,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface BillingViewProps {
  credits: number;
  plan: string;
  setView: (v: View) => void;
}

const REASON_LABELS: Record<string, { label: string; sign: -1 | 1; color: string }> = {
  subscription_grant: { label: "Subscription grant", sign: 1, color: "text-primary" },
  render_spend: { label: "Render spend", sign: -1, color: "text-danger" },
  render_refund: { label: "Render refund (failure)", sign: 1, color: "text-primary" },
  topup: { label: "Top-up", sign: 1, color: "text-primary" },
  adjustment: { label: "Manual adjustment", sign: -1, color: "text-warning" },
  trial_bonus: { label: "Trial bonus", sign: 1, color: "text-primary" },
};

export function BillingView({ credits, plan, setView }: BillingViewProps) {
  const currentPlan = PRICING_PLANS.find((p) => p.id === plan) ?? PRICING_PLANS[2];
  const used = currentPlan.credits - credits;
  const usedPct = (used / currentPlan.credits) * 100;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 lg:py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Billing &amp; credits</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Stripe-powered. Double-entry append-only ledger. Idempotent webhooks.
        </p>
      </div>

      {/* Current plan summary */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="p-5 glass lg:col-span-2 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Current plan</p>
              <div className="flex items-center gap-3 mt-1">
                <h2 className="text-2xl font-bold">{plan}</h2>
                <Badge className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
                  Active
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                ${currentPlan.price}/mo · {currentPlan.credits.toLocaleString()} credits · {currentPlan.resolution} · {currentPlan.seats} {typeof currentPlan.seats === "number" && currentPlan.seats === 1 ? "seat" : "seats"}
              </p>
            </div>
            <div className="text-end">
              <p className="text-xs text-muted-foreground">Next renewal</p>
              <p className="font-semibold mt-1">Nov 1, 2026</p>
              <p className="text-xs text-muted-foreground">auto-renews</p>
            </div>
          </div>

          <Separator />

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Credit usage this month</p>
              <span className="text-sm font-mono tabular-nums">{used} / {currentPlan.credits.toLocaleString()}</span>
            </div>
            <Progress value={usedPct} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1.5">
              ≈ {Math.floor(credits / 60)} minutes of 1080p left, or {Math.floor(credits / 4)} minutes of 4K.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Button variant="outline" size="sm">
              <RefreshCw className="h-3.5 w-3.5 me-1.5" />
              Manage subscription
            </Button>
            <Button variant="outline" size="sm">
              <CreditCard className="h-3.5 w-3.5 me-1.5" />
              Update payment
            </Button>
            <Button variant="outline" size="sm" onClick={() => toast("Opening Customer Portal...")}>
              <Download className="h-3.5 w-3.5 me-1.5" />
              Download invoices
            </Button>
            <Button
              size="sm"
              className="ms-auto glow-primary"
              onClick={() => toast.success("Top-up created", { description: "100 credits added via Stripe Checkout." })}
            >
              <Coins className="h-3.5 w-3.5 me-1.5" />
              Top up credits
            </Button>
          </div>
        </Card>

        {/* Credit balance */}
        <Card className="p-5 glass space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm">Credit balance</h3>
          </div>
          <div>
            <p className="text-4xl font-bold tabular-nums">{credits.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">credits remaining</p>
          </div>
          <Separator />
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Reserved (active jobs)</span>
              <span className="font-mono">−90</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Effective balance</span>
              <span className="font-mono font-semibold">{credits - 90}</span>
            </div>
          </div>
          <div className="rounded-lg border border-warning/30 bg-warning/10 p-2.5 text-xs">
            <p className="text-warning font-medium">Run out of credits?</p>
            <p className="text-muted-foreground mt-0.5">Active jobs keep running. New jobs are blocked until renewal.</p>
          </div>
        </Card>
      </div>

      {/* Plans grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold">Change plan</h2>
            <p className="text-xs text-muted-foreground">Pro-rated automatically via Stripe.</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {PRICING_PLANS.map((p, i) => {
            const isCurrent = p.id === plan;
            const isUpgrade = PRICING_PLANS.findIndex((x) => x.id === p.id) > PRICING_PLANS.findIndex((x) => x.id === plan);
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={cn(
                  "rounded-2xl p-4 space-y-3 flex flex-col",
                  p.highlight ? "glass-strong gradient-border" : "glass border border-border/60",
                  isCurrent && "ring-1 ring-primary",
                )}
              >
                <div className="flex items-start justify-between">
                  <p className="font-semibold text-sm">{p.id}</p>
                  {isCurrent && <Badge className="text-[10px] bg-primary/20 text-primary border-primary/40">Current</Badge>}
                  {p.highlight && !isCurrent && <Badge className="text-[10px] bg-gradient-to-r from-primary to-accent text-primary-foreground">Popular</Badge>}
                </div>
                <div>
                  <p className="text-2xl font-bold tracking-tight">
                    ${p.price}<span className="text-xs text-muted-foreground font-normal">/mo</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{p.credits.toLocaleString()} credits</p>
                </div>
                <ul className="space-y-1 text-[11px] text-muted-foreground flex-1">
                  {p.features.slice(0, 3).map((f) => (
                    <li key={f} className="flex items-start gap-1">
                      <Check className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  size="sm"
                  variant={isCurrent ? "outline" : isUpgrade ? "default" : "outline"}
                  disabled={isCurrent}
                  className="w-full"
                  onClick={() => toast.success(`Switching to ${p.id}`, { description: "Stripe Checkout session started." })}
                >
                  {isCurrent ? "Current plan" : isUpgrade ? `Upgrade to ${p.id}` : `Downgrade to ${p.id}`}
                </Button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Credit ledger */}
      <Card className="p-5 glass">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold">Credit ledger</h2>
            <p className="text-xs text-muted-foreground">
              Append-only · double-entry · atomic per Stripe webhook event ID
            </p>
          </div>
          <Button variant="outline" size="sm">
            <Download className="h-3.5 w-3.5 me-1.5" />
            Export CSV
          </Button>
        </div>
        <div className="overflow-x-auto -mx-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead className="text-end">Delta</TableHead>
                <TableHead className="text-end">Balance after</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {CREDIT_LEDGER.map((entry) => {
                const meta = REASON_LABELS[entry.reason] ?? { label: entry.reason, sign: -1 as const, color: "text-muted-foreground" };
                const sign = entry.delta >= 0 ? "+" : "";
                return (
                  <TableRow key={entry.id}>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(entry.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">{meta.label}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{entry.refId}</TableCell>
                    <TableCell className={cn("text-end font-mono tabular-nums", entry.delta >= 0 ? "text-primary" : "text-danger")}>
                      {sign}{entry.delta}
                    </TableCell>
                    <TableCell className="text-end font-mono tabular-nums">{entry.balanceAfter}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Invoices */}
      <Card className="p-5 glass">
        <div className="flex items-center gap-2 mb-4">
          <Receipt className="h-4 w-4 text-primary" />
          <h2 className="font-semibold">Invoices</h2>
        </div>
        <div className="overflow-x-auto -mx-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Number</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {INVOICES.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-mono text-xs">{inv.number}</TableCell>
                  <TableCell className="text-sm">
                    <Calendar className="h-3.5 w-3.5 inline me-1.5 text-muted-foreground" />
                    {inv.period}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{inv.date}</TableCell>
                  <TableCell className="font-mono">${inv.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px]",
                        inv.status === "paid" && "bg-primary/15 text-primary border-primary/30",
                        inv.status === "open" && "bg-amber-500/15 text-amber-300 border-amber-500/40",
                        inv.status === "void" && "bg-muted text-muted-foreground border-border",
                      )}
                    >
                      {inv.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-end">
                    <Button variant="ghost" size="sm" onClick={() => toast("Downloading invoice...")}>
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
