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
import { HabitTracker } from "@/components/HabitTracker";
import { LogHoursModal } from "@/components/LogHoursModal";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ErrorBoundary as HeaderErrorBoundary } from "@/components/ErrorBoundary";
import { PageTransition } from "@/components/PageTransition";
import { SlideshowBackdrop } from "@/components/SlideshowBackdrop";
import SoftAurora from "@/components/SoftAurora";
import ClickSpark from "@/components/ClickSpark";
import { useKeyboardShortcuts } from "@/lib/hooks/use-keyboard-shortcuts";
import { useReminder } from "@/lib/hooks/use-reminder";

export default function Home() {
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

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
    <div className="min-h-screen relative overflow-hidden">
      <ClickSpark sparkColor={['#8b5cf6', '#ec4899', '#3b82f6']} sparkSize={8} sparkCount={4} duration={300} layer="back">
        <div className="pointer-events-none fixed inset-0 z-[-1]">
          <SlideshowBackdrop />
        </div>
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
        <HeaderErrorBoundary>
          <Header />
        </HeaderErrorBoundary>

        <main id="main-content" className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-6 sm:space-y-8 relative" role="main">
          <PageTransition>
            <Hero />
            <OverallProgress />
            <MonthGrid />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              <WeeklyHoursChart onLogHoursClick={openLogModal} />
              <div className="space-y-6 sm:space-y-8">
                <CompetencyPanel />
                <StreakTracker />
              </div>
            </div>

            <ProductivityInsights />

            <ErrorBoundary>
              <HabitTracker />
            </ErrorBoundary>

            <PortfolioPanel />
          </PageTransition>
        </main>

        <LogHoursModal open={isLogModalOpen} onOpenChange={setIsLogModalOpen} />
      </ClickSpark>
    </div>
  );
}
