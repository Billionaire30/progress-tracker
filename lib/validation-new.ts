/**
 * Zod validation schemas for new domain model
 * Provides runtime type checking and validation
 */

import { z } from 'zod';
import { AppState, Habit, HabitLog, StudySession, Competency, PortfolioItem, Certificate, AppSettings } from '@/types/domain';

// ============================================================================
// HABIT SCHEMAS
// ============================================================================

export const HabitSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100),
  category: z.enum(['mindfulness', 'health', 'learning', 'productivity']),
  description: z.string().max(500),
  targetPerWeek: z.number().min(1).max(7),
  status: z.enum(['active', 'paused', 'archived']),
  pausedUntil: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  allowGraceDays: z.boolean(),
  contributesToStudy: z.boolean().optional(),
  studyUnitHours: z.number().min(0).max(24).optional(),
  icon: z.string().optional(),
  createdAt: z.string().datetime(),
});

export const HabitLogSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  habitId: z.string().min(1),
  completed: z.boolean(),
  backfilled: z.boolean().optional(),
  updatedAt: z.string().datetime().optional(),
});

// ============================================================================
// STUDY SESSION SCHEMAS
// ============================================================================

export const StudySessionSchema = z.object({
  id: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  hours: z.number().min(0).max(24),
  note: z.string().max(500).optional(),
  sourceHabitId: z.string().min(1).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
});

// ============================================================================
// COMPETENCY SCHEMAS
// ============================================================================

export const CompetencySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(200),
  category: z.string().min(1).max(100),
  completed: z.boolean(),
  completedAt: z.string().datetime().nullable().optional(),
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
});

// ============================================================================
// PORTFOLIO SCHEMAS
// ============================================================================

export const PortfolioItemSchema = z.object({
  id: z.string().min(1),
  category: z.enum([
    'road-design',
    'two-storey-building',
    'integrated-infrastructure',
    'site-engineering-record',
    'technical-writing',
    'certificates',
  ]),
  title: z.string().min(1).max(100),
  description: z.string().max(1000),
  link: z.string().url().optional(),
  imageDataUrl: z.string().optional(),
  tags: z.array(z.string().max(50)).max(10),
  createdAt: z.string().datetime(),
});

// ============================================================================
// CERTIFICATE SCHEMAS
// ============================================================================

export const CertificateSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(200),
  issuer: z.string().min(1).max(100),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  fileDataUrl: z.string().optional(),
  createdAt: z.string().datetime(),
});

// ============================================================================
// SETTINGS SCHEMAS
// ============================================================================

export const AppSettingsSchema = z.object({
  userName: z.string().max(50).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  targetEndDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  weeklyGoalHours: z.number().min(1).max(168),
  monthlyGoalHours: z.number().min(1).max(744),
  annualGoalHours: z.number().min(1).max(8760),
  weekStartsOn: z.union([z.literal(0), z.literal(1)]),
  timezone: z.string().min(1),
  theme: z.enum(['light', 'dark', 'system']),
  reminderEnabled: z.boolean(),
  reminderTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  lastActiveDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  lastExportAt: z.string().datetime().optional(),
  lastKnownUser: z.boolean().optional(),
});

// ============================================================================
// APP STATE SCHEMA
// ============================================================================

export const AppStateSchema = z.object({
  version: z.number().int().min(1),
  habits: z.array(HabitSchema),
  habitLogs: z.array(HabitLogSchema),
  studySessions: z.array(StudySessionSchema),
  competencies: z.array(CompetencySchema),
  portfolio: z.array(PortfolioItemSchema),
  certificates: z.array(CertificateSchema),
  settings: AppSettingsSchema,
});

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

export function validateHabit(data: unknown): { valid: boolean; errors?: string[] } {
  const result = HabitSchema.safeParse(data);
  if (result.success) {
    return { valid: true };
  }
  return {
    valid: false,
    errors: result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`),
  };
}

export function validateHabitLog(data: unknown): { valid: boolean; errors?: string[] } {
  const result = HabitLogSchema.safeParse(data);
  if (result.success) {
    return { valid: true };
  }
  return {
    valid: false,
    errors: result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`),
  };
}

export function validateStudySession(data: unknown): { valid: boolean; errors?: string[] } {
  const result = StudySessionSchema.safeParse(data);
  if (result.success) {
    return { valid: true };
  }
  return {
    valid: false,
    errors: result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`),
  };
}

export function validateCompetency(data: unknown): { valid: boolean; errors?: string[] } {
  const result = CompetencySchema.safeParse(data);
  if (result.success) {
    return { valid: true };
  }
  return {
    valid: false,
    errors: result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`),
  };
}

export function validatePortfolioItem(data: unknown): { valid: boolean; errors?: string[] } {
  const result = PortfolioItemSchema.safeParse(data);
  if (result.success) {
    return { valid: true };
  }
  return {
    valid: false,
    errors: result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`),
  };
}

export function validateCertificate(data: unknown): { valid: boolean; errors?: string[] } {
  const result = CertificateSchema.safeParse(data);
  if (result.success) {
    return { valid: true };
  }
  return {
    valid: false,
    errors: result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`),
  };
}

export function validateAppSettings(data: unknown): { valid: boolean; errors?: string[] } {
  const result = AppSettingsSchema.safeParse(data);
  if (result.success) {
    return { valid: true };
  }
  return {
    valid: false,
    errors: result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`),
  };
}

export function validateAppState(data: unknown): { valid: boolean; errors?: string[] } {
  const result = AppStateSchema.safeParse(data);
  if (result.success) {
    return { valid: true };
  }
  return {
    valid: false,
    errors: result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`),
  };
}
