"use client";

import { useState } from "react";
import {
  Users,
  KeyRound,
  Webhook,
  Shield,
  Plus,
  Copy,
  Trash2,
  MoreVertical,
  Check,
  AlertTriangle,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TEAM_MEMBERS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const ROLE_COLORS: Record<string, string> = {
  OWNER: "bg-gradient-to-r from-primary to-accent text-primary-foreground",
  ADMIN: "bg-primary/20 text-primary border-primary/40",
  EDITOR: "bg-surface/60 text-foreground border-border/60",
  VIEWER: "bg-muted text-muted-foreground border-border/60",
};

export function SettingsView() {
  const [members, setMembers] = useState(TEAM_MEMBERS);
  const [webhooks, setWebhooks] = useState([
    { id: "wh_01", url: "https://hooks.example.com/vf", events: ["render.completed", "render.failed"], active: true },
    { id: "wh_02", url: "https://api.partner.io/vf/inbox", events: ["credit.low"], active: true },
  ]);
  const [apiKeys, setApiKeys] = useState([
    { id: "key_01", name: "Production", prefix: "vf_live_8af2", created: "2026-09-12", lastUsed: "12m ago", masked: true },
    { id: "key_02", name: "Staging", prefix: "vf_test_3b71", created: "2026-08-22", lastUsed: "yesterday", masked: true },
  ]);
  const [showKey, setShowKey] = useState<string | null>(null);
  const [twoFactor, setTwoFactor] = useState(true);
  const [requireSso, setRequireSso] = useState(false);
  const [auditLog, setAuditLog] = useState(true);

  const changeRole = (id: string, role: typeof TEAM_MEMBERS[number]["role"]) => {
    setMembers((arr) => arr.map((m) => (m.id === id ? { ...m, role } : m)));
    toast.success("Role updated");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 lg:py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Team, API, webhooks, and security. Every change is recorded in the audit log.
        </p>
      </div>

      <Tabs defaultValue="team">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="team"><Users className="h-4 w-4 me-2" /> Team</TabsTrigger>
          <TabsTrigger value="api"><KeyRound className="h-4 w-4 me-2" /> API keys</TabsTrigger>
          <TabsTrigger value="webhooks"><Webhook className="h-4 w-4 me-2" /> Webhooks</TabsTrigger>
          <TabsTrigger value="security"><Shield className="h-4 w-4 me-2" /> Security</TabsTrigger>
        </TabsList>

        {/* Team */}
        <TabsContent value="team" className="mt-4 space-y-4">
          <Card className="p-5 glass">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold">Team members</h2>
                <p className="text-xs text-muted-foreground">
                  {members.length} of 25 seats used on the Agency plan.
                </p>
              </div>
              <Button size="sm" onClick={() => toast.success("Invite sent", { description: "Email sent to invitee." })}>
                <Plus className="h-3.5 w-3.5 me-1.5" />
                Invite member
              </Button>
            </div>
            <div className="overflow-x-auto -mx-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Last active</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className={cn("text-xs font-semibold", ROLE_COLORS[m.role])}>
                              {m.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">{m.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{m.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={m.role}
                          onValueChange={(v) => changeRole(m.id, v as typeof m.role)}
                          disabled={m.role === "OWNER"}
                        >
                          <SelectTrigger className="w-32 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="OWNER" disabled>Owner</SelectItem>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                            <SelectItem value="EDITOR">Editor</SelectItem>
                            <SelectItem value="VIEWER">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{m.lastActive}</TableCell>
                      <TableCell className="text-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 me-2" /> View activity
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-danger"
                              disabled={m.role === "OWNER"}
                              onClick={() => toast.success("Member removed")}
                            >
                              <Trash2 className="h-4 w-4 me-2" /> Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>

          <Card className="p-4 glass text-xs text-muted-foreground flex items-start gap-2">
            <Lock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <p>
              RBAC: Owner (full) · Admin (manage members, billing) · Editor (create &amp; edit projects) · Viewer (read-only).
              Every project query enforces organizationId via Prisma middleware + Postgres RLS.
            </p>
          </Card>
        </TabsContent>

        {/* API Keys */}
        <TabsContent value="api" className="mt-4 space-y-4">
          <Card className="p-5 glass">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold">API keys</h2>
                <p className="text-xs text-muted-foreground">
                  Business &amp; Agency plans only. Keys are hashed at rest, never displayed again after creation.
                </p>
              </div>
              <Button size="sm" onClick={() => {
                const newKey = { id: `key_${Date.now().toString(36)}`, name: "New key", prefix: "vf_live_" + Math.random().toString(36).slice(2, 6), created: new Date().toISOString().slice(0, 10), lastUsed: "never", masked: false };
                setApiKeys((arr) => [newKey, ...arr]);
                toast.success("API key created", { description: "Copy it now — you won't see it again." });
              }}>
                <Plus className="h-3.5 w-3.5 me-1.5" />
                Create key
              </Button>
            </div>
            <div className="space-y-2">
              {apiKeys.map((key) => (
                <div key={key.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-surface/40">
                  <KeyRound className="h-4 w-4 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{key.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {showKey === key.id ? `${key.prefix}xyJhbGciOi...full_key_123` : `${key.prefix}••••••••`}
                    </p>
                  </div>
                  <div className="hidden sm:block text-xs text-muted-foreground">
                    <p>Created {key.created}</p>
                    <p>Last used {key.lastUsed}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setShowKey(showKey === key.id ? null : key.id)}
                    >
                      {showKey === key.id ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => { navigator.clipboard?.writeText(key.prefix); toast.success("Copied"); }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:text-danger"
                      onClick={() => { setApiKeys((arr) => arr.filter((k) => k.id !== key.id)); toast.success("Key revoked"); }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Webhooks */}
        <TabsContent value="webhooks" className="mt-4 space-y-4">
          <Card className="p-5 glass">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold">Webhooks</h2>
                <p className="text-xs text-muted-foreground">
                  Outgoing webhooks for render events. Signed with HMAC-SHA256.
                </p>
              </div>
              <Button size="sm" onClick={() => toast.success("Webhook added")}>
                <Plus className="h-3.5 w-3.5 me-1.5" />
                Add endpoint
              </Button>
            </div>
            <div className="space-y-2">
              {webhooks.map((wh) => (
                <div key={wh.id} className="p-3 rounded-lg border border-border/60 bg-surface/40 space-y-2">
                  <div className="flex items-center gap-3">
                    <Webhook className="h-4 w-4 text-primary shrink-0" />
                    <p className="font-mono text-sm flex-1 truncate">{wh.url}</p>
                    <Switch
                      checked={wh.active}
                      onCheckedChange={(v) => setWebhooks((arr) => arr.map((w) => (w.id === wh.id ? { ...w, active: v } : w)))}
                    />
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-danger"
                      onClick={() => { setWebhooks((arr) => arr.filter((w) => w.id !== wh.id)); toast.success("Webhook deleted"); }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {wh.events.map((e) => (
                      <Badge key={e} variant="outline" className="text-[10px] font-mono">{e}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="mt-4 space-y-4">
          <Card className="p-5 glass space-y-4">
            <h2 className="font-semibold">Security</h2>
            <div className="space-y-3">
              <Toggle
                label="Two-factor authentication"
                description="Require TOTP for all members."
                checked={twoFactor}
                onChange={setTwoFactor}
              />
              <Separator />
              <Toggle
                label="SSO required (SAML/OIDC)"
                description="Business &amp; Agency plans only. Enforce SSO login."
                checked={requireSso}
                onChange={setRequireSso}
              />
              <Separator />
              <Toggle
                label="Audit log"
                description="Record every sensitive action: plan changes, project deletion, admin access."
                checked={auditLog}
                onChange={setAuditLog}
              />
            </div>
          </Card>

          <Card className="p-5 glass">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm">Recent audit log</h3>
            </div>
            <div className="space-y-2 text-xs">
              {[
                { who: "sina@viralforge.ai", what: "Upgraded plan: Pro → Agency", when: "2026-10-28 14:22" },
                { who: "mina@viralforge.ai", what: "Revoked API key \"Staging\"", when: "2026-10-27 11:08" },
                { who: "arman@viralforge.ai", what: "Deleted project prj_2c90", when: "2026-10-26 09:41" },
                { who: "sina@viralforge.ai", what: "Invited babak@viralforge.ai (Viewer)", when: "2026-10-25 17:12" },
                { who: "system", what: "Stripe webhook: invoice.paid (idempotent event.evt_01H)", when: "2026-10-01 00:00" },
              ].map((row, i) => (
                <div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-surface/40">
                  <Check className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p><span className="font-mono">{row.who}</span> — {row.what}</p>
                    <p className="text-muted-foreground mt-0.5">{row.when}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4 glass flex items-start gap-2 text-xs border-warning/30 bg-warning/5">
            <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
            <p className="text-muted-foreground">
              Secrets (Stripe, OpenAI, ElevenLabs, Runway API keys) live only in environment
              variables and are never committed to git. The repo&apos;s <code className="font-mono">.gitignore</code>
              explicitly excludes <code className="font-mono">.env</code>, <code className="font-mono">uploads/</code>, and
              <code className="font-mono">*.mp4</code>.
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Toggle({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (v: boolean) => void; }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <Label className="text-sm font-medium">{label}</Label>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
