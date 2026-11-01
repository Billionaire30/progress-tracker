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
      <Header key="home-page" />

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
  );
}
