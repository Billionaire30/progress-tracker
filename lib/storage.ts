import { AppData, initialData, Preferences } from "./data";
import { migrateData } from "./migrations";
import { validateAppData } from "./validation";
import { saveWithQuotaCheck } from "./storage-manager";
import { z } from "zod";

const DATA_KEY = "civiltracker:data";
const PREFERENCES_KEY = "civiltracker:preferences";
const LAST_KNOWN_USER_KEY = "civiltracker:lastKnownUser";
const CORRUPT_BACKUP_KEY = "civiltracker:corruptBackup";

// Debounce utility for localStorage writes
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export const storage = {
  getData(): AppData {
    if (typeof window === "undefined") return initialData;

    const stored = localStorage.getItem(DATA_KEY);
    if (!stored) {
      // First-time user - mark as known user
      localStorage.setItem(LAST_KNOWN_USER_KEY, "true");
      return initialData;
    }

    try {
      const parsed = JSON.parse(stored);
      
      // Zod validation on read
      const validation = validateAppData(parsed);
      if (!validation.valid) {
        console.error("Data validation failed:", validation.errors);
        // Create backup of corrupt data
        localStorage.setItem(CORRUPT_BACKUP_KEY, stored);
        // Return initial data but don't overwrite corrupt
        return initialData;
      }

      const migrated = migrateData(parsed);

      // Save migrated data if version changed
      if (migrated.version !== parsed.version) {
        this.setData(migrated);
      }

      // Check for Safari ITP wipe
      const lastKnownUser = localStorage.getItem(LAST_KNOWN_USER_KEY);
      if (lastKnownUser === "true" && !parsed.habits && parsed.habits?.length === 0) {
        console.warn("Possible Safari ITP wipe detected");
        // Return initial data - recovery UI will handle this
        return initialData;
      }

      return migrated;
    } catch (e) {
      console.error("Failed to parse stored data:", e);
      // Create backup of corrupt data
      if (stored) {
        localStorage.setItem(CORRUPT_BACKUP_KEY, stored);
      }
      return initialData;
    }
  },

  setData(data: AppData): void {
    if (typeof window === "undefined") return;
    const dataWithTimestamp = {
      ...data,
      lastUpdated: new Date().toISOString(),
    };

    try {
      const quotaCheck = saveWithQuotaCheck(dataWithTimestamp);
      if (!quotaCheck.success) {
        console.error("Storage save failed:", quotaCheck.error);
        // Fallback: try to save without timestamp
        try {
          localStorage.setItem(DATA_KEY, JSON.stringify(data));
        } catch (e) {
          console.error("Fallback save also failed:", e);
          throw new Error("Storage quota exceeded");
        }
        return;
      }
    } catch (e) {
      console.error("Storage save error:", e);
      throw e;
    }
  },

  // Debounced version of setData for frequent updates (300ms delay)
  setDataDebounced: debounce(function(data: AppData) {
    if (typeof window === "undefined") return;
    const dataWithTimestamp = {
      ...data,
      lastUpdated: new Date().toISOString(),
    };

    const quotaCheck = saveWithQuotaCheck(dataWithTimestamp);
    if (!quotaCheck.success) {
      console.error("Storage save failed:", quotaCheck.error);
      try {
        localStorage.setItem(DATA_KEY, JSON.stringify(data));
      } catch (e) {
        console.error("Fallback save also failed:", e);
      }
    }
  }, 300),

  getPreferences(): Preferences {
    if (typeof window === "undefined") return {};

    const stored = localStorage.getItem(PREFERENCES_KEY);
    if (!stored) return {};

    try {
      return JSON.parse(stored) as Preferences;
    } catch (e) {
      console.error("Failed to parse stored preferences:", e);
      return {};
    }
  },

  setPreferences(preferences: Preferences): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
  },

  reset(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(DATA_KEY);
  },

  seed(): void {
    if (typeof window === "undefined") return;
    this.setData(initialData);
  },

  export(): void {
    try {
      const data = this.getData();
      const preferences = this.getPreferences();
      const exportData = { ...data, preferences };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `civiltracker-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Update last export time
      if (data.preferences) {
        // lastExportAt is not in Preferences type, skip for now
        this.setData(data);
      }
    } catch (e) {
      console.error("Export failed:", e);
      throw e;
    }
  },

  import(file: File): Promise<AppData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string) as AppData & { preferences?: Preferences };

          // Validate data structure
          const validation = validateAppData(data);
          if (!validation.valid) {
            reject(new Error(`Invalid file: ${validation.errors?.join(", ") || "Unknown validation error"}`));
            return;
          }

          // Migrate data if needed
          const migratedData = migrateData(data);

          this.setData(migratedData);
          if (migratedData.preferences) {
            this.setPreferences(migratedData.preferences);
          }
          resolve(migratedData);
        } catch (err) {
          reject(new Error("Invalid file"));
        }
      };
      reader.onerror = () => reject(new Error("Invalid file"));
      reader.readAsText(file);
    });
  },

  // Check if there's a corrupt backup
  hasCorruptBackup(): boolean {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(CORRUPT_BACKUP_KEY) !== null;
  },

  // Get corrupt backup data
  getCorruptBackup(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(CORRUPT_BACKUP_KEY);
  },

  // Clear corrupt backup
  clearCorruptBackup(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(CORRUPT_BACKUP_KEY);
  },

  // Check for Safari ITP wipe scenario
  detectSafariITPWipe(): boolean {
    if (typeof window === "undefined") return false;
    const lastKnownUser = localStorage.getItem(LAST_KNOWN_USER_KEY);
    const currentData = this.getData();
    return lastKnownUser === "true" && 
           (!currentData.habits || currentData.habits.length === 0) &&
           currentData.version > 0;
  }
};
