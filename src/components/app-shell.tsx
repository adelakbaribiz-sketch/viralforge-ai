"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Plus,
  Film,
  LayoutTemplate,
  Palette,
  CreditCard,
  Settings,
  Shield,
  Sparkles,
  Search,
  Bell,
  Menu,
  X,
  ChevronDown,
  Globe,
  Sun,
  Moon,
  Command,
  Zap,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Command as CommandComponent,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { View } from "@/lib/mock-data";

interface AppShellProps {
  view: View;
  setView: (v: View) => void;
  openProjectId: string | null;
  setOpenProjectId: (id: string | null) => void;
  credits: number;
  plan: string;
  user: { name: string; email: string; avatar: string };
  orgName: string;
  language: "en" | "fa";
  setLanguage: (l: "en" | "fa") => void;
  children: React.ReactNode;
}

const NAV_ITEMS: { id: View; label: string; labelFa: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Dashboard", labelFa: "داشبورد", icon: LayoutDashboard },
  { id: "create", label: "Create Video", labelFa: "ساخت ویدیو", icon: Plus },
  { id: "project", label: "Projects", labelFa: "پروژه‌ها", icon: Film },
  { id: "templates", label: "Templates", labelFa: "قالب‌ها", icon: LayoutTemplate },
  { id: "brandkit", label: "Brand Kit", labelFa: "کیت برند", icon: Palette },
  { id: "billing", label: "Billing", labelFa: "صورتحساب", icon: CreditCard },
  { id: "settings", label: "Settings", labelFa: "تنظیمات", icon: Settings },
  { id: "admin", label: "Admin", labelFa: "مدیریت", icon: Shield },
];

