"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Wand2,
  Captions,
  Mic,
  Film,
  Loader2,
  Sparkles,
  Volume2,
  Palette,
  Cpu,
  AlertCircle,
  Info,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  CATEGORIES,
  TEMPLATES,
  type View,
  type AspectRatio,
  type Language,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const STEPS = [
  { id: 1, label: "Category & Topic", icon: Wand2 },
  { id: 2, label: "Brief & Tone", icon: Captions },
  { id: 3, label: "Script Draft", icon: Sparkles },
  { id: 4, label: "Voice & Style", icon: Mic },
  { id: 5, label: "Confirm & Render", icon: Film },
];

const briefSchema = z.object({
  topic: z.string().min(8, "Topic must be at least 8 characters"),
  audience: z.string().min(3, "Audience is required"),
  tone: z.enum(["calm", "energetic", "informative", "funny", "dramatic", "casual"]),
  language: z.enum(["en", "fa", "es", "fr", "de", "ar", "tr"]),
  durationSec: z.number().min(15).max(120),
  aspectRatio: z.enum(["9:16", "1:1", "16:9"]),
  cta: z.string().optional(),
});

type BriefForm = z.infer<typeof briefSchema>;

interface CreateWizardProps {
  setView: (v: View) => void;
  setOpenProjectId: (id: string) => void;
  credits: number;
  plan: string;
}

const TONES: { id: BriefForm["tone"]; label: string; emoji: string }[] = [
  { id: "calm", label: "Calm", emoji: "🌿" },
  { id: "energetic", label: "Energetic", emoji: "⚡" },
  { id: "informative", label: "Informative", emoji: "📚" },
  { id: "funny", label: "Funny", emoji: "😂" },
  { id: "dramatic", label: "Dramatic", emoji: "🎭" },
  { id: "casual", label: "Casual", emoji: "👋" },
];

const VOICES = [
  { id: "11-rachel", name: "Rachel", provider: "ElevenLabs Multilingual v2", lang: "EN", gender: "Female", desc: "Warm, professional narrator", gradient: "from-rose-500/30 to-pink-600/20" },
  { id: "11-domi", name: "Domi", provider: "ElevenLabs Multilingual v2", lang: "EN", gender: "Female", desc: "Strong, expressive", gradient: "from-fuchsia-500/30 to-purple-600/20" },
  { id: "11-bella", name: "Bella", provider: "ElevenLabs Flash", lang: "EN", gender: "Female", desc: "Friendly, fast", gradient: "from-amber-500/30 to-orange-600/20" },
  { id: "11-antoni", name: "Antoni", provider: "ElevenLabs Flash", lang: "EN", gender: "Male", desc: "Deep, versatile", gradient: "from-sky-500/30 to-blue-600/20" },
  { id: "11-josh", name: "Josh", provider: "ElevenLabs Multilingual v2", lang: "EN", gender: "Male", desc: "Young, natural", gradient: "from-emerald-500/30 to-teal-600/20" },
  { id: "openai-alloy", name: "Alloy", provider: "OpenAI TTS", lang: "EN", gender: "Neutral", desc: "Cheapest, fastest", gradient: "from-slate-500/30 to-gray-600/20" },
  { id: "11-fa-yara", name: "Yara", provider: "ElevenLabs Multilingual v2", lang: "FA", gender: "Female", desc: "صدا طبیعی فارسی", gradient: "from-cyan-500/30 to-teal-600/20" },
  { id: "11-fa-amir", name: "Amir", provider: "ElevenLabs Multilingual v2", lang: "FA", gender: "Male", desc: "صدای گرم مردانه", gradient: "from-violet-500/30 to-indigo-600/20" },
];

const MODELS = [
  { id: "pika-2.5", name: "Pika 2.5", tier: "Standard", costPerSec720p: 1, mult: "1×", desc: "Best balance of speed & quality", recommended: true },
  { id: "hailuo", name: "Hailuo", tier: "Standard", costPerSec720p: 1, mult: "1×", desc: "Great motion, fast" },
  { id: "runway-g4-turbo", name: "Runway Gen-4 Turbo", tier: "Standard", costPerSec720p: 1, mult: "1×", desc: "Most reliable for cinematic" },
  { id: "luma", name: "Luma Dream Machine", tier: "Premium", costPerSec720p: 2, mult: "2×", desc: "Premium look, slower" },
  { id: "kling-standard", name: "Kling (Standard)", tier: "Premium", costPerSec720p: 2, mult: "2×", desc: "Longer clips, no audio" },
  { id: "runway-g45", name: "Runway Gen-4.5", tier: "Premium", costPerSec720p: 4, mult: "4×", desc: "Top quality, highest cost" },
];

