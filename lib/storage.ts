import { AppData, initialData, Preferences } from "./data";
import { migrateData } from "./migrations";
import { validateAppData } from "./validation";
import { saveWithQuotaCheck } from "./storage-manager";

const DATA_KEY = "civiltracker:data";
const PREFERENCES_KEY = "civiltracker:preferences";

export const storage = {
  getData(): AppData {
    if (typeof window === "undefined") return initialData;

    const stored = localStorage.getItem(DATA_KEY);
    if (!stored) {
      this.setData(initialData);
      return initialData;
    }

    try {
      const parsed = JSON.parse(stored);
      const migrated = migrateData(parsed);

      // Save migrated data if version changed
      if (migrated.version !== parsed.version) {
        this.setData(migrated);
      }

      return migrated;
    } catch (e) {
      console.error("Failed to parse stored data:", e);
      this.setData(initialData);
      return initialData;
    }
  },

  setData(data: AppData): void {
    if (typeof window === "undefined") return;
    const dataWithTimestamp = {
      ...data,
      lastUpdated: new Date().toISOString(),
    };

    const quotaCheck = saveWithQuotaCheck(dataWithTimestamp);
    if (!quotaCheck.success) {
      console.error("Storage save failed:", quotaCheck.error);
      // Fallback: try to save without timestamp
      try {
        localStorage.setItem(DATA_KEY, JSON.stringify(data));
      } catch (e) {
        console.error("Fallback save also failed:", e);
      }
      return;
    }
  },

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
  }
};
