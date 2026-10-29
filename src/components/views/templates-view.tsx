"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Play,
  Check,
  Star,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TEMPLATES, CATEGORIES, type View } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface TemplatesViewProps {
  setView: (v: View) => void;
}

export function TemplatesView({ setView }: TemplatesViewProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [sort, setSort] = useState<"popular" | "newest">("popular");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = TEMPLATES
    .filter((t) => category === "all" || t.category === category)
    .filter((t) => query === "" || t.name.toLowerCase().includes(query.toLowerCase()) || t.description.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => sort === "popular" ? b.uses - a.uses : 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 lg:py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Template gallery</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {TEMPLATES.length} viral-ready templates. Each one ships with a proven hook pattern.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="ps-10"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="sm:w-48">
            <Filter className="h-4 w-4 me-2 text-muted-foreground" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => setSort(v as "popular" | "newest")}>
          <SelectTrigger className="sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popular">Most popular</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((tpl, i) => {
          const cat = CATEGORIES.find((c) => c.id === tpl.category);
          const isSelected = selectedId === tpl.id;
          return (
            <motion.div
              key={tpl.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (i % 4) * 0.04 }}
              className="group"
            >
              <Card
                className={cn(
                  "overflow-hidden glass transition-all cursor-pointer",
                  isSelected ? "ring-2 ring-primary" : "hover:glow-primary",
                )}
                onClick={() => setSelectedId(tpl.id)}
              >
                <div className={cn("aspect-video relative bg-gradient-to-br", tpl.gradient)}>
                  <div className="absolute inset-0 grid-pattern opacity-30" />
                  <div className="absolute inset-0 noise" />
                  <div className="absolute inset-0 grid place-items-center">
                    <div className="h-12 w-12 rounded-full bg-background/70 backdrop-blur grid place-items-center group-hover:scale-110 transition-transform">
                      <Play className="h-5 w-5 text-primary ms-0.5" fill="currentColor" />
                    </div>
                  </div>
                  <div className="absolute top-2 start-2">
                    <Badge className="text-[10px] bg-black/40 text-white border-white/20 backdrop-blur">
                      {cat?.emoji} {cat?.label}
                    </Badge>
                  </div>
                  <div className="absolute top-2 end-2">
                    <Badge variant="outline" className="text-[10px] bg-background/60 backdrop-blur">
                      <TrendingUp className="h-3 w-3 me-1 text-primary" />
                      {tpl.uses.toLocaleString()}
                    </Badge>
                  </div>
                  {isSelected && (
                    <div className="absolute bottom-2 end-2 h-6 w-6 rounded-full bg-primary grid place-items-center">
                      <Check className="h-3.5 w-3.5 text-primary-foreground" />
                    </div>
                  )}
                </div>
                <div className="p-3.5 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-sm">{tpl.name}</p>
                    {tpl.uses > 5000 && (
                      <Star className="h-3.5 w-3.5 text-warning shrink-0" fill="currentColor" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{tpl.description}</p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <Badge variant="outline" className="text-[10px]">{tpl.scenes} scenes</Badge>
                    <Badge variant="outline" className="text-[10px]">{tpl.duration}s</Badge>
                    <Badge variant="outline" className="text-[10px]">{tpl.hook}</Badge>
                  </div>
                  <Button
                    size="sm"
                    variant={isSelected ? "default" : "outline"}
                    className="w-full mt-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      toast.success("Template applied", { description: `Starting wizard with "${tpl.name}"` });
                      setTimeout(() => setView("create"), 600);
                    }}
                  >
                    Use template
                  </Button>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-muted-foreground">No templates match your filters.</p>
          <Button
            variant="link"
            onClick={() => { setQuery(""); setCategory("all"); }}
          >
            Reset filters
          </Button>
        </div>
      )}
    </div>
  );
}
