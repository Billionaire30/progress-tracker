"use client";

import { StatsDashboard } from "@/components/StatsDashboard";
import { StreakTracker } from "@/components/StreakTracker";
import { AchievementsPanel } from "@/components/AchievementsPanel";
import { CalendarHeatMap } from "@/components/CalendarHeatMap";
import { AdvancedAnalytics } from "@/components/AdvancedAnalytics";
import { GamificationPanel } from "@/components/GamificationPanel";
import { WorkspaceManager } from "@/components/WorkspaceManager";
import { IntegrationsManager } from "@/components/IntegrationsManager";
import { Header } from "@/components/Header";
import { AuthRequired } from "@/components/AuthRequired";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/context";

export default function StatsPage() {
  const { isLoading } = useApp();

  if (isLoading) {
    return (
      <AuthRequired>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading statistics...</p>
          </div>
        </div>
      </AuthRequired>
    );
  }

  return (
    <AuthRequired>
      <div className="min-h-screen bg-background">
        <Header />

      <main id="main-content" className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6" role="main">
        <div className="flex items-center gap-2 sm:gap-4">
          <a href="/">
            <Button variant="ghost" size="sm" aria-label="Back to Dashboard" className="text-xs sm:text-sm">
              <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Back</span>
              <span className="sm:hidden">←</span>
            </Button>
          </a>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif">Statistics</h1>
        </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <StreakTracker />
            <CalendarHeatMap />
          </div>

          <StatsDashboard />

          <AdvancedAnalytics />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <GamificationPanel />
            <WorkspaceManager />
          </div>

          <IntegrationsManager />

          <AchievementsPanel />
      </main>
    </div>
    </AuthRequired>
  );
}
