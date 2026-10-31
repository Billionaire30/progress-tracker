import { AppData } from "./data";

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  encryptionEnabled: boolean;
  auditLogEnabled: boolean;
  sessionTimeout: number; // in minutes
}

export function enableTwoFactor(data: AppData, secret: string): AppData {
  if (!data.preferences) data.preferences = {};

  (data.preferences as any).security = {
    ...(data.preferences as any).security,
    twoFactorEnabled: true,
    twoFactorSecret: secret,
  };

  if (!data.auditLog) data.auditLog = [];
  data.auditLog.push({
    id: `2fa-enable-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: "2fa_enabled",
    entity: "security",
    entityId: "2fa",
  });

  return data;
}

export function disableTwoFactor(data: AppData): AppData {
  if (!data.preferences) return data;

  (data.preferences as any).security = {
    ...(data.preferences as any).security,
    twoFactorEnabled: false,
    twoFactorSecret: undefined,
  };

  if (!data.auditLog) data.auditLog = [];
  data.auditLog.push({
    id: `2fa-disable-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: "2fa_disabled",
    entity: "security",
    entityId: "2fa",
  });

  return data;
}

export function enableEncryption(data: AppData): AppData {
  if (!data.preferences) data.preferences = {};

  (data.preferences as any).security = {
    ...(data.preferences as any).security,
    encryptionEnabled: true,
  };

  if (!data.auditLog) data.auditLog = [];
  data.auditLog.push({
    id: `encryption-enable-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: "encryption_enabled",
    entity: "security",
    entityId: "encryption",
  });

  return data;
}

export function disableEncryption(data: AppData): AppData {
  if (!data.preferences) return data;

  (data.preferences as any).security = {
    ...(data.preferences as any).security,
    encryptionEnabled: false,
  };

  if (!data.auditLog) data.auditLog = [];
  data.auditLog.push({
    id: `encryption-disable-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: "encryption_disabled",
    entity: "security",
    entityId: "encryption",
  });

  return data;
}

export function setSessionTimeout(data: AppData, minutes: number): AppData {
  if (!data.preferences) data.preferences = {};

  (data.preferences as any).security = {
    ...(data.preferences as any).security,
    sessionTimeout: minutes,
  };

  return data;
}

export function getSecuritySettings(data: AppData): SecuritySettings {
  const security = (data.preferences as any)?.security || {};
  return {
    twoFactorEnabled: security.twoFactorEnabled || false,
    twoFactorSecret: security.twoFactorSecret,
    encryptionEnabled: security.encryptionEnabled || false,
    auditLogEnabled: true, // Always enabled by default
    sessionTimeout: security.sessionTimeout || 30,
  };
}

export function purgeAuditLog(data: AppData, olderThanDays: number = 90): AppData {
  if (!data.auditLog) return data;

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

  data.auditLog = data.auditLog.filter((log) => new Date(log.timestamp) >= cutoffDate);

  return data;
}

export function exportAuditLog(data: AppData): string {
  if (!data.auditLog) return "[]";

  return JSON.stringify(data.auditLog, null, 2);
}

export function checkDataIntegrity(data: AppData): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  // Check for duplicate task IDs
  const taskIds = new Set<string>();
  data.months.forEach((month) => {
    month.tasks.forEach((task) => {
      if (taskIds.has(task.id)) {
        issues.push(`Duplicate task ID: ${task.id}`);
      }
      taskIds.add(task.id);
    });
  });

  // Check for invalid dates
  data.weeklyLog.forEach((log) => {
    const date = new Date(log.date);
    if (isNaN(date.getTime())) {
      issues.push(`Invalid date in weekly log: ${log.date}`);
    }
  });

  // Check for negative hours
  data.weeklyLog.forEach((log) => {
    if (log.hours < 0) {
      issues.push(`Negative hours in weekly log: ${log.date}`);
    }
  });

  return {
    valid: issues.length === 0,
    issues,
  };
}
