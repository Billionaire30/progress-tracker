import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";
import { getAnalytics, Analytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || ""
};

// Check if Firebase is properly configured
const isFirebaseConfigured = firebaseConfig.apiKey && 
                           firebaseConfig.projectId && 
                           firebaseConfig.apiKey !== "your_api_key_here" &&
                           firebaseConfig.projectId !== "your_project_id";

// Initialize Firebase only if configured
let app: FirebaseApp | null = null;
let dbInstance: Firestore | null = null;
let authInstance: Auth | null = null;

if (isFirebaseConfigured) {
  try {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    dbInstance = getFirestore(app);
    authInstance = getAuth(app);
    console.log("Firebase initialized successfully");
  } catch (error) {
    console.error("Failed to initialize Firebase:", error);
  }
} else {
  console.warn("Firebase is not configured. Using local storage only.");
}

// Create stub objects for when Firebase is not configured
const stubAuth = {} as Auth;
const stubDb = {} as Firestore;

// Export instances (or stubs if not configured)
export const auth: Auth = authInstance || stubAuth;
export const db: Firestore = dbInstance || stubDb;

// Export configuration status
export const isConfigured = isFirebaseConfigured;

// Initialize Analytics (client-side only)
export let analytics: Analytics | null = null;

if (typeof window !== "undefined" && isFirebaseConfigured && firebaseConfig.measurementId && app) {
  try {
    analytics = getAnalytics(app);
    console.log("Firebase Analytics initialized");
  } catch (error) {
    console.warn("Failed to initialize Firebase Analytics:", error);
  }
}