export function CreateWizard({ setView, setOpenProjectId, credits, plan }: CreateWizardProps) {
  const [step, setStep] = useState(1);
  const [categoryId, setCategoryId] = useState("science");
  const [templateId, setTemplateId] = useState<string>("tpl_science_didyouknow");
  const [generating, setGenerating] = useState(false);
  const [scriptDraft, setScriptDraft] = useState<null | {
    hook: string;
    title: string;
    description: string;
    hashtags: string[];
    scenes: { id: string; scriptText: string; visualPrompt: string; onScreenText: string }[];
    voiceover: string;
    cta: string;
  }>(null);
  const [selectedVoice, setSelectedVoice] = useState("11-rachel");
  const [selectedModel, setSelectedModel] = useState("pika-2.5");
  const [burnInCaptions, setBurnInCaptions] = useState(true);
  const [includeBumper, setIncludeBumper] = useState(true);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("9:16");
  const [durationSec, setDurationSec] = useState(30);
  const [language, setLanguage] = useState<Language>("en");
  const [resolution, setResolution] = useState<"720p" | "1080p" | "4K">("1080p");

  const form = useForm<BriefForm>({
    resolver: zodResolver(briefSchema),
    defaultValues: {
      topic: "",
      audience: "",
      tone: "informative",
      language: "en",
      durationSec: 30,
      aspectRatio: "9:16",
      cta: "Subscribe for more",
    },
  });

  const resolutionMult = resolution === "720p" ? 1 : resolution === "1080p" ? 2 : 4;
  const modelMult = MODELS.find((m) => m.id === selectedModel)?.costPerSec720p ?? 1;
  const estimatedCredits = durationSec * resolutionMult * modelMult;
  const canAfford = estimatedCredits <= credits;

  const next = () => setStep((s) => Math.min(5, s + 1));
  const prev = () => setStep((s) => Math.max(1, s - 1));

  const generateScript = async () => {
    setGenerating(true);
    // Simulated structured LLM output (in production: OpenAI/Anthropic via packages/ai)
    await new Promise((r) => setTimeout(r, 1400));
    const topic = form.getValues("topic") || "Why the sky is blue";
    setScriptDraft({
      hook: "Did you know the sky isn't actually blue? It just looks that way because of how sunlight scatters.",
      title: `${topic} — Did You Know?`,
      description: "A 25-second explainer using the 'Did You Know?' template with calm informative tone.",
      hashtags: ["#didyouknow", "#science", "#fyp", "#shorts"],
      scenes: [
        {
          id: "sc_01",
          scriptText: "Did you know the sky isn't actually blue? It just looks that way because of how sunlight scatters off the atmosphere.",
          visualPrompt: "Cinematic wide shot of a clear blue sky slowly transitioning to night, particles of light scattering in slow motion.",
          onScreenText: "The sky isn't really blue",
        },
        {
          id: "sc_02",
          scriptText: "It's called Rayleigh scattering. Shorter blue wavelengths bounce off air molecules more than red ones, reaching your eyes from every direction.",
          visualPrompt: "Macro animation of light waves splitting through a prism, blue waves scattering while red waves pass straight.",
          onScreenText: "Rayleigh scattering",
        },
        {
          id: "sc_03",
          scriptText: "That's why sunsets turn red — light travels through more atmosphere, scattering away the blue and leaving the warm colors behind.",
          visualPrompt: "Timelapse of a golden-red sunset over the ocean, slow push-in, lens flare.",
          onScreenText: "Sunsets = same reason",
        },
        {
          id: "sc_04",
          scriptText: "So next time you look up, remember — the sky isn't really blue. Your eyes are just receiving more blue light than anything else.",
          visualPrompt: "POV shot of someone looking up at the sky, slow zoom into the atmosphere, particles of light.",
          onScreenText: "The sky isn't really blue",
        },
      ],
      voiceover: topic,
      cta: form.getValues("cta") || "Subscribe for more",
    });
    setGenerating(false);
  };

  const submitRender = () => {
    if (!canAfford) {
      toast.error("Not enough credits", { description: `Need ${estimatedCredits}, have ${credits}.` });
      return;
    }
    toast.success("Render job created", {
      description: `${estimatedCredits} credits reserved. Job idempotencyKey=vf_${Date.now().toString(36)}.`,
    });
    setTimeout(() => {
      setOpenProjectId("prj_new");
      setView("project");
    }, 800);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Create a new video</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            5 steps · brief → script → voice → render. No timeline editing required.
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setView("dashboard")}>
          Cancel
        </Button>
      </div>

      {/* Stepper */}
      <div className="mb-8">
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-2">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const active = step === s.id;
            const done = step > s.id;
            return (
              <div key={s.id} className="flex items-center gap-1 sm:gap-2 shrink-0">
                <button
                  onClick={() => s.id < step && setStep(s.id)}
                  className={cn(
                    "flex items-center gap-2 px-2.5 sm:px-3 py-2 rounded-lg text-xs sm:text-sm transition-colors",
                    active
                      ? "bg-primary/15 text-primary border border-primary/30"
                      : done
                        ? "text-muted-foreground hover:text-foreground"
                        : "text-muted-foreground/60",
                  )}
                >
                  <span
                    className={cn(
                      "h-6 w-6 rounded-full grid place-items-center text-xs font-mono shrink-0",
                      active
                        ? "bg-primary text-primary-foreground"
                        : done
                          ? "bg-primary/20 text-primary"
                          : "bg-surface border border-border",
                    )}
                  >
                    {done ? <Check className="h-3.5 w-3.5" /> : s.id}
                  </span>
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <ChevronRight className="h-4 w-4 text-muted-foreground/40 ltr-flip shrink-0" />
                )}
              </div>
            );
          })}
        </div>
        <Progress value={(step / 5) * 100} className="h-1 mt-3" />
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.2 }}
        >
          {/* Step 1: Category & Topic */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-1">Pick a category</h2>
                <p className="text-sm text-muted-foreground">Each category ships with proven hook patterns.</p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategoryId(cat.id)}
                    className={cn(
                      "text-start rounded-xl glass overflow-hidden transition-all",
                      categoryId === cat.id
                        ? "ring-2 ring-primary border-primary/40 glow-primary"
                        : "hover:border-primary/40",
                    )}
                  >
                    <div className={cn("aspect-video bg-gradient-to-br relative", cat.gradient)}>
                      <div className="absolute inset-0 grid-pattern opacity-30" />
                      <div className="absolute inset-0 grid place-items-center">
                        <span className="text-3xl">{cat.emoji}</span>
                      </div>
                      {categoryId === cat.id && (
                        <div className="absolute top-2 end-2 h-6 w-6 rounded-full bg-primary grid place-items-center">
                          <Check className="h-3.5 w-3.5 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-semibold">{cat.label}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{cat.description}</p>
                    </div>
                  </button>
                ))}
              </div>

              <Separator />

              <div>
                <h2 className="text-lg font-semibold mb-1">Pick a template</h2>
                <p className="text-sm text-muted-foreground">A template pre-configures scenes, hook, and music.</p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {TEMPLATES.filter((t) => t.category === categoryId).map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => setTemplateId(tpl.id)}
                    className={cn(
                      "text-start rounded-xl glass p-4 transition-all",
                      templateId === tpl.id
                        ? "ring-2 ring-primary border-primary/40"
                        : "hover:border-primary/40",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold">{tpl.name}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{tpl.description}</p>
                      </div>
                      {templateId === tpl.id && <Check className="h-4 w-4 text-primary shrink-0" />}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <Badge variant="outline" className="text-[10px]">{tpl.scenes} scenes</Badge>
                      <Badge variant="outline" className="text-[10px]">{tpl.duration}s</Badge>
                      <Badge variant="outline" className="text-[10px]">{tpl.hook}</Badge>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={next} disabled={!categoryId || !templateId}>
                  Continue
                  <ArrowRight className="h-4 w-4 ms-2 ltr-flip" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Brief & Tone */}
          {step === 2 && (
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="p-5 glass space-y-4">
                <div>
                  <h2 className="text-lg font-semibold mb-1">Brief &amp; tone</h2>
                  <p className="text-sm text-muted-foreground">Tell us what to make. We&apos;ll handle the script.</p>
                </div>
                <form onSubmit={form.handleSubmit(() => {})} className="space-y-4">
                  <FormField label="Topic" error={form.formState.errors.topic?.message}>
                    <Input
                      placeholder="e.g. Why the sky is blue"
                      {...form.register("topic")}
                    />
                  </FormField>
                  <FormField label="Target audience" error={form.formState.errors.audience?.message}>
                    <Input
                      placeholder="e.g. curious teens, science enthusiasts"
                      {...form.register("audience")}
                    />
                  </FormField>
                  <FormField label="Tone">
                    <div className="grid grid-cols-3 gap-2">
                      {TONES.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => form.setValue("tone", t.id, { shouldValidate: true })}
                          className={cn(
                            "flex flex-col items-center gap-1 py-3 rounded-lg border text-xs transition-colors",
                            form.watch("tone") === t.id
                              ? "border-primary/40 bg-primary/10 text-primary"
                              : "border-border/60 hover:bg-surface/60",
                          )}
                        >
                          <span className="text-xl">{t.emoji}</span>
                          <span>{t.label}</span>
                        </button>
                      ))}
                    </div>
                  </FormField>
                  <FormField label="Language">
                    <Select value={language} onValueChange={(v) => setLanguage(v as Language)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="fa">فارسی (Persian, RTL)</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                        <SelectItem value="ar">العربية (Arabic, RTL)</SelectItem>
                        <SelectItem value="tr">Türkçe</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                  <div className="grid grid-cols-2 gap-3">
                    <FormField label="Aspect ratio">
                      <Select value={aspectRatio} onValueChange={(v) => setAspectRatio(v as AspectRatio)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="9:16">9:16 (vertical / Reels / Shorts)</SelectItem>
                          <SelectItem value="1:1">1:1 (square / feed)</SelectItem>
                          <SelectItem value="16:9">16:9 (horizontal / YouTube)</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>
                    <FormField label={`Duration: ${durationSec}s`}>
                      <div className="pt-2">
                        <Slider
                          value={[durationSec]}
                          min={15}
                          max={90}
                          step={5}
                          onValueChange={(v) => setDurationSec(v[0])}
                        />
                      </div>
                    </FormField>
                  </div>
                  <FormField label="Call-to-action (optional)">
                    <Input
                      placeholder="e.g. Subscribe for more"
                      {...form.register("cta")}
                    />
                  </FormField>
                </form>
              </Card>

              {/* Live preview card */}
              <Card className="p-5 glass space-y-4">
                <h2 className="text-lg font-semibold">Live brief preview</h2>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <PreviewRow label="Category" value={CATEGORIES.find((c) => c.id === categoryId)?.label ?? "—"} />
                  <PreviewRow label="Template" value={TEMPLATES.find((t) => t.id === templateId)?.name ?? "—"} />
                  <PreviewRow label="Topic" value={form.watch("topic") || "—"} />
                  <PreviewRow label="Audience" value={form.watch("audience") || "—"} />
                  <PreviewRow label="Tone" value={TONES.find((t) => t.id === form.watch("tone"))?.label ?? "—"} />
                  <PreviewRow label="Language" value={language.toUpperCase()} />
                  <PreviewRow label="Aspect" value={aspectRatio} />
                  <PreviewRow label="Duration" value={`${durationSec}s`} />
                </div>
                <Separator />
                <div className="rounded-lg border border-info/30 bg-info/5 p-3 text-xs flex items-start gap-2">
                  <Info className="h-4 w-4 text-info shrink-0 mt-0.5" />
                  <p className="text-muted-foreground">
                    The script step will validate the LLM output with Zod before saving. If the
                    schema doesn&apos;t match, the worker retries up to 3 times with exponential
                    backoff.
                  </p>
                </div>
              </Card>

              <div className="lg:col-span-2 flex justify-between pt-2">
                <Button variant="outline" onClick={prev}>
                  <ArrowLeft className="h-4 w-4 me-2 ltr-flip" />
                  Back
                </Button>
                <Button onClick={next} disabled={!form.getValues("topic") || !form.getValues("audience")}>
                  Continue to script
                  <ArrowRight className="h-4 w-4 ms-2 ltr-flip" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Script draft */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Script draft</h2>
                  <p className="text-sm text-muted-foreground">
                    LLM-generated structured script (hook, scenes, voiceover, captions, CTA).
                  </p>
                </div>
                <Button onClick={generateScript} disabled={generating}>
                  {generating ? (
                    <><Loader2 className="h-4 w-4 me-2 animate-spin" /> Generating...</>
                  ) : (
                    <><Wand2 className="h-4 w-4 me-2" /> {scriptDraft ? "Regenerate script" : "Generate script"}</>
                  )}
                </Button>
              </div>

              {!scriptDraft && !generating && (
                <Card className="p-12 glass text-center">
                  <div className="mx-auto h-14 w-14 rounded-full bg-primary/15 grid place-items-center mb-3">
                    <Sparkles className="h-7 w-7 text-primary" />
                  </div>
                  <p className="font-semibold">No script yet</p>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">Generate a structured script from your brief.</p>
                  <Button onClick={generateScript} variant="outline">
                    <Wand2 className="h-4 w-4 me-2" />
                    Generate now
                  </Button>
                </Card>
              )}

              {generating && (
                <Card className="p-8 glass space-y-3">
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 text-primary animate-spin" />
                    <p className="text-sm">Calling LLM with Zod-validated output...</p>
                  </div>
                  <div className="space-y-2">
                    {["Parsing brief + category + tone", "Validating JSON schema", "Generating hook + 4 scenes", "Building voiceover + CTA"].map((s, i) => (
                      <div key={s} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
                        {s}
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {scriptDraft && !generating && (
                <div className="space-y-4">
                  <Card className="p-5 glass">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Badge variant="outline" className="text-[10px] mb-1.5">Hook</Badge>
                        <p className="font-semibold">{scriptDraft.hook}</p>
                      </div>
                      <Badge className="bg-primary/15 text-primary border-primary/30">
                        <Sparkles className="h-3 w-3 me-1" />
                        Generated
                      </Badge>
                    </div>
                    <Separator className="my-4" />
                    <div className="grid sm:grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Title</p>
                        <p className="font-medium">{scriptDraft.title}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Description</p>
                        <p className="font-medium">{scriptDraft.description}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Hashtags</p>
                        <div className="flex flex-wrap gap-1.5">
                          {scriptDraft.hashtags.map((h) => (
                            <Badge key={h} variant="outline" className="text-[10px]">{h}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">CTA</p>
                        <p className="font-medium">{scriptDraft.cta}</p>
                      </div>
                    </div>
                  </Card>

                  <div>
                    <h3 className="text-sm font-semibold mb-3">Scenes ({scriptDraft.scenes.length})</h3>
                    <div className="space-y-3">
                      {scriptDraft.scenes.map((sc, i) => (
                        <Card key={sc.id} className="p-4 glass">
                          <div className="flex items-start gap-3">
                            <div className="h-9 w-9 rounded-lg bg-primary/15 grid place-items-center text-sm font-mono text-primary shrink-0">
                              {String(i + 1).padStart(2, "0")}
                            </div>
                            <div className="flex-1 min-w-0 space-y-2">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-[10px]">{Math.round(i * (durationSec / scriptDraft.scenes.length))}s–{Math.round((i + 1) * (durationSec / scriptDraft.scenes.length))}s</Badge>
                                <Badge variant="outline" className="text-[10px]">Scene {i + 1}</Badge>
                              </div>
                              <p className="text-sm font-medium">{sc.scriptText}</p>
                              <p className="text-xs text-muted-foreground">
                                <span className="font-mono text-primary/70">visualPrompt:</span> {sc.visualPrompt}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                <span className="font-mono text-accent/70">onScreenText:</span> {sc.onScreenText}
                              </p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-lg border border-success/30 bg-success/5 p-3 text-xs flex items-start gap-2">
                    <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    <p className="text-muted-foreground">
                      Script validated with Zod. Worker is ready to move on to asset planning &amp;
                      generation.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={prev}>
                  <ArrowLeft className="h-4 w-4 me-2 ltr-flip" />
                  Back
                </Button>
                <Button onClick={next} disabled={!scriptDraft}>
                  Continue to voice
                  <ArrowRight className="h-4 w-4 ms-2 ltr-flip" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Voice & style */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold">Voice &amp; visual style</h2>
                <p className="text-sm text-muted-foreground">Pick a voice, video model, and rendering options.</p>
              </div>

              {/* Voices */}
              <Card className="p-5 glass">
                <div className="flex items-center gap-2 mb-3">
                  <Mic className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-sm">Voiceover</h3>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {VOICES.filter((v) => language === "fa" ? v.lang === "FA" : v.lang === "EN").map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVoice(v.id)}
                      className={cn(
                        "text-start p-3 rounded-xl glass transition-all",
                        selectedVoice === v.id ? "ring-2 ring-primary border-primary/40" : "hover:border-primary/40",
                      )}
                    >
                      <div className={cn("h-12 w-12 rounded-lg bg-gradient-to-br grid place-items-center mb-2", v.gradient)}>
                        <Volume2 className="h-5 w-5 text-foreground/80" />
                      </div>
                      <p className="font-medium text-sm">{v.name}</p>
                      <p className="text-xs text-muted-foreground">{v.gender} · {v.lang}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">{v.desc}</p>
                      <p className="text-[10px] text-muted-foreground/70 mt-1">{v.provider}</p>
                    </button>
                  ))}
                </div>
              </Card>

              {/* Models */}
              <Card className="p-5 glass">
                <div className="flex items-center gap-2 mb-3">
                  <Cpu className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-sm">Video model</h3>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {MODELS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedModel(m.id)}
                      className={cn(
                        "text-start p-3.5 rounded-xl glass transition-all relative",
                        selectedModel === m.id ? "ring-2 ring-primary border-primary/40" : "hover:border-primary/40",
                      )}
                    >
                      {m.recommended && (
                        <Badge className="absolute -top-2 end-2 text-[10px] bg-primary/20 text-primary border-primary/40">
                          Recommended
                        </Badge>
                      )}
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{m.name}</p>
                        <Badge variant="outline" className="text-[10px]">{m.mult}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{m.desc}</p>
                      <p className="text-[10px] text-muted-foreground/70 mt-1">
                        {m.tier} · ~${(0.04 * m.costPerSec720p).toFixed(3)}/s @ 720p
                      </p>
                    </button>
                  ))}
                </div>
              </Card>

              {/* Render options */}
              <Card className="p-5 glass space-y-4">
                <div className="flex items-center gap-2">
                  <Film className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-sm">Render options</h3>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField label="Resolution">
                    <Select value={resolution} onValueChange={(v) => setResolution(v as "720p" | "1080p" | "4K")}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="720p">720p (1× credits)</SelectItem>
                        <SelectItem value="1080p">1080p (2× credits)</SelectItem>
                        <SelectItem value="4K">4K (4× credits)</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                  <FormField label="Captions">
                    <div className="flex items-center justify-between pt-2">
                      <Label className="text-sm">Burn-in captions</Label>
                      <Switch checked={burnInCaptions} onCheckedChange={setBurnInCaptions} />
                    </div>
                  </FormField>
                  <FormField label="AI disclosure">
                    <div className="flex items-center justify-between pt-2">
                      <Label className="text-sm">AI-disclosure bumper</Label>
                      <Switch checked={includeBumper} onCheckedChange={setIncludeBumper} />
                    </div>
                  </FormField>
                  <FormField label="Music">
                    <Select defaultValue="ambient-calm">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ambient-calm">Ambient Calm (licensed)</SelectItem>
                        <SelectItem value="upbeat-electronic">Upbeat Electronic (licensed)</SelectItem>
                        <SelectItem value="lofi-chill">Lo-Fi Chill (licensed)</SelectItem>
                        <SelectItem value="tense-news">Tense News (licensed)</SelectItem>
                        <SelectItem value="motivational-epic">Motivational Epic (licensed)</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                </div>
              </Card>

              <div className="flex justify-between pt-2">
                <Button variant="outline" onClick={prev}>
                  <ArrowLeft className="h-4 w-4 me-2 ltr-flip" />
                  Back
                </Button>
                <Button onClick={next}>
                  Review &amp; render
                  <ArrowRight className="h-4 w-4 ms-2 ltr-flip" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 5: Confirm & render */}
          {step === 5 && (
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div>
                  <h2 className="text-lg font-semibold">Confirm &amp; render</h2>
                  <p className="text-sm text-muted-foreground">Review your job before submitting. Credits are reserved now and settled on completion.</p>
                </div>

                <Card className="p-5 glass space-y-4">
                  <h3 className="font-semibold text-sm">Summary</h3>
                  <div className="grid sm:grid-cols-2 gap-3 text-sm">
                    <PreviewRow label="Category" value={CATEGORIES.find((c) => c.id === categoryId)?.label ?? "—"} />
                    <PreviewRow label="Template" value={TEMPLATES.find((t) => t.id === templateId)?.name ?? "—"} />
                    <PreviewRow label="Topic" value={form.getValues("topic") || "—"} />
                    <PreviewRow label="Audience" value={form.getValues("audience") || "—"} />
                    <PreviewRow label="Tone" value={TONES.find((t) => t.id === form.watch("tone"))?.label ?? "—"} />
                    <PreviewRow label="Language" value={language.toUpperCase()} />
                    <PreviewRow label="Aspect" value={aspectRatio} />
                    <PreviewRow label="Duration" value={`${durationSec}s`} />
                    <PreviewRow label="Resolution" value={resolution} />
                    <PreviewRow label="Voice" value={VOICES.find((v) => v.id === selectedVoice)?.name ?? "—"} />
                    <PreviewRow label="Model" value={MODELS.find((m) => m.id === selectedModel)?.name ?? "—"} />
                    <PreviewRow label="Captions" value={burnInCaptions ? "Burn-in" : "Off"} />
                  </div>
                </Card>

                <Card className="p-5 glass space-y-4">
                  <h3 className="font-semibold text-sm">Pipeline state machine</h3>
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                    {["DRAFT", "QUEUED", "SCRIPTING", "ASSET_PLANNING", "ASSET_GENERATION", "VOICEOVER", "CAPTION_SYNC", "ASSEMBLING", "RENDERING", "QC", "COMPLETED"].map((s, i, arr) => (
                      <div key={s} className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded bg-surface/60 border border-border/60 font-mono">{s}</span>
                        {i < arr.length - 1 && <ChevronRight className="h-3 w-3 text-muted-foreground/40 ltr-flip" />}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Each step runs in its own BullMQ queue. On failure: exponential backoff retry,
                    then dead-letter queue. On success: idempotent S3 upload + credit ledger
                    settlement. Progress updates flow to the frontend over SSE.
                  </p>
                </Card>
              </div>

              {/* Sidebar: cost & submit */}
              <div className="space-y-4">
                <Card className="p-5 glass space-y-3 sticky top-20">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-sm">Cost estimate</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Base (720p × {durationSec}s)</span>
                      <span className="font-mono tabular-nums">{durationSec}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Resolution ×{resolutionMult} ({resolution})</span>
                      <span className="font-mono tabular-nums">×{resolutionMult}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Model ×{modelMult} ({MODELS.find((m) => m.id === selectedModel)?.name})</span>
                      <span className="font-mono tabular-nums">×{modelMult}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-baseline">
                      <span className="font-semibold">Total</span>
                      <span className="text-2xl font-bold tabular-nums">{estimatedCredits}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">credits</p>
                  </div>

                  <Separator />

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Current balance</span>
                      <span className="font-mono">{credits}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">After reservation</span>
                      <span className="font-mono">{credits - estimatedCredits}</span>
                    </div>
                  </div>

                  {!canAfford && (
                    <div className="rounded-lg border border-danger/40 bg-danger/10 p-3 text-xs flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-danger shrink-0 mt-0.5" />
                      <p className="text-danger">Not enough credits. You need {estimatedCredits - credits} more.</p>
                    </div>
                  )}

                  <Button
                    className="w-full glow-primary"
                    onClick={submitRender}
                    disabled={!canAfford}
                  >
                    <Film className="h-4 w-4 me-2" />
                    Submit render job
                  </Button>
                  <p className="text-[10px] text-muted-foreground text-center">
                    Returns 202 Accepted · worker handles the rest
                  </p>
                </Card>

                <Card className="p-4 glass text-xs text-muted-foreground">
                  <p className="font-semibold text-foreground mb-1.5">What happens next?</p>
                  <ol className="space-y-1 list-decimal list-inside text-muted-foreground">
                    <li>API creates a RenderJob with idempotencyKey</li>
                    <li>Reserves {estimatedCredits} credits via ledger</li>
                    <li>Enqueues script → asset → voice → render → QC</li>
                    <li>Frontend subscribes via SSE for live progress</li>
                    <li>Final cost settled on completion; refunds on failure</li>
                  </ol>
                </Card>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ===========================================================
   Helpers
   =========================================================== */
function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
      {error && (
        <p className="text-xs text-danger flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium truncate">{value}</p>
    </div>
  );
}
