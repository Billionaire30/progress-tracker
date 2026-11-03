/**
 * Domain types for the Progress Tracker application
 * These types define the core data structures used throughout the app
 */

export type HabitId = string;

export interface Habit {
  id: HabitId;
  name: string;
  category: 'mindfulness' | 'health' | 'learning' | 'productivity';
  description: string;
  targetPerWeek: number;
  icon?: string;
  createdAt: string;
}

export interface HabitLog {
  date: string; // YYYY-MM-DD
  habitId: HabitId;
  completed: boolean;
}

export interface StudySession {
  id: string;
  date: string;
  hours: number;
  note?: string;
}

export interface Competency {
  id: string;
  title: string;
  category: string;
  completed: boolean;
  completedAt?: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  link?: string;
  imageUrl?: string;
  tags: string[];
}

export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  date: string;
  fileUrl?: string;
}

export interface AppState {
  habits: Habit[];
  habitLogs: HabitLog[];
  studySessions: StudySession[];
  competencies: Competency[];
  portfolio: PortfolioItem[];
  certificates: Certificate[];
  settings: {
    weeklyGoalHours: number;
    startDate: string;
    theme: 'light' | 'dark' | 'system';
  };
  version: number;
}
