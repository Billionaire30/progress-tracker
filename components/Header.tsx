"use client";

import { useCallback, useMemo, useEffect, useRef } from "react";
import { useApp } from "@/lib/context";
import { useAuth } from "@/components/AuthProvider";
import { getCurrentWeekNumber } from "@/lib/week";
import { SettingsButton } from "@/components/SettingsMenu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { BarChart3, LogOut, Keyboard, LogIn, Bell, Mic } from "lucide-react";
import { useToast } from "@/lib/hooks/use-toast";

interface HeaderProps {
  onSettingsClick?: () => void;
  onNotificationsClick?: () => void;
  onVoiceAssistantClick?: () => void;
  onShortcutsClick?: () => void;
  onAuthClick?: () => void;
}

export function Header({
  onSettingsClick = () => {},
  onNotificationsClick = () => {},
  onVoiceAssistantClick = () => {},
  onShortcutsClick = () => {},
  onAuthClick = () => {},
}: HeaderProps) {
  const { data } = useApp();
  const { user, signOutUser } = useAuth();
  const { toast } = useToast();
  const notificationsButtonRef = useRef<HTMLButtonElement>(null);
  const voiceAssistantButtonRef = useRef<HTMLButtonElement>(null);
  const shortcutsButtonRef = useRef<HTMLButtonElement>(null);
  const authButtonRef = useRef<HTMLButtonElement>(null);
  const settingsButtonRef = useRef<HTMLButtonElement>(null);

  // Debug: Log when Header mounts and props received
  useEffect(() => {
    console.log('Header mounted with props:', {
      hasOnSettingsClick: typeof onSettingsClick === 'function',
      hasOnNotificationsClick: typeof onNotificationsClick === 'function',
      hasOnVoiceAssistantClick: typeof onVoiceAssistantClick === 'function',
      hasOnShortcutsClick: typeof onShortcutsClick === 'function',
      hasOnAuthClick: typeof onAuthClick === 'function',
    });
  }, [onSettingsClick, onNotificationsClick, onVoiceAssistantClick, onShortcutsClick, onAuthClick]);

  // Ensure event handlers are properly attached after mount
  useEffect(() => {
    const notificationsBtn = document.querySelector('button[aria-label="Notifications"]');
    if (notificationsBtn) {
      console.log('Notifications button found in DOM');
    } else {
      console.warn('Notifications button not found in DOM');
    }
  }, []);

  // Fallback: Attach direct event listeners as backup for hydration issues
  useEffect(() => {
    const btn = notificationsButtonRef.current;
    if (!btn) return;

    const handleClick = (e: Event) => {
      console.log('Fallback click handler triggered for notifications');
      onNotificationsClick();
    };

    btn.addEventListener('click', handleClick);
    return () => btn.removeEventListener('click', handleClick);
  }, [onNotificationsClick]);

  useEffect(() => {
    const btn = voiceAssistantButtonRef.current;
    if (!btn) return;

    const handleClick = (e: Event) => {
      console.log('Fallback click handler triggered for voice assistant');
      onVoiceAssistantClick();
    };

    btn.addEventListener('click', handleClick);
    return () => btn.removeEventListener('click', handleClick);
  }, [onVoiceAssistantClick]);

  useEffect(() => {
    const btn = shortcutsButtonRef.current;
    if (!btn) return;

    const handleClick = (e: Event) => {
      console.log('Fallback click handler triggered for shortcuts');
      onShortcutsClick();
    };

    btn.addEventListener('click', handleClick);
    return () => btn.removeEventListener('click', handleClick);
  }, [onShortcutsClick]);

  useEffect(() => {
    const btn = authButtonRef.current;
    if (!btn) return;

    const handleClick = (e: Event) => {
      console.log('Fallback click handler triggered for auth');
      onAuthClick();
    };

    btn.addEventListener('click', handleClick);
    return () => btn.removeEventListener('click', handleClick);
  }, [onAuthClick]);

  useEffect(() => {
    const btn = settingsButtonRef.current;
    if (!btn) return;

    const handleClick = (e: Event) => {
      console.log('Fallback click handler triggered for settings');
      onSettingsClick();
    };

    btn.addEventListener('click', handleClick);
    return () => btn.removeEventListener('click', handleClick);
  }, [onSettingsClick]);

  // Wrapper functions with console logging
  const handleNotificationsClick = useCallback(() => {
    console.log('Notifications button clicked');
    onNotificationsClick();
  }, [onNotificationsClick]);

  const handleVoiceAssistantClick = useCallback(() => {
    console.log('Voice assistant button clicked');
    onVoiceAssistantClick();
  }, [onVoiceAssistantClick]);

  const handleShortcutsClick = useCallback(() => {
    console.log('Shortcuts button clicked');
    onShortcutsClick();
  }, [onShortcutsClick]);

  const handleAuthClick = useCallback(() => {
    console.log('Auth button clicked');
    onAuthClick();
  }, [onAuthClick]);

  const handleSettingsClick = useCallback(() => {
    console.log('Settings button clicked');
    onSettingsClick();
  }, [onSettingsClick]);

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

  const notificationsUnreadCount = useMemo(() => {
    const notifs = require("@/lib/notifications").generateNotifications(data);
    const filtered = notifs.filter((n: any) => require("@/lib/notifications").shouldShowNotification(n, data.preferences));
    return filtered.filter((n: any) => !n.read).length;
  }, [data]);

  return (
    <header className="border-b bg-card/80 backdrop-blur-xl sticky top-0 z-[var(--z-sticky)] shadow-premium">
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between gap-2">
        <h1 className="text-lg sm:text-xl font-bold font-serif truncate gradient-text">Progress Tracker</h1>
        <nav className="flex items-center gap-1 sm:gap-3 pointer-events-auto relative z-10" aria-label="Progress overview">
          <div className="text-xs sm:text-sm font-medium bg-gradient-to-r from-primary to-purple-500 text-white px-2 sm:px-3 py-1 rounded-full tabular-nums whitespace-nowrap shadow-glow">
            {headerStats.overallProgress}%
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground tabular-nums hidden md:block whitespace-nowrap">
            Week {headerStats.weekNumber} of 52
          </div>
          <ThemeToggle />
          <button
            ref={notificationsButtonRef}
            type="button"
            onClick={handleNotificationsClick}
            aria-label="Notifications"
            className="relative inline-flex items-center justify-center rounded-md p-2 hover:bg-accent hover:text-accent-foreground transition-colors pointer-events-auto"
            style={{ pointerEvents: 'auto' }}
          >
            <Bell className="h-4 w-4" />
            {notificationsUnreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-destructive text-destructive-foreground rounded-full pointer-events-none">
                {notificationsUnreadCount}
              </span>
            )}
          </button>
          <button
            ref={voiceAssistantButtonRef}
            type="button"
            onClick={handleVoiceAssistantClick}
            aria-label="Voice Assistant"
            title="Voice Assistant"
            className="inline-flex items-center justify-center rounded-md p-2 hover:bg-accent hover:text-accent-foreground transition-colors pointer-events-auto"
            style={{ pointerEvents: 'auto' }}
          >
            <Mic className="h-4 w-4" />
          </button>
          <Button
            ref={shortcutsButtonRef}
            variant="ghost"
            size="icon"
            onClick={handleShortcutsClick}
            aria-label="Show keyboard shortcuts"
            className="hidden sm:flex pointer-events-auto"
            title="Keyboard shortcuts (Ctrl+/)"
            style={{ pointerEvents: 'auto' }}
          >
            <Keyboard className="h-4 w-4" />
          </Button>
          <a href="/stats" className="inline-flex pointer-events-auto" style={{ pointerEvents: 'auto' }}>
            <Button
              variant="ghost"
              size="icon"
              aria-label="View statistics"
              style={{ pointerEvents: 'auto' }}
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
          </a>
   {user ? (
            <Button
              ref={authButtonRef}
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              aria-label="Sign out"
              title="Sign out"
              className="pointer-events-auto"
              style={{ pointerEvents: 'auto' }}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              ref={authButtonRef}
              variant="ghost"
              size="icon"
              onClick={handleAuthClick}
              aria-label="Sign in"
              title="Sign in to sync data"
              className="pointer-events-auto"
              style={{ pointerEvents: 'auto' }}
            >
              <LogIn className="h-4 w-4" />
            </Button>
          )}
          <SettingsButton ref={settingsButtonRef} onClick={handleSettingsClick} />
        </nav>
      </div>
    </header>
  );
}
