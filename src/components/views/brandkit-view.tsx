"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Palette,
  Type,
  Upload,
  Film,
  Image as ImageIcon,
  Check,
  Eye,
  Download,
  Sparkles,
  Droplet,
  Music,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const PRESET_COLORS = [
  { name: "Soft neon green", value: "oklch(0.72 0.20 155)" },
  { name: "Cinematic purple", value: "oklch(0.70 0.24 295)" },
  { name: "Warm amber", value: "oklch(0.80 0.16 85)" },
  { name: "Coral red", value: "oklch(0.65 0.22 25)" },
  { name: "Deep teal", value: "oklch(0.70 0.18 200)" },
  { name: "Electric blue", value: "oklch(0.65 0.20 250)" },
  { name: "Magenta", value: "oklch(0.65 0.25 350)" },
  { name: "Muted gold", value: "oklch(0.78 0.13 75)" },
];

const FONTS = [
  { id: "inter", name: "Inter", desc: "Modern, neutral" },
  { id: "geist", name: "Geist", desc: "Geometric, tech" },
  { id: "vazirmatn", name: "Vazirmatn", desc: "Persian / Arabic" },
  { id: "playfair", name: "Playfair Display", desc: "Editorial serif" },
  { id: "noto-sans", name: "Noto Sans", desc: "Universal" },
];

