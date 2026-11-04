/**
 * Migration functions for data model transitions
 * Handles migration from legacy data model to new domain model
 * NOTE: Phase 1 foundation - actual migration happens in Phase 2
 */

import { AppState, Habit, HabitLog, StudySession, Competency, PortfolioItem, Certificate, AppSettings } from '@/types/domain';
import { AppData as LegacyAppData, Habit as LegacyHabit, CompetencyItem, PortfolioItem as LegacyPortfolioItem, Certificate as LegacyCertificate } from './data';
import { getToday } from './timezone';
import { DEFAULT_HABITS, COMPETENCY_CHECKLIST, PORTFOLIO_ITEMS } from '@/constants/seedData';

/**
 * Default settings for new users
 */
export const DEFAULT_SETTINGS: AppSettings = {
  userName: undefined,
  startDate: getToday(),
  targetEndDate: (() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    return date.toISOString().split('T')[0];
  })(),
  weeklyGoalHours: 20,
  monthlyGoalHours: 87,
  annualGoalHours: 1040,
  weekStartsOn: 1,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  theme: 'system',
  reminderEnabled: false,
  reminderTime: undefined,
  lastActiveDate: getToday(),
  lastExportAt: undefined,
  lastKnownUser: true,
};

/**
 * Default state for new users
 * NOTE: Using type assertions for Phase 1 compatibility
 * Phase 2 will properly migrate seed data to new domain model
 */
export const DEFAULT_STATE: AppState = {
  version: 1,
  habits: DEFAULT_HABITS.map((h) => ({
    id: `habit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: h.name,
    description: h.description,
    category: h.category as any,
    targetPerWeek: h.target,
    status: h.status || 'active',
    pausedUntil: null,
    allowGraceDays: false,
    contributesToStudy: h.contributesToStudy || false,
    studyUnitHours: h.studyUnitHours,
    createdAt: new Date().toISOString(),
  })) as Habit[],
  habitLogs: [],
  studySessions: [],
  competencies: COMPETENCY_CHECKLIST.map((c) => ({
    id: c.id,
    title: c.label,
    category: getCompetencyCategory(c.id),
    completed: c.done,
    completedAt: c.done ? new Date().toISOString() : null,
    deadline: null,
  })) as Competency[],
  portfolio: PORTFOLIO_ITEMS.map((p) => ({
    id: p.id.toString(),
    category: 'road-design' as const,
    title: p.name,
    description: p.description,
    link: undefined,
    imageDataUrl: p.image,
    tags: [],
    createdAt: new Date().toISOString(),
  })) as PortfolioItem[],
  certificates: [],
  settings: DEFAULT_SETTINGS,
};

/**
 * Migrate from legacy data model to new domain model
 * This handles the transition from the old AppData structure to the new AppState
 */
export function migrateFromLegacy(legacyData: any): AppState {
  // If data is already in new format, return as-is
  if (legacyData.version === 1 && legacyData.habits && legacyData.habitLogs) {
    return legacyData as AppState;
  }

  // If no data or invalid data, return default state
  if (!legacyData || typeof legacyData !== 'object') {
    console.warn('Invalid legacy data, using default state');
    return DEFAULT_STATE;
  }

  const legacy = legacyData as LegacyAppData;

  // Migrate habits
  const habits: Habit[] = (legacy.habits || []).map((h: LegacyHabit) => ({
    id: h.id,
    name: h.name,
    category: h.category,
    description: h.description,
    targetPerWeek: h.target,
    status: h.status || 'active',
    pausedUntil: h.pausedUntil || null,
    allowGraceDays: false, // Default for legacy data
    contributesToStudy: h.contributesToStudy || false,
    studyUnitHours: h.studyUnitHours,
    icon: undefined,
    createdAt: new Date().toISOString(), // Can't recover original timestamp
  }));

  // Migrate habit logs from completedDates array
  const habitLogs: HabitLog[] = [];
  (legacy.habits || []).forEach((h: LegacyHabit) => {
    if (h.completedDates && Array.isArray(h.completedDates)) {
      h.completedDates.forEach((date) => {
        habitLogs.push({
          habitId: h.id,
          date,
          completed: true,
          backfilled: false,
          updatedAt: new Date().toISOString(),
        });
      });
    }
  });

  // Migrate study sessions from weeklyLog
  const studySessions: StudySession[] = (legacy.weeklyLog || []).map((entry) => ({
    id: entry.id,
    date: entry.date,
    hours: entry.hours,
    note: entry.focus,
    sourceHabitId: undefined, // Can't determine from legacy data
    createdAt: new Date().toISOString(),
    updatedAt: undefined,
  }));

  // Migrate competencies
  const competencies: Competency[] = (legacy.competencyChecklist || []).map((c: CompetencyItem) => ({
    id: c.id,
    title: c.label,
    category: getCompetencyCategory(c.id),
    completed: c.done,
    completedAt: c.done ? new Date().toISOString() : null,
    deadline: null,
  }));

  // Migrate portfolio
  const portfolio: PortfolioItem[] = (legacy.portfolio || []).map((p: LegacyPortfolioItem) => ({
    id: p.id.toString(),
    category: 'road-design' as const, // Default, can't determine from legacy
    title: p.name,
    description: p.description,
    link: undefined,
    imageDataUrl: p.image,
    tags: [],
    createdAt: new Date().toISOString(),
  }));

  // Migrate certificates
  const certificates: Certificate[] = (legacy.certificates || []).map((c: LegacyCertificate) => ({
    id: c.id,
    title: c.title,
    issuer: c.issuer,
    date: c.issueDate,
    fileDataUrl: c.image,
    createdAt: new Date().toISOString(),
  }));

  // Migrate settings
  const settings: AppSettings = {
    userName: undefined,
    startDate: legacy.startDate || getToday(),
    targetEndDate: (() => {
      const start = legacy.startDate || getToday();
      const date = new Date(start);
      date.setFullYear(date.getFullYear() + 1);
      return date.toISOString().split('T')[0];
    })(),
    weeklyGoalHours: legacy.weeklyGoal || 20,
    monthlyGoalHours: 87,
    annualGoalHours: 1040,
    weekStartsOn: 1,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    theme: legacy.preferences?.theme || 'system',
    reminderEnabled: legacy.preferences?.notificationsEnabled || false,
    reminderTime: undefined,
    lastActiveDate: getToday(),
    lastExportAt: undefined,
    lastKnownUser: true,
  };

  return {
    version: 1,
    habits,
    habitLogs,
    studySessions,
    competencies,
    portfolio,
    certificates,
    settings,
  };
}

/**
 * Helper function to determine competency category from ID
 */
function getCompetencyCategory(id: string): string {
  const categoryMap: Record<string, string> = {
    c1: 'CAD & Surveying',
    c2: 'CAD & Surveying',
    c3: 'CAD & Surveying',
    c4: 'CAD & Surveying',
    c5: 'CAD & Surveying',
    c6: 'CAD & Surveying',
    c7: 'Road & Drainage',
    c8: 'Road & Drainage',
    c9: 'Structural',
    c10: 'Structural',
    c11: 'Construction Management',
    c12: 'Construction Management',
    c13: 'Construction Management',
    c14: 'Professional Skills',
    c15: 'Professional Skills',
    c16: 'Professional Skills',
    c17: 'Professional Skills',
  };
  return categoryMap[id] || 'Other';
}
