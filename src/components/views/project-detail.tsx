"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  Volume2,
  Captions,
  Film,
  RotateCw,
  Download,
  Share2,
  MoreVertical,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowLeft,
  GripVertical,
  Sparkles,
  Wand2,
  Scissors,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  PROJECT_SCENES,
  RECENT_JOBS,
  type View,
  type ProjectStatus,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ProjectDetailProps {
  setView: (v: View) => void;
  openProjectId: string | null;
}

const PIPELINE: ProjectStatus[] = [
  "DRAFT", "QUEUED", "SCRIPTING", "ASSET_PLANNING", "ASSET_GENERATION",
  "VOICEOVER", "CAPTION_SYNC", "ASSEMBLING", "RENDERING", "QC", "COMPLETED",
];

export function ProjectDetail({ setView, openProjectId }: ProjectDetailProps) {
  // Find the project by id (or default to most recent)
  const job = RECENT_JOBS.find((j) => j.projectId === openProjectId) ?? RECENT_JOBS[0];
  const [scenes, setScenes] = useState(PROJECT_SCENES);
  const [activeSceneId, setActiveSceneId] = useState(scenes[0].id);
  const [playing, setPlaying] = useState(false);
  const [currentMs, setCurrentMs] = useState(0);
  const activeScene = scenes.find((s) => s.id === activeSceneId) ?? scenes[0];

  const regenerateScene = (id: string) => {
    setScenes((arr) => arr.map((s) => (s.id === id ? { ...s, status: "regenerating" } : s)));
    toast("Regenerating scene", { description: "Worker enqueued on the asset queue." });
    setTimeout(() => {
      setScenes((arr) => arr.map((s) => (s.id === id ? { ...s, status: "ready" } : s)));
      toast.success("Scene regenerated", { description: "New asset cached by prompt hash." });
    }, 2200);
  };

  const updateCaption = (id: string, caption: string) => {
    setScenes((arr) => arr.map((s) => (s.id === id ? { ...s, caption } : s)));
  };

  const moveScene = (id: string, dir: -1 | 1) => {
    setScenes((arr) => {
      const idx = arr.findIndex((s) => s.id === id);
      const next = idx + dir;
      if (next < 0 || next >= arr.length) return arr;
      const copy = [...arr];
      [copy[idx], copy[next]] = [copy[next], copy[idx]];
      // Re-index
      return copy.map((s, i) => ({ ...s, index: i }));
    });
  };

  // Determine pipeline progress position
  const currentStepIdx = PIPELINE.indexOf(job.status);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 lg:py-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <Button variant="ghost" size="icon" onClick={() => setView("dashboard")} className="mt-1">
            <ArrowLeft className="h-5 w-5 ltr-flip" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight truncate">{job.projectTitle}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
              <Badge variant="outline" className="text-[10px]">{job.aspectRatio}</Badge>
              <Badge variant="outline" className="text-[10px]">{job.resolution}</Badge>
              <Badge variant="outline" className="text-[10px]">{job.durationSec}s</Badge>
              <Badge variant="outline" className="text-[10px]">{job.model}</Badge>
              <span>·</span>
              <span>Job {job.id}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 me-2" />
            Share
          </Button>
          <Button size="sm" disabled={job.status !== "COMPLETED"}>
            <Download className="h-4 w-4 me-2" />
            Export
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Wand2 className="h-4 w-4 me-2" /> Regenerate all scenes
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Scissors className="h-4 w-4 me-2" /> Trim
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Plus className="h-4 w-4 me-2" /> Add scene
              </DropdownMenuItem>
              <DropdownMenuItem className="text-danger">
                <AlertTriangle className="h-4 w-4 me-2" /> Delete project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Pipeline timeline */}
      <Card className="p-4 glass">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold">Pipeline progress</h3>
          <div className="flex items-center gap-2 text-xs">
            <span className={cn(
              "inline-flex items-center gap-1.5",
              job.status === "COMPLETED" ? "text-primary" : job.status === "FAILED" ? "text-danger" : "text-amber-400"
            )}>
              {job.status === "COMPLETED" ? <CheckCircle2 className="h-3.5 w-3.5" /> :
               job.status === "FAILED" ? <AlertTriangle className="h-3.5 w-3.5" /> :
               <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {job.status}
            </span>
            {job.actualCostCredits !== null && (
              <Badge variant="outline" className="text-[10px]">{job.actualCostCredits} credits settled</Badge>
            )}
          </div>
        </div>
        <div className="relative">
          <div className="overflow-x-auto pb-2">
            <div className="flex items-center gap-1 min-w-max">
              {PIPELINE.map((step, i) => {
                const done = i < currentStepIdx;
                const active = i === currentStepIdx;
                const failed = job.status === "FAILED" && active;
                return (
                  <div key={step} className="flex items-center gap-1 shrink-0">
                    <div
                      className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-mono border transition-colors",
                        done && "bg-primary/15 text-primary border-primary/30",
                        active && !failed && "bg-amber-500/15 text-amber-300 border-amber-500/40",
                        failed && "bg-danger/15 text-danger border-danger/40",
                        !done && !active && "bg-surface/40 text-muted-foreground/60 border-border/60",
                      )}
                    >
                      {done ? <CheckCircle2 className="h-3 w-3" /> :
                       active ? <Loader2 className="h-3 w-3 animate-spin" /> :
                       failed ? <AlertTriangle className="h-3 w-3" /> :
                       <span className="h-3 w-3 grid place-items-center text-[9px]">{i + 1}</span>}
                      {step}
                    </div>
                    {i < PIPELINE.length - 1 && (
                      <div className={cn("h-px w-4", done ? "bg-primary/40" : "bg-border/60")} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          {job.status !== "COMPLETED" && job.status !== "FAILED" && (
            <Progress value={job.progress} className="h-1 mt-3" />
          )}
          {job.error && (
            <div className="mt-3 rounded-lg border border-danger/30 bg-danger/10 p-3 text-xs flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-danger shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-danger">Render failed</p>
                <p className="text-muted-foreground mt-0.5">{job.error}</p>
                <Button size="sm" variant="outline" className="mt-2 border-danger/40">
                  <RotateCw className="h-3.5 w-3.5 me-1.5" />
                  Retry from failed step
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Main grid: preview + scene list */}
      <div className="grid lg:grid-cols-5 gap-4">
        {/* Preview */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-3 glass">
            <div className={cn("relative aspect-[9/16] sm:aspect-video lg:aspect-[9/16] rounded-xl bg-gradient-to-br overflow-hidden", job.thumbnail)}>
              <div className="absolute inset-0 grid-pattern opacity-30" />
              <div className="absolute inset-0 noise" />
              {/* Big play button */}
              <button
                onClick={() => setPlaying((p) => !p)}
                className="absolute inset-0 grid place-items-center group"
              >
                <div className="h-16 w-16 rounded-full bg-background/70 backdrop-blur grid place-items-center group-hover:scale-110 transition-transform">
                  {playing ? (
                    <Pause className="h-7 w-7 text-primary" fill="currentColor" />
                  ) : (
                    <Play className="h-7 w-7 text-primary ms-1" fill="currentColor" />
                  )}
                </div>
              </button>

              {/* Active scene caption */}
              <div className="absolute inset-x-3 bottom-16 sm:bottom-10 lg:bottom-16 text-center">
                <p className="text-sm sm:text-base font-bold text-white drop-shadow-lg leading-snug">
                  {activeScene.caption}
                </p>
              </div>

              {/* Safe zone overlay (toggleable in production) */}
              <div className="pointer-events-none absolute inset-x-3 top-[12%] bottom-[18%] border border-dashed border-primary/40 rounded-lg" />

              {/* Watermark badge (free plan) */}
              {job.resolution === "720p" && (
                <Badge className="absolute top-3 start-3 bg-black/40 text-white border-white/20 backdrop-blur text-[10px]">
                  ViralForge AI
                </Badge>
              )}
            </div>

            {/* Custom timeline scrubber */}
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-muted-foreground">
                  {Math.floor(currentMs / 1000)}s
                </span>
                <div className="flex-1 h-1.5 rounded-full bg-surface/60 relative overflow-hidden">
                  {scenes.map((s, i) => (
                    <div
                      key={s.id}
                      className="absolute top-0 bottom-0 bg-primary/30 border-e border-background last:border-e-0"
                      style={{
                        left: `${(s.startMs / (job.durationSec * 1000)) * 100}%`,
                        width: `${((s.endMs - s.startMs) / (job.durationSec * 1000)) * 100}%`,
                      }}
                      onClick={() => { setActiveSceneId(s.id); setCurrentMs(s.startMs); }}
                    >
                      <span className="absolute -top-4 inset-x-0 text-center text-[9px] text-muted-foreground/80 font-mono">
                        {i + 1}
                      </span>
                    </div>
                  ))}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-primary"
                    style={{ left: `${(currentMs / (job.durationSec * 1000)) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-muted-foreground">{job.durationSec}s</span>
              </div>
              <div className="flex items-center gap-2">
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setPlaying((p) => !p)}>
                  {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ms-0.5" />}
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8">
                  <Volume2 className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8">
                  <Captions className="h-4 w-4" />
                </Button>
                <span className="ms-auto text-xs text-muted-foreground">
                  Scene {activeScene.index + 1} / {scenes.length}
                </span>
              </div>
            </div>
          </Card>

          {/* Audio waveform mock */}
          <Card className="p-4 glass">
            <div className="flex items-center gap-2 mb-2">
              <Volume2 className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">Audio</h3>
              <Badge variant="outline" className="text-[10px] ms-auto">−14 LUFS</Badge>
            </div>
            <div className="h-16 flex items-end gap-0.5">
              {Array.from({ length: 60 }, (_, i) => (
                <div
                  key={i}
                  className="flex-1 bg-primary/40 rounded-sm"
                  style={{ height: `${20 + Math.abs(Math.sin(i / 3) * 50 + Math.cos(i / 7) * 30)}%` }}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Voiceover + music. Music ducking applied at −12 dB under voice.
            </p>
          </Card>
        </div>

        {/* Scene editor + tabs */}
        <div className="lg:col-span-3 space-y-4">
          <Tabs defaultValue="scenes">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="scenes">Scenes</TabsTrigger>
                <TabsTrigger value="captions">Captions</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              <Button size="sm" variant="outline" onClick={() => setView("create")}>
                <Plus className="h-3.5 w-3.5 me-1.5" />
                New video
              </Button>
            </div>

            <TabsContent value="scenes" className="mt-4 space-y-3">
              <AnimatePresence>
                {scenes.map((scene, i) => (
                  <motion.div
                    key={scene.id}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <Card
                      className={cn(
                        "p-4 glass transition-all cursor-pointer",
                        activeSceneId === scene.id ? "ring-1 ring-primary/40" : "hover:bg-surface/60",
                      )}
                      onClick={() => setActiveSceneId(scene.id)}
                    >
                      <div className="flex items-start gap-3">
                        {/* Drag handle */}
                        <div className="flex flex-col items-center gap-1 pt-1 shrink-0">
                          <GripVertical className="h-4 w-4 text-muted-foreground/40 cursor-grab" />
                          <span className="text-xs font-mono text-muted-foreground">
                            {String(i + 1).padStart(2, "0")}
                      </span>
                        </div>

                        {/* Thumbnail */}
                        <div className={cn("relative h-16 w-24 sm:w-28 rounded-lg bg-gradient-to-br shrink-0 overflow-hidden", scene.thumbnail)}>
                          <div className="absolute inset-0 grid-pattern opacity-30" />
                          <div className="absolute inset-0 grid place-items-center">
                            <Play className="h-5 w-5 text-white/80" fill="currentColor" />
                          </div>
                          {scene.status === "regenerating" && (
                            <div className="absolute inset-0 bg-background/70 grid place-items-center">
                              <Loader2 className="h-5 w-5 text-primary animate-spin" />
                            </div>
                          )}
                          {scene.status === "failed" && (
                            <div className="absolute inset-0 bg-danger/30 grid place-items-center">
                              <AlertTriangle className="h-5 w-5 text-danger" />
                            </div>
                          )}
                          <Badge className="absolute bottom-1 end-1 text-[9px] bg-black/50 text-white border-white/20 backdrop-blur">
                            {scene.assetType}
                          </Badge>
                        </div>

                        {/* Body */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-[10px]">
                              {Math.round(scene.startMs / 1000)}s–{Math.round(scene.endMs / 1000)}s
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">{scene.provider}</span>
                            {scene.status === "regenerating" && (
                              <Badge className="text-[10px] bg-amber-500/20 text-amber-300 border-amber-500/40">
                                <Loader2 className="h-3 w-3 me-1 animate-spin" />
                                Regenerating
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm font-medium line-clamp-2">{scene.scriptText}</p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-1 shrink-0">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                onClick={(e) => { e.stopPropagation(); regenerateScene(scene.id); }}
                                disabled={scene.status === "regenerating"}
                              >
                                <RotateCw className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Regenerate this scene</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                onClick={(e) => { e.stopPropagation(); moveScene(scene.id, -1); }}
                                disabled={i === 0}
                              >
                                <ArrowLeft className="h-3.5 w-3.5 ltr-flip" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Move up</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                onClick={(e) => { e.stopPropagation(); moveScene(scene.id, 1); }}
                                disabled={i === scenes.length - 1}
                              >
                                <ArrowLeft className="h-3.5 w-3.5 rotate-180 ltr-flip" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Move down</TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </TabsContent>

            <TabsContent value="captions" className="mt-4 space-y-3">
              <div className="rounded-lg border border-info/30 bg-info/5 p-3 text-xs flex items-start gap-2">
                <Captions className="h-4 w-4 text-info shrink-0 mt-0.5" />
                <p className="text-muted-foreground">
                  Captions are auto-generated from the voiceover word-level timestamps, then
                  burned in with FFmpeg. The dashed box in the preview shows the safe zone for
                  9:16 (avoids TikTok/Reels UI overlays).
                </p>
              </div>
              {scenes.map((scene) => (
                <Card key={scene.id} className="p-4 glass">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-mono text-muted-foreground">
                      Scene {scene.index + 1} · {Math.round(scene.startMs / 1000)}s–{Math.round(scene.endMs / 1000)}s
                    </span>
                    <Badge variant="outline" className="text-[10px]">{scene.caption.length} chars</Badge>
                  </div>
                  <Textarea
                    value={scene.caption}
                    onChange={(e) => updateCaption(scene.id, e.target.value)}
                    rows={2}
                    className="text-sm font-medium resize-none"
                  />
                  <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Line 1 of 2 max (9:16 safe zone)</span>
                    <span>{scene.caption.length}/40 per line recommended</span>
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="settings" className="mt-4">
              <Card className="p-5 glass space-y-4">
                <div>
                  <h3 className="font-semibold text-sm">Project settings</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Read-only for finished renders. Editable on drafts.</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <Field label="Project ID" value={job.projectId} mono />
                  <Field label="Job ID" value={job.id} mono />
                  <Field label="Idempotency key" value={`vf_${job.id.slice(-8)}`} mono />
                  <Field label="Created" value={new Date(job.createdAt).toLocaleString()} />
                  <Field label="Model" value={job.model} />
                  <Field label="Resolution" value={job.resolution} />
                  <Field label="Aspect ratio" value={job.aspectRatio} />
                  <Field label="Duration" value={`${job.durationSec}s`} />
                  <Field label="Estimated credits" value={`${job.estimatedCostCredits}`} mono />
                  <Field
                    label="Actual credits"
                    value={job.actualCostCredits !== null ? `${job.actualCostCredits}` : "— pending"}
                    mono
                  />
                </div>
                <Separator />
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <p>AI-generated content is disclosed with a bumper at the end of every export.</p>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("font-medium truncate", mono && "font-mono text-xs")}>{value}</p>
    </div>
  );
}
