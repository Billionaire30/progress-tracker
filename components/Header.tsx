"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/lib/context";
import { getCurrentWeekNumber } from "@/lib/week";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SimpleSettings } from "@/components/SimpleSettings";
import { SimpleShortcuts } from "@/components/SimpleShortcuts";
import { SimpleAuth } from "@/components/SimpleAuth";
import { SimpleVoice } from "@/components/SimpleVoice";
import { Button } from "@/components/ui/button";
import { BarChart3, Zap, Sparkles, Menu, X } from "lucide-react";

export function Header() {
  const { data } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Calculate overall progress
  const headerStats = useMemo(() => {
    const monthsComplete = data.months.filter((m) => m.status === "complete").length;
    const portfolioComplete = data.portfolio.filter((p) => p.status === "complete").length;
    const competenciesComplete = data.competencyChecklist.filter((c) => c.done).length;
    const overallProgress = Math.round(
      ((monthsComplete + portfolioComplete + competenciesComplete) / (12 + 5 + 17)) * 100
    );
    const weekNumber = getCurrentWeekNumber(data.startDate);
    return { overallProgress, weekNumber };
  }, [data.months, data.portfolio, data.competencyChecklist, data.startDate]);

  return (
    <header className="border-b bg-card/95 backdrop-blur-xl sticky top-0 z-50 shadow-premium-lg transition-all duration-300">
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Sparkles className="h-5 w-5 text-primary animate-pulse-glow" />
            <div className="absolute inset-0 bg-primary/20 blur-md rounded-full animate-pulse" />
          </div>
          <h1 className="text-lg sm:text-xl font-bold font-serif truncate gradient-text">
            Progress Tracker
          </h1>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-3" aria-label="Progress overview">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-500 rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
            <div className="relative text-xs sm:text-sm font-medium bg-gradient-to-r from-primary to-purple-500 text-white px-2 sm:px-3 py-1 rounded-full tabular-nums whitespace-nowrap shadow-glow flex items-center gap-1 hover:scale-105 transition-transform">
              <Zap className="h-3 w-3" />
              {headerStats.overallProgress}%
            </div>
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground tabular-nums whitespace-nowrap bg-muted/50 px-2 py-1 rounded-full hover:bg-muted transition-colors">
            Week {headerStats.weekNumber} of 52
          </div>
          <div className="w-px h-6 bg-border" />
          <ThemeToggle />
          <SimpleSettings />
          <SimpleShortcuts />
          <SimpleVoice />
          <SimpleAuth />
          <a href="/stats">
            <Button variant="ghost" size="icon" aria-label="View statistics" className="hover:bg-primary/10 hover:scale-110 transition-transform">
              <BarChart3 className="h-4 w-4" />
            </Button>
          </a>
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-card/95 backdrop-blur-xl animate-slide-in">
          <div className="container mx-auto px-3 sm:px-4 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-500 rounded-full blur-md opacity-50" />
                <div className="relative text-sm font-medium bg-gradient-to-r from-primary to-purple-500 text-white px-3 py-1 rounded-full tabular-nums shadow-glow flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  {headerStats.overallProgress}%
                </div>
              </div>
              <div className="text-sm text-muted-foreground tabular-nums bg-muted/50 px-2 py-1 rounded-full">
                Week {headerStats.weekNumber}
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <ThemeToggle />
              <SimpleSettings />
              <SimpleShortcuts />
              <SimpleVoice />
            </div>
            <div className="flex items-center justify-between pt-2 border-t">
              <SimpleAuth />
              <a href="/stats">
                <Button variant="ghost" size="sm" className="hover:bg-primary/10">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Stats
                </Button>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
