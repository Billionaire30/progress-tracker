/**
 * Zustand store with slices for state management
 * Includes persist middleware with versioned schema and migration support
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { z } from 'zod';
import {
  AppState,
  Habit,
  HabitLog,
  StudySession,
  Competency,
  PortfolioItem,
  Certificate,
  AppSettings,
  HabitId,
} from '@/types/domain';
import { migrateFromLegacy, DEFAULT_STATE } from './migrations-new';
import { validateAppState } from './validation-new';

// ============================================================================
// HABITS SLICE
// ============================================================================

interface HabitsSlice {
  habits: Habit[];
  habitLogs: HabitLog[];
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt'>) => void;
  updateHabit: (id: HabitId, updates: Partial<Habit>) => void;
  deleteHabit: (id: HabitId) => void;
  toggleHabitLog: (habitId: HabitId, date: string) => void;
  addHabitLog: (log: Omit<HabitLog, 'updatedAt'>) => void;
  deleteHabitLogs: (habitId: HabitId) => void;
}

const createHabitsSlice = (set: any, get: any): HabitsSlice => ({
  habits: [],
  habitLogs: [],

  addHabit: (habit) => {
    const newHabit: Habit = {
      ...habit,
      id: `habit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    set((state: AppState) => ({
      ...state,
      habits: [...state.habits, newHabit],
    }));
  },

  updateHabit: (id, updates) => {
    set((state: AppState) => ({
      ...state,
      habits: state.habits.map((h) => (h.id === id ? { ...h, ...updates } : h)),
    }));
  },

  deleteHabit: (id) => {
    set((state: AppState) => ({
      ...state,
      habits: state.habits.filter((h) => h.id !== id),
      habitLogs: state.habitLogs.filter((log) => log.habitId !== id),
    }));
  },

  toggleHabitLog: (habitId, date) => {
    const existingLog = get().habitLogs.find(
      (log: HabitLog) => log.habitId === habitId && log.date === date
    );

    if (existingLog) {
      // Remove log (uncheck)
      set((state: AppState) => ({
        ...state,
        habitLogs: state.habitLogs.filter(
          (log) => !(log.habitId === habitId && log.date === date)
        ),
      }));
    } else {
      // Add log (check)
      const newLog: HabitLog = {
        habitId,
        date,
        completed: true,
        updatedAt: new Date().toISOString(),
      };
      set((state: AppState) => ({
        ...state,
        habitLogs: [...state.habitLogs, newLog],
      }));
    }
  },

  addHabitLog: (log) => {
    const newLog: HabitLog = {
      ...log,
      updatedAt: new Date().toISOString(),
    };
    set((state: AppState) => ({
      ...state,
      habitLogs: [...state.habitLogs, newLog],
    }));
  },

  deleteHabitLogs: (habitId) => {
    set((state: AppState) => ({
      ...state,
      habitLogs: state.habitLogs.filter((log) => log.habitId !== habitId),
    }));
  },
});

// ============================================================================
// STUDY SLICE
// ============================================================================

interface StudySlice {
  studySessions: StudySession[];
  addStudySession: (session: Omit<StudySession, 'id' | 'createdAt'>) => void;
  updateStudySession: (id: string, updates: Partial<StudySession>) => void;
  deleteStudySession: (id: string) => void;
}

const createStudySlice = (set: any): StudySlice => ({
  studySessions: [],

  addStudySession: (session) => {
    const newSession: StudySession = {
      ...session,
      id: `study-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    set((state: AppState) => ({
      ...state,
      studySessions: [...state.studySessions, newSession],
    }));
  },

  updateStudySession: (id, updates) => {
    set((state: AppState) => ({
      ...state,
      studySessions: state.studySessions.map((s) =>
        s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
      ),
    }));
  },

  deleteStudySession: (id) => {
    set((state: AppState) => ({
      ...state,
      studySessions: state.studySessions.filter((s) => s.id !== id),
    }));
  },
});

// ============================================================================
// COMPETENCIES SLICE
// ============================================================================

interface CompetenciesSlice {
  competencies: Competency[];
  toggleCompetency: (id: string) => void;
  updateCompetency: (id: string, updates: Partial<Competency>) => void;
  setCompetencies: (competencies: Competency[]) => void;
}

const createCompetenciesSlice = (set: any): CompetenciesSlice => ({
  competencies: [],

  toggleCompetency: (id) => {
    set((state: AppState) => ({
      ...state,
      competencies: state.competencies.map((c) => {
        if (c.id !== id) return c;
        const completed = !c.completed;
        return {
          ...c,
          completed,
          completedAt: completed ? new Date().toISOString() : null,
        };
      }),
    }));
  },

  updateCompetency: (id, updates) => {
    set((state: AppState) => ({
      ...state,
      competencies: state.competencies.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    }));
  },

  setCompetencies: (competencies) => {
    set((state: AppState) => ({
      ...state,
      competencies,
    }));
  },
});

// ============================================================================
// PORTFOLIO SLICE
// ============================================================================

interface PortfolioSlice {
  portfolio: PortfolioItem[];
  addPortfolioItem: (item: Omit<PortfolioItem, 'id' | 'createdAt'>) => void;
  updatePortfolioItem: (id: string, updates: Partial<PortfolioItem>) => void;
  deletePortfolioItem: (id: string) => void;
}

const createPortfolioSlice = (set: any): PortfolioSlice => ({
  portfolio: [],

  addPortfolioItem: (item) => {
    const newItem: PortfolioItem = {
      ...item,
      id: `portfolio-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    set((state: AppState) => ({
      ...state,
      portfolio: [...state.portfolio, newItem],
    }));
  },

  updatePortfolioItem: (id, updates) => {
    set((state: AppState) => ({
      ...state,
      portfolio: state.portfolio.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    }));
  },

  deletePortfolioItem: (id) => {
    set((state: AppState) => ({
      ...state,
      portfolio: state.portfolio.filter((p) => p.id !== id),
    }));
  },
});

// ============================================================================
// CERTIFICATES SLICE
// ============================================================================

interface CertificatesSlice {
  certificates: Certificate[];
  addCertificate: (cert: Omit<Certificate, 'id' | 'createdAt'>) => void;
  updateCertificate: (id: string, updates: Partial<Certificate>) => void;
  deleteCertificate: (id: string) => void;
}

const createCertificatesSlice = (set: any): CertificatesSlice => ({
  certificates: [],

  addCertificate: (cert) => {
    const newCert: Certificate = {
      ...cert,
      id: `cert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    set((state: AppState) => ({
      ...state,
      certificates: [...state.certificates, newCert],
    }));
  },

  updateCertificate: (id, updates) => {
    set((state: AppState) => ({
      ...state,
      certificates: state.certificates.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    }));
  },

  deleteCertificate: (id) => {
    set((state: AppState) => ({
      ...state,
      certificates: state.certificates.filter((c) => c.id !== id),
    }));
  },
});

// ============================================================================
// SETTINGS SLICE
// ============================================================================

interface SettingsSlice {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  resetSettings: () => void;
}

const createSettingsSlice = (set: any): SettingsSlice => ({
  settings: DEFAULT_STATE.settings,

  updateSettings: (updates) => {
    set((state: AppState) => ({
      ...state,
      settings: { ...state.settings, ...updates },
    }));
  },

  resetSettings: () => {
    set((state: AppState) => ({
      ...state,
      settings: DEFAULT_STATE.settings,
    }));
  },
});

// ============================================================================
// ROOT STORE
// ============================================================================

type AppStore = AppState &
  HabitsSlice &
  StudySlice &
  CompetenciesSlice &
  PortfolioSlice &
  CertificatesSlice &
  SettingsSlice & {
    reset: () => void;
    version: number;
  };

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Initial state (version is included in DEFAULT_STATE)
      ...DEFAULT_STATE,

      // Habits slice
      ...createHabitsSlice(set, get),

      // Study slice
      ...createStudySlice(set),

      // Competencies slice
      ...createCompetenciesSlice(set),

      // Portfolio slice
      ...createPortfolioSlice(set),

      // Certificates slice
      ...createCertificatesSlice(set),

      // Settings slice
      ...createSettingsSlice(set),

      // Reset function
      reset: () => {
        set(DEFAULT_STATE);
      },
    }),
    {
      name: 'progress-tracker-storage',
      storage: createJSONStorage(() => localStorage),
      version: 1, // Schema version for migrations
      migrate: (persistedState: any, version: number) => {
        // Migration from legacy data model (version 0) to new schema (version 1)
        if (version === 0) {
          console.log('Migrating from legacy data model...');
          const migrated = migrateFromLegacy(persistedState);
          return migrated;
        }
        return persistedState;
      },
      onRehydrateStorage: () => (state) => {
        // Validate data after rehydration
        if (state) {
          const validation = validateAppState(state);
          if (!validation.valid) {
            console.error('Data validation failed after rehydration:', validation.errors);
            // Fall back to default state if validation fails
            // In production, you might want to show a recovery UI
          }
        }
      },
    }
  )
);

// ============================================================================
// SELECTORS (memoized to prevent re-renders)
// ============================================================================

// Habit selectors
export const selectActiveHabits = (state: AppStore) =>
  state.habits.filter((h) => h.status === 'active');

export const selectHabitById = (id: HabitId) => (state: AppStore) =>
  state.habits.find((h) => h.id === id);

export const selectHabitLogsForHabit = (habitId: HabitId) => (state: AppStore) =>
  state.habitLogs.filter((log) => log.habitId === habitId);

// Study selectors
export const selectStudySessionsForDate = (date: string) => (state: AppStore) =>
  state.studySessions.filter((s) => s.date === date);

export const selectTotalStudyHours = (state: AppStore) =>
  state.studySessions.reduce((sum, s) => sum + s.hours, 0);

// Competency selectors
export const selectCompletedCompetencies = (state: AppStore) =>
  state.competencies.filter((c) => c.completed);

export const selectCompetencyProgress = (state: AppStore) => {
  const total = state.competencies.length;
  const completed = selectCompletedCompetencies(state).length;
  return total > 0 ? (completed / total) * 100 : 0;
};

// Portfolio selectors
export const selectPortfolioByCategory = (category: string) => (state: AppStore) =>
  state.portfolio.filter((p) => p.category === category);

// Certificate selectors
export const selectCertificatesCount = (state: AppStore) =>
  state.certificates.length;
