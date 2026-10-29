"use client";

import { useState, useEffect } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppShell } from "@/components/app-shell";
import { LandingView } from "@/components/views/landing-view";
import { DashboardView } from "@/components/views/dashboard-view";
import { CreateWizard } from "@/components/views/create-wizard";
import { ProjectDetail } from "@/components/views/project-detail";
import { TemplatesView } from "@/components/views/templates-view";
import { BrandKitView } from "@/components/views/brandkit-view";
import { BillingView } from "@/components/views/billing-view";
import { SettingsView } from "@/components/views/settings-view";
import { AdminView } from "@/components/views/admin-view";
import type { View } from "@/lib/mock-data";

export default function Page() {
  const [view, setView] = useState<View>("landing");
  const [openProjectId, setOpenProjectId] = useState<string | null>(null);
  const [language, setLanguage] = useState<"en" | "fa">("en");
  const [credits, setCredits] = useState(790);
  const plan = "Pro";

  // Simulated live progress for the active render job (job_01HW at 64%).
  // In production, this comes from SSE / WebSocket via the render queue.
  useEffect(() => {
    if (view !== "dashboard" && view !== "project") return;
    const id = setInterval(() => {
      setCredits((c) => (c > 760 && Math.random() > 0.6 ? c - 0 : c));
    }, 5000);
    return () => clearInterval(id);
  }, [view]);

  const user = { name: "Sina Karimi", email: "sina@viralforge.ai", avatar: "SK" };
  const orgName = "ViralForge Studio";

  return (
    <TooltipProvider delayDuration={150}>
      <AppShell
        view={view}
        setView={setView}
        openProjectId={openProjectId}
        setOpenProjectId={setOpenProjectId}
        credits={credits}
        plan={plan}
        user={user}
        orgName={orgName}
        language={language}
        setLanguage={setLanguage}
      >
        {view === "landing" && <LandingView setView={setView} />}
        {view === "dashboard" && (
          <DashboardView
            setView={setView}
            setOpenProjectId={setOpenProjectId}
            credits={credits}
            plan={plan}
            orgName={orgName}
          />
        )}
        {view === "create" && (
          <CreateWizard
            setView={setView}
            setOpenProjectId={setOpenProjectId}
            credits={credits}
            plan={plan}
          />
        )}
        {view === "project" && (
          <ProjectDetail setView={setView} openProjectId={openProjectId} />
        )}
        {view === "templates" && <TemplatesView setView={setView} />}
        {view === "brandkit" && <BrandKitView />}
        {view === "billing" && (
          <BillingView credits={credits} plan={plan} setView={setView} />
        )}
        {view === "settings" && <SettingsView />}
        {view === "admin" && <AdminView />}
      </AppShell>
    </TooltipProvider>
  );
}
