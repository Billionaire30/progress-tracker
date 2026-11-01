"use client";

import { useState, useCallback, useMemo } from "react";
import { useApp } from "@/lib/context";
import { useAuth } from "@/components/AuthProvider";
import { getCurrentWeekNumber } from "@/lib/week";
import { SettingsButton } from "@/components/SettingsMenu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { KeyboardShortcuts } from "@/components/KeyboardShortcuts";
import { NotificationCenter } from "@/components/NotificationCenter";
import { VoiceAssistant } from "@/components/VoiceAssistant";
import { Button } from "@/components/ui/button";
import { BarChart3, LogOut, Keyboard, LogIn } from "lucide-react";
import { AuthModal } from "@/components/AuthModal";
import { useToast } from "@/lib/hooks/use-toast";

export function Header() {
  const { data } = useApp();
  const { user, signOutUser } = useAuth();
  const { toast } = useToast();
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleAuthModalClose = () => {
    setShowAuthModal(false);
  };

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

  const handleSignOut = useCallback(async () => {
    try {
      await signOutUser();
      toast({
        title: "Signed out",
        description: "You have been signed out successfully",
      });
    } catch (error) {
      console.error("Sign out error:", error);
      toast({
        title: "Sign out failed",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  }, [signOutUser, toast]);

  return (
    <header className="border-b bg-card/80 backdrop-blur-xl sticky top-0 z-50 shadow-premium">
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between gap-2">
        <h1 className="text-lg sm:text-xl font-bold font-serif truncate gradient-text">Progress Tracker</h1>
        <nav className="flex items-center gap-1 sm:gap-3" aria-label="Progress overview">
          <div className="text-xs sm:text-sm font-medium bg-gradient-to-r from-primary to-purple-500 text-white px-2 sm:px-3 py-1 rounded-full tabular-nums whitespace-nowrap shadow-glow">
            {headerStats.overallProgress}%
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground tabular-nums hidden md:block whitespace-nowrap">
            Week {headerStats.weekNumber} of 52
          </div>
          <ThemeToggle />
          <NotificationCenter />
          <VoiceAssistant />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowShortcuts(true)}
            aria-label="Show keyboard shortcuts"
            className="hidden sm:flex"
            title="Keyboard shortcuts (Ctrl+/)"
          >
            <Keyboard className="h-4 w-4" />
          </Button>
          <a href="/stats" className="inline-flex">
            <Button
              variant="ghost"
              size="icon"
              aria-label="View statistics"
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
          </a>
 {user ? (
            <Button
              variant="ghost"
              size="icon"
              style={{ cursor: 'pointer', zIndex: 100 }}
              onClick={(e) => {
                console.log("Sign out button clicked", e);
                handleSignOut();
              }}
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowAuthModal(true)}
              aria-label="Sign in"
              title="Sign in to sync data"
            >
              <LogIn className="h-4 w-4" />
            </Button>
          )}
          <SettingsButton />
        </nav>
      </div>
      <KeyboardShortcuts open={showShortcuts} onOpenChange={setShowShortcuts} />
      <AuthModal open={showAuthModal} onClose={handleAuthModalClose} />
    </header>
  );
});
