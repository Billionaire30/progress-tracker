import { AppData, initialData, Preferences } from "./data";
import { migrateData } from "./migrations";
import { validateAppData } from "./validation";
import { db, auth, isConfigured } from "./firebase";
import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  Unsubscribe
} from "firebase/firestore";
import { debounce } from "./performance";

const DATA_KEY = "civiltracker:data";
const PREFERENCES_KEY = "civiltracker:preferences";
const USER_DATA_COLLECTION = "userData";

// Local storage helpers (for offline fallback)
const localStorageHelper = {
  getData(): AppData {
    if (typeof window === "undefined") return initialData;
    const stored = window.localStorage.getItem(DATA_KEY);
    if (!stored) return initialData;
    try {
      const parsed = JSON.parse(stored);
      const migrated = migrateData(parsed);
      // Save migrated data if version changed
      if (migrated.version !== parsed.version) {
        localStorageHelper.setData(migrated);
      }
      return migrated;
    } catch (e) {
      console.error("Failed to parse stored data:", e);
      return initialData;
    }
  },
  setData(data: AppData): void {
    if (typeof window === "undefined") return;
    const dataWithTimestamp = {
      ...data,
      lastUpdated: new Date().toISOString(),
    };
    window.localStorage.setItem(DATA_KEY, JSON.stringify(dataWithTimestamp));
  },
  getPreferences(): Preferences {
    if (typeof window === "undefined") return {};
    const stored = window.localStorage.getItem(PREFERENCES_KEY);
    if (!stored) return {};
    try {
      return JSON.parse(stored) as Preferences;
    } catch (e) {
      return {};
    }
  },
  setPreferences(preferences: Preferences): void {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
  },
  reset(): void {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(DATA_KEY);
  }
};

let currentUser: string | null = null;
let dataListener: Unsubscribe | null = null;
let onDataChange: ((data: AppData) => void) | null = null;

// Debounced Firebase write to reduce write operations
const debouncedFirebaseWrite = debounce((data: AppData) => {
  if (!isConfigured || !currentUser) return;

  const userDocRef = doc(db, USER_DATA_COLLECTION, currentUser);
  setDoc(userDocRef, data)
    .then(() => console.log("Data synced to Firebase"))
    .catch((error) => {
      console.error("Failed to sync to Firebase:", error);
    });
}, 500); // 500ms debounce for faster feedback

// Initialize user on auth state change
let authUnsubscribe: Unsubscribe | null = null;

export const initFirebaseAuth = () => {
  if (!isConfigured) {
    console.log("Firebase not configured, skipping auth initialization");
    return;
  }

  if (authUnsubscribe) return; // Already initialized

  authUnsubscribe = auth.onAuthStateChanged((user) => {
    if (user) {
      currentUser = user.uid;
      console.log("User authenticated:", user.uid);
    } else {
      currentUser = null;
      console.log("User signed out");
    }
  });
};

export const firebaseStorage = {
  // Get data (local or from Firebase)
  getData(): AppData {
    // Always use local storage first for offline support
    return localStorageHelper.getData();
  },

  // Set data (syncs to Firebase if authenticated)
  setData(data: AppData): void {
    const dataWithTimestamp = {
      ...data,
      lastUpdated: new Date().toISOString(),
    };

    // Always save to localStorage for offline support (immediate)
    localStorageHelper.setData(dataWithTimestamp);

    // Sync to Firebase if authenticated and configured (debounced)
    if (isConfigured && currentUser) {
      debouncedFirebaseWrite(dataWithTimestamp);
    }
  },

  // Get preferences
  getPreferences(): Preferences {
    return localStorageHelper.getPreferences();
  },

  // Set preferences
  setPreferences(preferences: Preferences): void {
    localStorageHelper.setPreferences(preferences);

    // Sync to Firebase if authenticated and configured
    if (isConfigured && currentUser) {
      const userDocRef = doc(db, USER_DATA_COLLECTION, currentUser);
      getDoc(userDocRef).then((docSnap) => {
        if (docSnap.exists()) {
          const existingData = docSnap.data();
          setDoc(userDocRef, { ...existingData, preferences })
            .catch((error) => console.error("Failed to sync preferences:", error));
        }
      });
    }
  },

  // Subscribe to real-time data updates
  subscribeToData(callback: (data: AppData) => void): Unsubscribe | null {
    if (!isConfigured) {
      console.warn("Firebase not configured, cannot subscribe to data");
      return null;
    }

    onDataChange = callback;

    if (!currentUser) {
      console.warn("Cannot subscribe to data: No authenticated user");
      return null;
    }

    console.log("Subscribing to Firebase data for user:", currentUser);
    const userDocRef = doc(db, USER_DATA_COLLECTION, currentUser);

    // First, check if user has data
    getDoc(userDocRef).then((docSnap) => {
      if (!docSnap.exists()) {
        // New user - seed initial data
        console.log("New user detected, seeding initial data");
        const dataWithTimestamp = {
          ...initialData,
          lastUpdated: new Date().toISOString(),
        };
        setDoc(userDocRef, dataWithTimestamp)
          .then(() => {
            console.log("Initial data seeded to Firebase");
            localStorageHelper.setData(dataWithTimestamp);
            if (onDataChange) {
              onDataChange(dataWithTimestamp);
            }
          })
          .catch((error) => {
            console.error("Failed to seed initial data:", error);
            // Fall back to local storage
            localStorageHelper.setData(dataWithTimestamp);
            if (onDataChange) {
              onDataChange(dataWithTimestamp);
            }
          });
      } else {
        // User has data, load it
        const data = docSnap.data() as AppData;
        console.log("Loaded existing data from Firebase");
        const migratedData = migrateData(data);
        localStorageHelper.setData(migratedData);
        if (onDataChange) {
          onDataChange(migratedData);
        }
      }
    }).catch((error) => {
      console.error("Error checking for user data:", error);
      // Fall back to local storage
      const localData = localStorageHelper.getData();
      if (onDataChange) {
        onDataChange(localData);
      }
    });

    // Set up real-time listener
    dataListener = onSnapshot(
      userDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as AppData;
          console.log("Received data update from Firebase");
          // Migrate data if needed
          const migratedData = migrateData(data);
          // Update local storage
          localStorageHelper.setData(migratedData);
          // Trigger callback
          if (onDataChange) {
            onDataChange(migratedData);
          }
        }
      },
      (error) => {
        console.error("Error listening to data updates:", error);
        // Fall back to local storage on error
        const localData = localStorageHelper.getData();
        if (onDataChange) {
          onDataChange(localData);
        }
      }
    );

    return dataListener;
  },

  // Unsubscribe from data updates
  unsubscribeFromData(): void {
    if (dataListener) {
      dataListener();
      dataListener = null;
    }
  },

  // Cleanup auth listener
  cleanup(): void {
    if (authUnsubscribe) {
      authUnsubscribe();
      authUnsubscribe = null;
    }
  },

  // Reset data
  reset(): void {
    localStorageHelper.reset();
    if (isConfigured && currentUser) {
      const userDocRef = doc(db, USER_DATA_COLLECTION, currentUser);
      setDoc(userDocRef, initialData)
        .then(() => console.log("Data reset in Firebase"))
        .catch((error) => console.error("Failed to reset data in Firebase:", error));
    }
  },

  // Export data
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

  // Import data
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

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!isConfigured && auth.currentUser !== null;
  },

  // Get current user ID
  getCurrentUserId(): string | null {
    return isConfigured && auth.currentUser ? auth.currentUser.uid : null;
  }
};
