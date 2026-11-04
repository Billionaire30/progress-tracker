/**
 * Domain types for the Progress Tracker application
 * These types define the core data structures used throughout the app
 */

export type HabitId = string;
export type HabitStatus = 'active' | 'paused' | 'archived';
export type HabitCategory = 'mindfulness' | 'health' | 'learning' | 'productivity';

export interface Habit {
  id: HabitId;
  name: string;
  category: HabitCategory;
  description: string;
  targetPerWeek: number;
  status: HabitStatus;
  pausedUntil?: string | null;   // YYYY-MM-DD, auto-resume
  allowGraceDays: boolean;
  contributesToStudy?: boolean;  // links to study hours
  studyUnitHours?: number;       // hours this habit contributes per completion
  icon?: string;
  createdAt: string;
}

export interface HabitLog {
  date: string;   // YYYY-MM-DD (local)
  habitId: HabitId;
  completed: boolean;
  backfilled?: boolean;
  updatedAt?: string;
}

export interface StudySession {
  id: string;
  date: string;   // YYYY-MM-DD (local)
  hours: number;
  note?: string;
  sourceHabitId?: HabitId;  // if auto-logged from a habit
  createdAt: string;
  updatedAt?: string;
}

export interface Competency {
  id: string;
  title: string;
  category: string;
  completed: boolean;
  completedAt?: string | null;
  deadline?: string | null;
}

export type PortfolioCategory = 'road-design' | 'two-storey-building' | 'integrated-infrastructure'
                          | 'site-engineering-record' | 'technical-writing' | 'certificates';

export interface PortfolioItem {
  id: string;
  category: PortfolioCategory;
  title: string;
  description: string;
  link?: string;
  imageDataUrl?: string;  // MVP: base64; upgrade path: Vercel Blob/S3
  tags: string[];
  createdAt: string;
}

export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  date: string;
  fileDataUrl?: string;
  createdAt: string;
}

export interface AppSettings {
  userName?: string;
  startDate: string;             // YYYY-MM-DD
  targetEndDate: string;         // YYYY-MM-DD
  weeklyGoalHours: number;       // default 20
  monthlyGoalHours: number;      // default 87 (20 * 4.33)
  annualGoalHours: number;       // default 1040
  weekStartsOn: 1 | 0;           // default 1 (Monday)
  timezone: string;              // IANA, detected on first load
  theme: 'light' | 'dark' | 'system';
  reminderEnabled: boolean;
  reminderTime?: string;         // HH:mm
  lastActiveDate?: string;
  lastExportAt?: string;
  lastKnownUser?: boolean;       // for Safari ITP detection
}

export interface AppState {
  version: number;
  habits: Habit[];
  habitLogs: HabitLog[];
  studySessions: StudySession[];
  competencies: Competency[];
  portfolio: PortfolioItem[];
  certificates: Certificate[];
  settings: AppSettings;
}

// Streak calculation types
export interface StreakOptions {
  graceDays: 0 | 1;
  freezes: number;
}

export interface StreakResult {
  current: number;
  best: number;               // high-water mark — NEVER decreases
  isActiveToday: boolean;
  atRisk: boolean;            // streak live but today not done
  freezesRemaining: number;
  longestGap: number;
}

// Journey progress types
export interface JourneyProgress {
  overall: number;            // weighted composite 0-100
  timeProgress: number;       // days elapsed / total days
  competencyProgress: number; // completed / total
  studyProgress: number;      // hours logged / annual target
  portfolioProgress: number;  // items added / total
  pace: 'ahead' | 'on-pace' | 'behind';
  rationale: string;
}

// Goal tracking types
export interface GoalStatus {
  status: 'ahead' | 'on-track' | 'behind';
  completed: number;
  target: number;
  percentage: number;
  expected: number;
  remaining: number;
}

// Milestone types
export interface Milestone {
  id: string;
  type: 'streak' | 'hours' | 'competency' | 'portfolio' | 'certificate';
  title: string;
  description: string;
  threshold: number;
  achieved: boolean;
  achievedAt?: string;
}

// Reflection types
export interface WeeklyReflection {
  weekId: string;  // YYYY-Www
  prompt: string;
  response: string;
  createdAt: string;
}
