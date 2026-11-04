/**
 * Storage utilities for the new domain model
 * Export/import functionality with quota handling
 */

import { AppState } from '@/types/domain';
import { validateAppState } from './validation-new';

const EXPORT_KEY = 'progress-tracker:export';

/**
 * Export app state as JSON file
 */
export function exportAppState(state: AppState): void {
  try {
    const exportData = {
      ...state,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `progress-tracker-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Update last export time in settings
    state.settings.lastExportAt = new Date().toISOString();
  } catch (e) {
    console.error('Export failed:', e);
    throw new Error('Failed to export data');
  }
}

/**
 * Import app state from JSON file
 */
export async function importAppState(file: File): Promise<AppState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);

        // Validate data structure
        const validation = validateAppState(data);
        if (!validation.valid) {
          reject(new Error(`Invalid file: ${validation.errors?.join(', ') || 'Unknown validation error'}`));
          return;
        }

        resolve(data as AppState);
      } catch (err) {
        reject(new Error('Invalid file format'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

/**
 * Check for Safari ITP wipe scenario
 */
export function detectSafariITPWipe(): boolean {
  if (typeof window === 'undefined') return false;

  const lastKnownUser = localStorage.getItem('progress-tracker:lastKnownUser');
  const hasData = localStorage.getItem('progress-tracker-storage');

  return lastKnownUser === 'true' && !hasData;
}

/**
 * Mark user as known (for Safari ITP detection)
 */
export function markUserAsKnown(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('progress-tracker:lastKnownUser', 'true');
}

/**
 * Clear all data (reset to default)
 */
export function clearAllData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('progress-tracker-storage');
  localStorage.removeItem('progress-tracker:lastKnownUser');
}

/**
 * Get storage usage estimate
 */
export function getStorageUsage(): { used: number; total: number; percentage: number } {
  if (typeof window === 'undefined') return { used: 0, total: 0, percentage: 0 };

  let total = 0;
  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length + key.length;
    }
  }

  // Estimate quota (varies by browser, typically 5-10MB)
  const estimatedQuota = 5 * 1024 * 1024; // 5MB conservative estimate
  const percentage = (total / estimatedQuota) * 100;

  return {
    used: total,
    total: estimatedQuota,
    percentage: Math.min(100, percentage),
  };
}

/**
 * Check if storage quota is exceeded
 */
export function isQuotaExceeded(): boolean {
  const usage = getStorageUsage();
  return usage.percentage > 90; // Warn at 90%
}