export function BrandKitView() {
  const [primary, setPrimary] = useState("oklch(0.72 0.20 155)");
  const [secondary, setSecondary] = useState("oklch(0.70 0.24 295)");
  const [font, setFont] = useState("inter");
  const [logoUploaded, setLogoUploaded] = useState(false);
  const [introUploaded, setIntroUploaded] = useState(false);
  const [outroUploaded, setOutroUploaded] = useState(false);
  const [watermarkUploaded, setWatermarkUploaded] = useState(false);

  const save = () => toast.success("Brand kit saved", { description: "All future renders will use this kit." });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 lg:py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Brand kit</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every render in your organization uses this kit by default.
          </p>
        </div>
        <Button onClick={save} className="glow-primary">
          <Check className="h-4 w-4 me-2" />
          Save brand kit
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Logo */}
        <Card className="p-5 glass space-y-3">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm">Logo</h3>
          </div>
          <div
            className={cn(
              "aspect-video rounded-lg border-2 border-dashed grid place-items-center transition-colors",
              logoUploaded ? "border-primary/40 bg-primary/5" : "border-border/60 hover:border-primary/40",
            )}
          >
            {logoUploaded ? (
              <div className="text-center">
                <div className="mx-auto h-14 w-14 rounded-xl bg-gradient-to-br from-primary to-accent grid place-items-center">
                  <span className="text-xl font-bold text-primary-foreground">VF</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">logo.svg · 4 KB</p>
              </div>
            ) : (
              <button
                onClick={() => { setLogoUploaded(true); toast.success("Logo uploaded"); }}
                className="text-center px-4 py-3"
              >
                <Upload className="h-6 w-6 mx-auto text-muted-foreground" />
                <p className="mt-2 text-xs font-medium">Drop SVG / PNG here</p>
                <p className="text-[10px] text-muted-foreground">Transparent background · max 1 MB</p>
              </button>
            )}
          </div>
        </Card>

        {/* Colors */}
        <Card className="p-5 glass space-y-3 lg:col-span-2">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm">Colors</h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Primary</Label>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="h-9 w-9 rounded-lg border border-border" style={{ background: primary }} />
                <Input value={primary} onChange={(e) => setPrimary(e.target.value)} className="font-mono text-xs" />
              </div>
            </div>
            <div>
              <Label className="text-xs">Secondary / accent</Label>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="h-9 w-9 rounded-lg border border-border" style={{ background: secondary }} />
                <Input value={secondary} onChange={(e) => setSecondary(e.target.value)} className="font-mono text-xs" />
              </div>
            </div>
          </div>
          <Separator />
          <div>
            <p className="text-xs text-muted-foreground mb-2">Presets</p>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setPrimary(c.value)}
                  className="aspect-square rounded-lg border border-border hover:scale-105 transition-transform relative"
                  style={{ background: c.value }}
                  title={c.name}
                >
                  {primary === c.value && (
                    <Check className="absolute inset-0 m-auto h-4 w-4 text-primary-foreground" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Font */}
        <Card className="p-5 glass space-y-3 lg:col-span-2">
          <div className="flex items-center gap-2">
            <Type className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm">Typography</h3>
          </div>
          <Select value={font} onValueChange={setFont}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONTS.map((f) => (
                <SelectItem key={f.id} value={f.id}>
                  <div className="flex items-center gap-2">
                    <span>{f.name}</span>
                    <span className="text-xs text-muted-foreground">· {f.desc}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="rounded-lg border border-border/60 bg-surface/40 p-4">
            <p className="text-xs text-muted-foreground mb-1">Preview</p>
            <p className="text-2xl font-bold">Did you know the sky isn&apos;t blue?</p>
            <p className="text-sm text-muted-foreground mt-1">It&apos;s called Rayleigh scattering.</p>
          </div>
          <div className="rounded-lg border border-info/30 bg-info/5 p-3 text-xs flex items-start gap-2">
            <Droplet className="h-4 w-4 text-info shrink-0 mt-0.5" />
            <p className="text-muted-foreground">
              Vazirmatn is auto-selected when language is set to Persian (فارسی) or Arabic. RTL
              captions are rendered correctly in Remotion + FFmpeg.
            </p>
          </div>
        </Card>

        {/* Intro / Outro */}
        <Card className="p-5 glass space-y-3">
          <div className="flex items-center gap-2">
            <Film className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm">Intro &amp; outro</h3>
          </div>
          {[
            { label: "Intro clip", state: introUploaded, set: setIntroUploaded, hint: "2–3s, fades in" },
            { label: "Outro clip", state: outroUploaded, set: setOutroUploaded, hint: "3–5s, fades out" },
          ].map((item) => (
            <div key={item.label}>
              <Label className="text-xs">{item.label}</Label>
              <div
                className={cn(
                  "mt-1.5 aspect-video rounded-lg border-2 border-dashed grid place-items-center transition-colors",
                  item.state ? "border-primary/40 bg-primary/5" : "border-border/60 hover:border-primary/40",
                )}
              >
                {item.state ? (
                  <button onClick={() => item.set(false)} className="text-center">
                    <Film className="h-6 w-6 mx-auto text-primary" />
                    <p className="mt-1 text-xs">{item.label.toLowerCase().replace(" ", "_")}.mp4</p>
                  </button>
                ) : (
                  <button onClick={() => { item.set(true); toast.success(`${item.label} uploaded`); }} className="text-center px-4 py-3">
                    <Upload className="h-5 w-5 mx-auto text-muted-foreground" />
                    <p className="mt-1 text-[10px] text-muted-foreground">{item.hint}</p>
                  </button>
                )}
              </div>
            </div>
          ))}
        </Card>

        {/* Watermark */}
        <Card className="p-5 glass space-y-3">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm">Watermark</h3>
            <Badge variant="outline" className="text-[10px] ms-auto">Free plan only</Badge>
          </div>
          <div
            className={cn(
              "aspect-video rounded-lg border-2 border-dashed grid place-items-center transition-colors",
              watermarkUploaded ? "border-primary/40 bg-primary/5" : "border-border/60 hover:border-primary/40",
            )}
          >
            {watermarkUploaded ? (
              <button onClick={() => setWatermarkUploaded(false)} className="text-center">
                <div className="h-10 w-10 mx-auto rounded bg-primary/30 grid place-items-center">
                  <span className="text-xs font-bold text-primary">VF</span>
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground">watermark.png</p>
              </button>
            ) : (
              <button onClick={() => { setWatermarkUploaded(true); toast.success("Watermark uploaded"); }} className="text-center px-4 py-3">
                <Upload className="h-5 w-5 mx-auto text-muted-foreground" />
                <p className="mt-1 text-[10px] text-muted-foreground">PNG with alpha · max 200 KB</p>
              </button>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Paid plans automatically remove the ViralForge watermark on exports.
          </p>
        </Card>

        {/* Music library */}
        <Card className="p-5 glass space-y-3">
          <div className="flex items-center gap-2">
            <Music className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm">Default music</h3>
            <Badge variant="outline" className="text-[10px] ms-auto">Licensed</Badge>
          </div>
          <Select defaultValue="ambient-calm">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ambient-calm">Ambient Calm — Storyblocks</SelectItem>
              <SelectItem value="upbeat-electronic">Upbeat Electronic — Storyblocks</SelectItem>
              <SelectItem value="lofi-chill">Lo-Fi Chill — Storyblocks</SelectItem>
              <SelectItem value="tense-news">Tense News — Storyblocks</SelectItem>
              <SelectItem value="motivational-epic">Motivational Epic — Storyblocks</SelectItem>
            </SelectContent>
          </Select>
          <div className="h-12 flex items-end gap-0.5">
            {Array.from({ length: 40 }, (_, i) => (
              <div key={i} className="flex-1 bg-primary/30 rounded-sm" style={{ height: `${20 + Math.abs(Math.sin(i / 2) * 60)}%` }} />
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground">
            All tracks are licensed through Storyblocks. Copyright metadata is recorded per asset.
          </p>
        </Card>
      </div>

      {/* Preview */}
      <Card className="p-5 glass">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">Brand preview</h3>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {["9:16", "1:1", "16:9"].map((ratio) => (
            <div
              key={ratio}
              className={cn(
                "relative rounded-xl overflow-hidden bg-gradient-to-br from-primary/30 to-accent/20 grid place-items-center",
                ratio === "9:16" && "aspect-[9/16] max-h-[400px] mx-auto w-32",
                ratio === "1:1" && "aspect-square max-w-[280px] mx-auto w-full",
                ratio === "16:9" && "aspect-video",
              )}
            >
              <div className="absolute inset-0 grid-pattern opacity-30" />
              {logoUploaded && (
                <div className="absolute top-3 start-3">
                  <div className="h-7 w-7 rounded bg-gradient-to-br from-primary to-accent grid place-items-center">
                    <span className="text-[9px] font-bold text-primary-foreground">VF</span>
                  </div>
                </div>
              )}
              <div className="text-center">
                <p className="text-sm font-bold text-white drop-shadow">{ratio}</p>
                <p className="text-xs text-white/80 mt-1">{FONTS.find((f) => f.id === font)?.name}</p>
              </div>
              <div className="absolute bottom-3 end-3 h-3 w-3 rounded" style={{ background: primary }} />
              <div className="absolute bottom-3 start-3 h-3 w-3 rounded" style={{ background: secondary }} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