export function AppShell({
  view,
  setView,
  openProjectId,
  setOpenProjectId,
  credits,
  plan,
  user,
  orgName,
  language,
  setLanguage,
  children,
}: AppShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const dir = language === "fa" ? "rtl" : "ltr";

  // Command palette shortcut: Cmd/Ctrl + K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Cmd/Ctrl + / to land on create
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault();
        setView("create");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setView]);

  const t = useMemo(
    () => ({
      newVideo: language === "fa" ? "ویدیو جدید" : "New Video",
      search: language === "fa" ? "جستجو یا اجرای دستور..." : "Search or run a command...",
      credits: language === "fa" ? "اعتبار" : "credits",
      plan: language === "fa" ? "طرح" : "Plan",
      theme: language === "fa" ? "پوسته" : "Theme",
      dark: language === "fa" ? "تیره" : "Dark",
      light: language === "fa" ? "روشن" : "Light",
      signOut: language === "fa" ? "خروج" : "Sign out",
      profile: language === "fa" ? "پروفایل" : "Profile",
      commandPalette: language === "fa" ? "پنل فرمان" : "Command palette",
      optimized: language === "fa" ? "بهینه برای قلاب، بازداشت و زیرنویس" : "Optimized for Hook, Retention & Caption",
    }),
    [language],
  );

  return (
    <div
      dir={dir}
      className="min-h-screen flex flex-col bg-background text-foreground"
    >
      {/* Top bar */}
      <header className="sticky top-0 z-40 h-16 px-4 lg:px-6 glass-strong border-b border-border/60 flex items-center gap-3">
        {/* Mobile menu */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setMobileNavOpen(true)}
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Logo */}
        <button
          onClick={() => setView("dashboard")}
          className="flex items-center gap-2.5 group"
        >
          <div className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-primary via-accent to-primary grid place-items-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-accent/40 blur-md" />
            <Zap className="relative h-5 w-5 text-primary-foreground" fill="currentColor" />
          </div>
          <div className="hidden sm:flex flex-col leading-none text-start">
            <span className="text-[15px] font-bold tracking-tight">
              ViralForge <span className="gradient-text">AI</span>
            </span>
            <span className="text-[10px] text-muted-foreground">{orgName}</span>
          </div>
        </button>

        {/* Center search-like prompt (opens palette) */}
        <button
          onClick={() => setPaletteOpen(true)}
          className="hidden md:flex items-center gap-2 ms-4 me-auto h-9 px-3 rounded-lg border border-border/70 bg-surface/40 hover:bg-surface/70 transition-colors text-sm text-muted-foreground min-w-[260px]"
        >
          <Search className="h-4 w-4" />
          <span>{t.search}</span>
          <kbd className="ms-auto inline-flex h-5 items-center gap-0.5 rounded border border-border/70 bg-card/60 px-1.5 text-[10px] font-mono">
            <Command className="h-3 w-3" />K
          </kbd>
        </button>

        {/* Right cluster */}
        <div className="flex items-center gap-2 ms-auto">
          {/* Language toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:flex gap-2"
                onClick={() => setLanguage(language === "en" ? "fa" : "en")}
              >
                <Globe className="h-4 w-4" />
                <span className="text-xs font-medium uppercase">{language}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle EN / فارسی (RTL)</TooltipContent>
          </Tooltip>

          {/* Credits meter — mini */}
          <button
            onClick={() => setView("billing")}
            className="hidden sm:flex items-center gap-2 h-9 px-3 rounded-lg border border-primary/30 bg-primary/10 hover:bg-primary/15 transition-colors"
          >
            <Zap className="h-4 w-4 text-primary" fill="currentColor" />
            <span className="text-sm font-semibold tabular-nums">{credits}</span>
            <span className="text-xs text-muted-foreground">{t.credits}</span>
          </button>

          {/* Notifications */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 end-1.5 h-2 w-2 rounded-full bg-accent" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>3 new render jobs completed</TooltipContent>
          </Tooltip>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 h-9 ps-1 pe-2 rounded-lg hover:bg-surface/60 transition-colors">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-xs font-semibold">
                    {user.avatar}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              <div className="px-2 py-2">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs text-muted-foreground">{t.plan}</DropdownMenuLabel>
              <div className="px-2 pb-1">
                <Badge className="bg-gradient-to-r from-primary/20 to-accent/20 text-foreground border-primary/30">
                  {plan}
                </Badge>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setView("settings")}>
                <Settings className="h-4 w-4 me-2" /> {t.profile}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setView("billing")}>
                <CreditCard className="h-4 w-4 me-2" /> {t.billing || "Billing"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <X className="h-4 w-4 me-2" /> {t.signOut}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Body: sidebar + content */}
      <div className="flex-1 flex">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex w-60 shrink-0 flex-col border-e border-border/60 bg-sidebar/60 backdrop-blur-sm">
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = view === item.id || (item.id === "project" && openProjectId !== null && view === "project");
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === "project" && !openProjectId) setOpenProjectId("prj_3b71");
                    setView(item.id);
                  }}
                  className={cn(
                    "group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                    active
                      ? "bg-primary/15 text-primary border border-primary/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-surface/60 border border-transparent",
                  )}
                >
                  <Icon className={cn("h-4.5 w-4.5 shrink-0", active && "text-primary")} />
                  <span className="flex-1 text-start">{language === "fa" ? item.labelFa : item.label}</span>
                  {active && <ChevronRight className="h-4 w-4 ltr-flip" />}
                </button>
              );
            })}
          </nav>

          <div className="p-3 border-t border-border/60">
            <div className="rounded-xl glass p-3.5 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold">{t.optimized}</span>
              </div>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                {language === "fa"
                  ? "ما هرگز بازدید تضمینی نمی‌کنیم. کیفیت، منحصر به فرد بودن و رعایت کپی‌رایت دست خود شماست."
                  : "We never promise guaranteed views. Quality, uniqueness, and copyright compliance are on you."}
              </p>
              <Button
                size="sm"
                className="w-full h-8 text-xs"
                onClick={() => setView("create")}
              >
                <Plus className="h-3.5 w-3.5 me-1.5" /> {t.newVideo}
              </Button>
            </div>
          </div>
        </aside>

        {/* Mobile nav drawer */}
        <AnimatePresence>
          {mobileNavOpen && (
            <>
              <motion.div
                className="fixed inset-0 z-40 bg-black/60 lg:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileNavOpen(false)}
              />
              <motion.aside
                className="fixed inset-y-0 start-0 z-50 w-72 bg-sidebar border-e border-border lg:hidden flex flex-col"
                initial={{ x: dir === "rtl" ? "100%" : "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: dir === "rtl" ? "100%" : "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 250 }}
              >
                <div className="h-16 flex items-center justify-between px-4 border-b border-border/60">
                  <span className="text-sm font-semibold">Navigation</span>
                  <Button variant="ghost" size="icon" onClick={() => setMobileNavOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                  {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const active = view === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setView(item.id);
                          setMobileNavOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium",
                          active
                            ? "bg-primary/15 text-primary"
                            : "text-muted-foreground hover:text-foreground hover:bg-surface/60",
                        )}
                      >
                        <Icon className="h-5 w-5 shrink-0" />
                        <span>{language === "fa" ? item.labelFa : item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main content */}
        <main className="flex-1 min-w-0 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={view + (openProjectId ?? "")}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="min-h-[calc(100vh-4rem)]"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Command palette */}
      <CommandPalette
        open={paletteOpen}
        setOpen={setPaletteOpen}
        setView={setView}
        setMobileNavOpen={setMobileNavOpen}
      />
    </div>
  );
}

