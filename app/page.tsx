"use client";

import { useState, useCallback } from "react";
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
import { SoftAurora } from "@/components/SoftAurora";
import { ClickSpark } from "@/components/ClickSpark";
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
    <ClickSpark sparkColor={['#8b5cf6', '#ec4899', '#3b82f6']} sparkSize={12} sparkCount={6} duration={400}>
      <div className="min-h-screen relative overflow-hidden">
        <div className="fixed inset-0 -z-10 opacity-30 dark:opacity-50">
          <SoftAurora
            color1="#8b5cf6"
            color2="#ec4899"
            speed={0.5}
            scale={1.2}
            brightness={0.8}
            enableMouseInteraction={true}
            opacity={0.6}
          />
        </div>
        <Header />

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
      </div>
    </ClickSpark>
  );
}
