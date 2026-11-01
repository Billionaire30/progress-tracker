"use client";

import { useState, useCallback, Suspense, lazy } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { OverallProgress } from "@/components/OverallProgress";
import { MonthGrid } from "@/components/MonthGrid";
import { WeeklyHoursChart } from "@/components/WeeklyHoursChart";
import { CompetencyPanel } from "@/components/CompetencyPanel";
import { PortfolioPanel } from "@/components/PortfolioPanel";
import { StreakTracker } from "@/components/StreakTracker";
import { ProductivityInsights } from "@/components/ProductivityInsights";
import { LogHoursModal } from "@/components/LogHoursModal";
import { SettingsMenuContent } from "@/components/SettingsMenu";
import { NotificationCenterContent } from "@/components/NotificationCenter";
import { VoiceAssistantContent } from "@/components/VoiceAssistant";
import { KeyboardShortcuts } from "@/components/KeyboardShortcuts";
import { AuthModal } from "@/components/AuthModal";
import SoftAurora from "@/components/SoftAurora";
import ClickSpark from "@/components/ClickSpark";
import { useKeyboardShortcuts } from "@/lib/hooks/use-keyboard-shortcuts";
import { useReminder } from "@/lib/hooks/use-reminder";

export default function Home() {
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useReminder();

  const openLogModal = useCallback(() => setIsLogModalOpen(true), []);

  useKeyboardShortcuts([
    {
      key: "l",
      ctrlKey: true,
      action: openLogModal,
      description: "Open log hours modal",
    },
  ]);

  return (
    <ClickSpark sparkColor={['#8b5cf6', '#ec4899', '#3b82f6']} sparkSize={8} sparkCount={4} duration={300}>
      <div className="min-h-screen relative overflow-hidden">
        <div className="fixed inset-0 -z-10 opacity-15 dark:opacity-20">
          <SoftAurora
            color1="#8b5cf6"
            color2="#ec4899"
            speed={0.2}
            scale={0.8}
            brightness={0.5}
            enableMouseInteraction={false}
            opacity={0.3}
          />
        </div>
        <Header
          onSettingsClick={() => setIsSettingsOpen(true)}
          onNotificationsClick={() => setIsNotificationsOpen(true)}
          onVoiceAssistantClick={() => setIsVoiceAssistantOpen(true)}
          onShortcutsClick={() => setShowShortcuts(true)}
          onAuthClick={() => setShowAuthModal(true)}
        />

        <main id="main-content" className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 relative" role="main">
          <Hero />
          <OverallProgress />
          <MonthGrid />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <WeeklyHoursChart onLogHoursClick={openLogModal} />
            <div className="space-y-4 sm:space-y-6">
              <CompetencyPanel />
              <StreakTracker />
            </div>
          </div>

          <ProductivityInsights />

          <PortfolioPanel />
        </main>

        <LogHoursModal open={isLogModalOpen} onOpenChange={setIsLogModalOpen} />
        <SettingsMenuContent open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
        <NotificationCenterContent open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen} />
        <VoiceAssistantContent open={isVoiceAssistantOpen} onOpenChange={setIsVoiceAssistantOpen} />
        <KeyboardShortcuts open={showShortcuts} onOpenChange={setShowShortcuts} />
        <AuthModal open={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </div>
    </ClickSpark>
  );
}
