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
import { Certificates } from "@/components/Certificates";
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
    <div className="relative overflow-hidden">
      <HeaderErrorBoundary>
        <Header />
      </HeaderErrorBoundary>

        <main id="main-content" className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl relative" role="main">
          <PageTransition>
            <Hero />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-8">
              <div className="lg:col-span-2">
                <OverallProgress />
              </div>
              <div className="lg:col-span-1">
                <StreakTracker />
              </div>
            </div>

            <div className="mb-8">
              <MonthGrid />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
              <WeeklyHoursChart onLogHoursClick={openLogModal} />
              <CompetencyPanel />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
              <ProductivityInsights />
              <ErrorBoundary>
                <HabitTracker />
              </ErrorBoundary>
            </div>

            <PortfolioPanel />

            <div className="mb-8">
              <Certificates />
            </div>
          </PageTransition>
        </main>

        <LogHoursModal open={isLogModalOpen} onOpenChange={setIsLogModalOpen} />
    </div>
  );
}