/* ===========================================================
   Command Palette — quick navigation
   =========================================================== */
function CommandPalette({
  open,
  setOpen,
  setView,
}: {
  open: boolean;
  setOpen: (o: boolean) => void;
  setView: (v: View) => void;
  setMobileNavOpen: (o: boolean) => void;
}) {
  const items: { view: View; label: string; hint: string; icon: typeof LayoutDashboard }[] = [
    { view: "dashboard", label: "Go to Dashboard", hint: "Overview & recent jobs", icon: LayoutDashboard },
    { view: "create", label: "Create new video", hint: "Start the 5-step wizard", icon: Plus },
    { view: "project", label: "Open most recent project", hint: "Scene editor & preview", icon: Film },
    { view: "templates", label: "Browse templates", hint: "20+ viral templates", icon: LayoutTemplate },
    { view: "brandkit", label: "Edit brand kit", hint: "Logo, colors, fonts, intro/outro", icon: Palette },
    { view: "billing", label: "View billing & credits", hint: "Plan, ledger, invoices", icon: CreditCard },
    { view: "settings", label: "Open settings", hint: "Team, API, webhooks, security", icon: Settings },
    { view: "admin", label: "Admin panel", hint: "Orgs, providers, moderation", icon: Shield },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0 overflow-hidden max-w-xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Command palette</DialogTitle>
        </DialogHeader>
        <CommandComponent className="rounded-lg">
          <CommandInput placeholder="Type a command or search..." />
          <CommandList className="max-h-[400px]">
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Navigation">
              {items.map((item) => {
                const Icon = item.icon;
                return (
                  <CommandItem
                    key={item.view}
                    onSelect={() => {
                      setView(item.view);
                      setOpen(false);
                    }}
                    className="py-2.5"
                  >
                    <Icon className="h-4 w-4 me-2 text-muted-foreground" />
                    <span className="flex-1">{item.label}</span>
                    <span className="text-xs text-muted-foreground">{item.hint}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            <CommandGroup heading="Actions">
              <CommandItem
                onSelect={() => {
                  setView("create");
                  setOpen(false);
                }}
                className="py-2.5"
              >
                <Plus className="h-4 w-4 me-2 text-primary" />
                <span className="flex-1">New video (⌘/)</span>
                <kbd className="text-xs text-muted-foreground">⌘ /</kbd>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </CommandComponent>
      </DialogContent>
    </Dialog>
  );
}
