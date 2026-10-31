"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from "react";
import { AppData, initialData, Preferences, initializeDefaultWorkspace } from "./data";
import { storage } from "./storage";
import { firebaseStorage, initFirebaseAuth } from "./firebase-storage";
import { checkAchievements } from "./achievements";
import { triggerConfetti } from "./confetti";
import { auth, isConfigured } from "./firebase";
import { awardXPForHours, updateStreakBonus, checkDailyChallenges, addBadge } from "./gamification";
import { debounce, optimizeData } from "./performance";

interface AppContextType {
  data: AppData;
  setData: (data: AppData) => void;
  resetData: () => void;
  exportData: () => void;
  importData: (file: File) => Promise<void>;
  preferences: Preferences;
  updatePreferences: (preferences: Partial<Preferences>) => void;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(initialData);
  const [preferences, setPreferences] = useState<Preferences>({});
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const dataRef = useRef<AppData>(initialData);

  // Keep ref in sync with state
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    setMounted(true);

    // Initialize Firebase auth only if configured
    if (isConfigured) {
      initFirebaseAuth();
    }

    // Load initial data from localStorage immediately
    let loadedData = storage.getData();
    const loadedPreferences = storage.getPreferences();

    // Initialize default workspace if needed
    loadedData = initializeDefaultWorkspace(loadedData);

    console.log("Initial data loaded:", loadedData);
    setData(loadedData);
    setPreferences(loadedPreferences);
    setIsLoading(false);

    // Set up Firebase auth listener for cloud sync only if configured
    let unsubscribe: (() => void) | null = null;
    if (isConfigured) {
      unsubscribe = auth.onAuthStateChanged((user) => {
        if (user) {
          console.log("User authenticated, setting up Firebase sync");
          firebaseStorage.subscribeToData((firebaseData) => {
            console.log("Received Firebase data update");
            setData(firebaseData);
          });
        } else {
          console.log("User not authenticated, using local storage");
          firebaseStorage.unsubscribeFromData();
        }
      });
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      firebaseStorage.unsubscribeFromData();
      firebaseStorage.cleanup();
    };
  }, []);

  const updateData = useCallback((newData: AppData) => {
    const previousData = dataRef.current;

    // Calculate streak (only if weeklyLog changed)
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    const loggedToday = newData.weeklyLog.some((entry) => entry.date === todayStr);
    const loggedYesterday = newData.weeklyLog.some((entry) => entry.date === yesterdayStr);

    let newStreak = newData.currentStreak;
    if (loggedToday && !loggedYesterday) {
      newStreak = 1;
    } else if (loggedToday && loggedYesterday) {
      newStreak = newData.currentStreak + 1;
    } else if (!loggedToday && !loggedYesterday) {
      newStreak = 0;
    }

    const newLongestStreak = Math.max(newData.longestStreak, newStreak);

    // Check for new achievements (only if relevant data changed)
    const monthsChanged = newData.months !== previousData.months;
    const weeklyLogChanged = newData.weeklyLog !== previousData.weeklyLog;
    const competenciesChanged = newData.competencyChecklist !== previousData.competencyChecklist;
    const portfolioChanged = newData.portfolio !== previousData.portfolio;

    let newAchievements: string[] = [];
    if (monthsChanged || weeklyLogChanged || competenciesChanged || portfolioChanged) {
      newAchievements = checkAchievements(newData, newData.achievements);
      if (newAchievements.length > 0) {
        triggerConfetti();
      }
    }

    // Gamification: Award XP for logged hours (only if weeklyLog changed)
    if (weeklyLogChanged) {
      const totalHours = newData.weeklyLog.reduce((sum, entry) => sum + entry.hours, 0);
      const previousHours = previousData.weeklyLog.reduce((sum, entry) => sum + entry.hours, 0);
      if (totalHours > previousHours) {
        newData = awardXPForHours(newData, totalHours - previousHours);
      }
    }

    // Update streak bonus (only if streak changed)
    if (newStreak !== newData.currentStreak) {
      newData = updateStreakBonus(newData);
    }

    // Check daily challenges (only if weeklyLog or months changed)
    if (weeklyLogChanged || monthsChanged) {
      newData = checkDailyChallenges(newData);
    }

    // Award badges for achievements
    newAchievements.forEach((achievementId) => {
      newData = addBadge(newData, achievementId);
    });

    const updatedData = {
      ...newData,
      currentStreak: newStreak,
      longestStreak: newLongestStreak,
      achievements: [...new Set([...newData.achievements, ...newAchievements])],
      weeklyGoal: newData.weeklyGoal || 20,
    };

    // Optimize data periodically (only if significant changes)
    const shouldOptimize = updatedData.auditLog?.length !== previousData.auditLog?.length ||
                          updatedData.gamification?.dailyChallenges?.length !== previousData.gamification?.dailyChallenges?.length;

    const optimizedData = shouldOptimize ? optimizeData(updatedData) : updatedData;

    setData(optimizedData);

    // Use Firebase storage if authenticated and configured, otherwise use local storage
    if (isConfigured && auth.currentUser) {
      firebaseStorage.setData(optimizedData);
    } else {
      storage.setData(optimizedData);
    }
  }, []);

  const resetData = useCallback(() => {
    storage.reset();
    setData(initialData);
  }, []);

  const exportData = useCallback(() => {
    storage.export();
  }, []);

  const importData = useCallback(async (file: File) => {
    const newData = await storage.import(file);
    setData(newData);
    setPreferences(storage.getPreferences());
  }, []);

  const updatePreferencesFn = useCallback((newPreferences: Partial<Preferences>) => {
    setPreferences((prev) => {
      const updated = { ...prev, ...newPreferences };
      storage.setPreferences(updated);
      return updated;
    });
  }, []);

  const contextValue = useMemo(() => ({
    data,
    setData: updateData,
    resetData,
    exportData,
    importData,
    preferences,
    updatePreferences: updatePreferencesFn,
    isLoading,
  }), [data, preferences, isLoading, updateData, resetData, exportData, importData, updatePreferencesFn]);

  if (!mounted) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
