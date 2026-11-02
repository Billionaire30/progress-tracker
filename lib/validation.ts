import { z } from "zod";
import { AppData } from "./data";

// Task validation schema
export const TaskSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1).max(200),
  done: z.boolean(),
  description: z.string().max(1000).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  status: z.enum(["todo", "in-progress", "review", "done"]).optional(),
  estimatedHours: z.number().min(0).max(1000).optional(),
  actualHours: z.number().min(0).max(1000).optional(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

// Weekly log validation schema
export const WeeklyLogSchema = z.object({
  id: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  hours: z.number().min(0).max(24),
  focus: z.string().min(1).max(200),
});

// Workspace validation schema
export const WorkspaceSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  icon: z.string().max(10).optional(),
});

// AppData validation schema (basic structure validation)
const AppDataSchema = z.object({
  version: z.number(),
  months: z.array(z.object({
    id: z.number(),
    title: z.string(),
    focus: z.string(),
    software: z.array(z.string()),
    project: z.string(),
    portfolioOutput: z.string(),
    learningTopics: z.array(z.string()),
    status: z.enum(["not-started", "in-progress", "complete"]),
    tasks: z.array(z.object({
      id: z.string(),
      label: z.string(),
      done: z.boolean(),
    })),
  })).length(12),
  weeklyLog: z.array(z.object({
    id: z.string(),
    date: z.string(),
    hours: z.number(),
    focus: z.string(),
  })),
  competencyChecklist: z.array(z.object({
    id: z.string(),
    label: z.string(),
    done: z.boolean(),
  })).length(17),
  portfolio: z.array(z.object({
    id: z.number(),
    name: z.string(),
    description: z.string(),
    status: z.enum(["not-started", "in-progress", "complete"]),
  })).length(5),
  startDate: z.string().optional(),
  preferences: z.object({}).optional(),
  lastUpdated: z.string().optional(),
  currentStreak: z.number().optional(),
  longestStreak: z.number().optional(),
  achievements: z.array(z.string()).optional(),
  weeklyGoal: z.number().optional(),
  workspaces: z.array(z.any()).optional(),
  activeWorkspaceId: z.string().optional(),
  gamification: z.any().optional(),
  auditLog: z.array(z.any()).optional(),
  calendarEvents: z.array(z.any()).optional(),
  integrations: z.any().optional(),
  collaboration: z.any().optional(),
});

export function validateTask(task: any) {
  return TaskSchema.safeParse(task);
}

export function validateWeeklyLog(log: any) {
  return WeeklyLogSchema.safeParse(log);
}

export function validateWorkspace(workspace: any) {
  return WorkspaceSchema.safeParse(workspace);
}

export function validateAppData(data: any): { valid: boolean; errors?: string[] } {
  const result = AppDataSchema.safeParse(data);
  if (result.success) {
    return { valid: true };
  }
  const errors: string[] = [];
  if (result.error && 'issues' in result.error) {
    result.error.issues.forEach((issue: any) => {
      errors.push(`${issue.path.join('.')}: ${issue.message}`);
    });
  }
  return {
    valid: false,
    errors
  };
}
