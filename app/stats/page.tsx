"use client";

import { useState, useCallback } from "react";
import { StatsDashboard } from "@/components/StatsDashboard";
import { StreakTracker } from "@/components/StreakTracker";
import { AchievementsPanel } from "@/components/AchievementsPanel";
import { CalendarHeatMap } from "@/components/CalendarHeatMap";
import { AdvancedAnalytics } from "@/components/AdvancedAnalytics";
import { GamificationPanel } from "@/components/GamificationPanel";
import { WorkspaceManager } from "@/components/WorkspaceManager";
import { IntegrationsManager } from "@/components/IntegrationsManager";
import { RewardsStore } from "@/components/RewardsStore";
import { SmartScheduler } from "@/components/SmartScheduler";
import { AdvancedTheming } from "@/components/AdvancedTheming";
import { PortfolioGenerator } from "@/components/PortfolioGenerator";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ErrorBoundary as HeaderErrorBoundary } from "@/components/ErrorBoundary";
import { Header } from "@/components/Header";
import { AuthRequired } from "@/components/AuthRequired";
import { LoadingState } from "@/components/LoadingSpinner";
import { SettingsMenuContent } from "@/components/SettingsMenu";
import { NotificationCenterContent } from "@/components/NotificationCenter";
import { VoiceAssistantContent } from "@/components/VoiceAssistant";
import { KeyboardShortcuts } from "@/components/KeyboardShortcuts";
import { AuthModal } from "@/components/AuthModal";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/context";
import { useKeyboardShortcuts } from "@/lib/hooks/use-keyboard-shortcuts";

export default function StatsPage() {
  const { isLoading } = useApp();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useKeyboardShortcuts([
    {
      key: "/",
      ctrlKey: true,
      action: () => setShowShortcuts(true),
      description: "Show keyboard shortcuts",
    },
  ]);

  if (isLoading) {
    return (
      <AuthRequired>
        <LoadingState message="Loading statistics..." />
      </AuthRequired>
    );
  }

  return (
    <AuthRequired>
      <div className="relative overflow-hidden">
        <HeaderErrorBoundary>
          <Header />
        </HeaderErrorBoundary>

      <main id="main-content" className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-6 sm:space-y-8" role="main">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <StreakTracker />
            <CalendarHeatMap />
          </div>

          <StatsDashboard />

          <AdvancedAnalytics />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <GamificationPanel />
            <WorkspaceManager />
          </div>

          <ErrorBoundary>
            <RewardsStore />
          </ErrorBoundary>

          <ErrorBoundary>
            <SmartScheduler />
          </ErrorBoundary>

          <ErrorBoundary>
            <AdvancedTheming />
          </ErrorBoundary>

          <ErrorBoundary>
            <PortfolioGenerator />
          </ErrorBoundary>

          <IntegrationsManager />

          <AchievementsPanel />
      </main>

      <SettingsMenuContent open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
      <NotificationCenterContent open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen} />
      <VoiceAssistantContent open={isVoiceAssistantOpen} onOpenChange={setIsVoiceAssistantOpen} />
      <KeyboardShortcuts open={showShortcuts} onOpenChange={setShowShortcuts} />
      <AuthModal open={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
    </AuthRequired>
  );
}
