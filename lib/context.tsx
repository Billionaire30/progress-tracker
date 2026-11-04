"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from "react";
import { AppData, initialData, Preferences, initializeDefaultWorkspace, PublicProfile } from "./data";
import { storage } from "./storage";
import { firebaseStorage, initFirebaseAuth } from "./firebase-storage";
import { checkAchievements } from "./achievements";
import { triggerConfetti } from "./confetti";
import { auth, isConfigured } from "./firebase";
import { awardXPForHours, updateStreakBonus, checkDailyChallenges, addBadge } from "./gamification";
import { debounce, optimizeData } from "./performance";
import { updatePublicProfileData } from "./user-management";
import { getToday } from "./timezone";

interface AppContextType {
  data: AppData;
  setData: (data: AppData | ((prev: AppData) => AppData)) => void;
  resetData: () => void;
  exportData: () => void;
  importData: (file: File) => Promise<void>;
  preferences: Preferences;
  updatePreferences: (preferences: Partial<Preferences>) => void;
  isLoading: boolean;
  saveImmediately: (data: AppData) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(initialData);
  const [preferences, setPreferences] = useState<Preferences>({});
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const dataRef = useRef<AppData>(initialData);
  const isResettingRef = useRef(false);

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

  const updateData = useCallback((newData: AppData | ((prev: AppData) => AppData)) => {
    setData((prevData) => {
      const previousData = dataRef.current;
      const dataToUpdate = typeof newData === 'function' ? newData(prevData) : newData;

      // Skip saving if we're in the middle of a reset operation
      if (isResettingRef.current) {
        dataRef.current = dataToUpdate;
        return dataToUpdate;
      }

      // Skip expensive calculations if data hasn't meaningfully changed
      if (JSON.stringify(dataToUpdate) === JSON.stringify(previousData)) {
        return previousData;
      }

      // Calculate streak (only if weeklyLog changed)
      const weeklyLogChanged = dataToUpdate.weeklyLog !== previousData.weeklyLog;
      let newStreak = dataToUpdate.currentStreak;
      let newLongestStreak = dataToUpdate.longestStreak;

      if (weeklyLogChanged) {
        const todayStr = getToday();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

        const loggedToday = dataToUpdate.weeklyLog.some((entry) => entry.date === todayStr);
        const loggedYesterday = dataToUpdate.weeklyLog.some((entry) => entry.date === yesterdayStr);

        if (loggedToday && !loggedYesterday) {
          newStreak = 1;
        } else if (loggedToday && loggedYesterday) {
          newStreak = dataToUpdate.currentStreak + 1;
        } else if (!loggedToday && !loggedYesterday) {
          newStreak = 0;
        }
        // CRITICAL: longestStreak NEVER decreases (high-water mark)
        newLongestStreak = Math.max(dataToUpdate.longestStreak, newStreak);
      }

      // Check for new achievements (only if relevant data changed)
      const monthsChanged = dataToUpdate.months !== previousData.months;
      const competenciesChanged = dataToUpdate.competencyChecklist !== previousData.competencyChecklist;
      const portfolioChanged = dataToUpdate.portfolio !== previousData.portfolio;

      let newAchievements: string[] = [];
      if (monthsChanged || weeklyLogChanged || competenciesChanged || portfolioChanged) {
        newAchievements = checkAchievements(dataToUpdate, dataToUpdate.achievements);
        if (newAchievements.length > 0) {
          triggerConfetti();
        }
      }

      // Gamification: Award XP for logged hours (only if weeklyLog changed)
      let processedData = dataToUpdate;
      if (weeklyLogChanged) {
        const totalHours = dataToUpdate.weeklyLog.reduce((sum, entry) => sum + entry.hours, 0);
        const previousHours = previousData.weeklyLog.reduce((sum, entry) => sum + entry.hours, 0);
        if (totalHours > previousHours) {
          processedData = awardXPForHours(dataToUpdate, totalHours - previousHours);
        }
      }

      // Update streak bonus (only if streak changed)
      if (newStreak !== dataToUpdate.currentStreak) {
        processedData = updateStreakBonus(processedData);
      }

      // Check daily challenges (only if weeklyLog or months changed)
      if (weeklyLogChanged || monthsChanged) {
        processedData = checkDailyChallenges(processedData);
      }

      // Award badges for achievements
      newAchievements.forEach((achievementId) => {
        processedData = addBadge(processedData, achievementId);
      });

      const updatedData = {
        ...processedData,
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        achievements: [...new Set([...processedData.achievements, ...newAchievements])],
        weeklyGoal: processedData.weeklyGoal || 20,
      };

      // Optimize data periodically (only if significant changes)
      const shouldOptimize = updatedData.auditLog?.length !== previousData.auditLog?.length ||
                            updatedData.gamification?.dailyChallenges?.length !== previousData.gamification?.dailyChallenges?.length;

      const optimizedData = shouldOptimize ? optimizeData(updatedData) : updatedData;

      // Use Firebase storage if authenticated and configured, otherwise use local storage
      // Use debounced storage for frequent updates (habit completions, etc.)
      if (isConfigured && auth.currentUser) {
        firebaseStorage.setData(optimizedData);

        // Update public profile if visibility is not private
        if (optimizedData.profileVisibility && optimizedData.profileVisibility !== "private") {
          const profile: Partial<PublicProfile> = {
            userId: auth.currentUser.uid,
            displayName: auth.currentUser.displayName || "Unknown",
            photoURL: auth.currentUser.photoURL || undefined,
            overallProgress: Math.round(
              ((optimizedData.months.filter((m) => m.status === "complete").length +
                optimizedData.portfolio.filter((p) => p.status === "complete").length +
                optimizedData.competencyChecklist.filter((c) => c.done).length) /
                (12 + 5 + 17)) *
                100
            ),
            currentStreak: optimizedData.currentStreak,
            longestStreak: optimizedData.longestStreak,
            totalHours: optimizedData.weeklyLog.reduce((sum, entry) => sum + entry.hours, 0),
            level: optimizedData.gamification?.level || 1,
            totalXP: optimizedData.gamification?.totalXP || 0,
            badges: optimizedData.gamification?.badges || [],
            monthsCompleted: optimizedData.months.filter((m) => m.status === "complete").length,
            lastUpdated: optimizedData.lastUpdated,
          };
          updatePublicProfileData(optimizedData).catch((err) => console.error("Failed to update public profile:", err));
        }
      } else {
        // Use debounced storage for better performance on frequent updates
        storage.setDataDebounced(optimizedData);
      }

      return optimizedData;
    });
  }, []);

  // Immediate save for critical operations (reset, export, import)
  const saveImmediately = useCallback((data: AppData) => {
    if (isConfigured && auth.currentUser) {
      firebaseStorage.setData(data);
    } else {
      storage.setData(data);
    }
  }, []);

  const resetData = useCallback(() => {
    isResettingRef.current = true;
    storage.reset();
    // Clear Firebase data if configured and authenticated
    if (isConfigured && auth.currentUser) {
      firebaseStorage.setData(initialData);
    }
    // Set state directly without triggering save (to keep data cleared)
    dataRef.current = initialData;
    setData(initialData);
    // Reset the flag after a brief delay to ensure state update completes
    setTimeout(() => {
      isResettingRef.current = false;
    }, 100);
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
    saveImmediately,
  }), [data, preferences, isLoading, updateData, resetData, exportData, importData, updatePreferencesFn, saveImmediately]);

  if (!mounted) {
    return <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>;
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
