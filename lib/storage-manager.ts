import { AppData } from "./data";

const STORAGE_KEY = "civiltracker:data";
const MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB

export function checkStorageQuota(): { available: boolean; used: number; availableSpace: number } {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const used = data ? new Blob([data]).size : 0;
    const availableSpace = MAX_STORAGE_SIZE - used;

    return {
      available: availableSpace > 0,
      used,
      availableSpace,
    };
  } catch (error) {
    console.error("Storage quota check failed:", error);
    return { available: false, used: 0, availableSpace: 0 };
  }
}

export function saveWithQuotaCheck(data: AppData): { success: boolean; error?: string } {
  const quota = checkStorageQuota();

  if (!quota.available) {
    return {
      success: false,
      error: "Storage quota exceeded. Please delete old data or use fewer workspaces.",
    };
  }

  try {
    const serialized = JSON.stringify(data);
    const size = new Blob([serialized]).size;

    if (size > quota.availableSpace) {
      return {
        success: false,
        error: "Data too large. Consider archiving old workspaces.",
      };
    }

    localStorage.setItem(STORAGE_KEY, serialized);
    return { success: true };
  } catch (error) {
    console.error("Storage save failed:", error);
    return {
      success: false,
      error: "Failed to save data. Storage may be full.",
    };
  }
}

export function getStorageUsage(): { total: number; used: number; percentage: number } {
  let total = 0;
  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length;
    }
  }

  const data = localStorage.getItem(STORAGE_KEY);
  const used = data ? data.length : 0;

  return {
    total,
    used,
    percentage: total > 0 ? (used / total) * 100 : 0,
  };
}
