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
import { FadeContent } from "@/components/FadeContent";
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
          <FadeContent effect="fade" duration={0.8} threshold={0.1}>
            <Hero />
          </FadeContent>
          <FadeContent effect="fade" duration={0.8} delay={0.1} threshold={0.1}>
            <OverallProgress />
          </FadeContent>
          <FadeContent effect="fade" duration={0.8} delay={0.2} threshold={0.1}>
            <MonthGrid />
          </FadeContent>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <FadeContent effect="fade" duration={0.8} delay={0.3} threshold={0.1}>
              <WeeklyHoursChart onLogHoursClick={openLogModal} />
            </FadeContent>
            <div className="space-y-4 sm:space-y-6">
              <FadeContent effect="fade" duration={0.8} delay={0.4} threshold={0.1}>
                <CompetencyPanel />
              </FadeContent>
              <FadeContent effect="fade" duration={0.8} delay={0.5} threshold={0.1}>
                <StreakTracker />
              </FadeContent>
            </div>
          </div>

          <FadeContent effect="fade" duration={0.8} delay={0.6} threshold={0.1}>
            <ProductivityInsights />
          </FadeContent>

          <FadeContent effect="fade" duration={0.8} delay={0.7} threshold={0.1}>
            <PortfolioPanel />
          </FadeContent>
        </main>

        <LogHoursModal open={isLogModalOpen} onOpenChange={setIsLogModalOpen} />
      </div>
    </ClickSpark>
  );
}
