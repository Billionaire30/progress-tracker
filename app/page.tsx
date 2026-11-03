"use client";

import { useState, useCallback, Suspense } from "react";
import dynamic from "next/dynamic";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { OverallProgress } from "@/components/OverallProgress";
import { MonthGrid } from "@/components/MonthGrid";
import { WeeklyHoursChart } from "@/components/WeeklyHoursChart";
import { CompetencyPanel } from "@/components/CompetencyPanel";
import { StreakTracker } from "@/components/StreakTracker";
import { HabitTracker } from "@/components/HabitTracker";
import { LogHoursModal } from "@/components/LogHoursModal";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ErrorBoundary as HeaderErrorBoundary } from "@/components/ErrorBoundary";
import { PageTransition } from "@/components/PageTransition";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { FocusTimer } from "@/components/FocusTimer";
import { useKeyboardShortcuts } from "@/lib/hooks/use-keyboard-shortcuts";
import { useReminder } from "@/lib/hooks/use-reminder";

// Dynamic imports for below-the-fold components
const PortfolioPanel = dynamic(() => import("@/components/PortfolioPanel").then(mod => ({ default: mod.PortfolioPanel })), {
  loading: () => <div className="h-64 animate-pulse bg-muted rounded-lg" />,
  ssr: false,
});

const Certificates = dynamic(() => import("@/components/Certificates").then(mod => ({ default: mod.Certificates })), {
  loading: () => <div className="h-64 animate-pulse bg-muted rounded-lg" />,
  ssr: false,
});

const ProductivityInsights = dynamic(() => import("@/components/ProductivityInsights").then(mod => ({ default: mod.ProductivityInsights })), {
  loading: () => <div className="h-64 animate-pulse bg-muted rounded-lg" />,
  ssr: false,
});

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

        <main id="main-content" className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl relative pb-20 md:pb-8" role="main">
          <PageTransition>
            <Hero />

            <div id="dashboard" className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-8">
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

            <div id="study" className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
              <WeeklyHoursChart onLogHoursClick={openLogModal} />
              <CompetencyPanel />
            </div>

            <div id="habits" className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
              <ErrorBoundary>
                <HabitTracker />
              </ErrorBoundary>
              <FocusTimer />
            </div>

            <div id="portfolio" className="mb-8">
              <Suspense fallback={<div className="h-64 animate-pulse bg-muted rounded-lg" />}>
                <PortfolioPanel />
              </Suspense>
            </div>

            <div id="settings" className="mb-8">
              <Suspense fallback={<div className="h-64 animate-pulse bg-muted rounded-lg" />}>
                <Certificates />
              </Suspense>
            </div>
          </PageTransition>
        </main>

        <MobileBottomNav />
        <LogHoursModal open={isLogModalOpen} onOpenChange={setIsLogModalOpen} />
    </div>
  );
}
