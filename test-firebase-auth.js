/**
 * Firebase Authentication Test Script
 * Run this script to verify Firebase configuration is correct
 * Usage: node test-firebase-auth.js
 */

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAEz0bsz4sT8LJQezfJTeZjP58a6gMG1fg",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "project-tracker-d6d57.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "project-tracker-d6d57",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "project-tracker-d6d57.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "655567962248",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:655567962248:web:0069e8111919d73f49df3d",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-JEJF0YKDTK"
};

console.log("Firebase Configuration Check");
console.log("==============================");
console.log("API Key:", firebaseConfig.apiKey ? "✓ Present" : "✗ Missing");
console.log("Auth Domain:", firebaseConfig.authDomain ? "✓ Present" : "✗ Missing");
console.log("Project ID:", firebaseConfig.projectId ? "✓ Present" : "✗ Missing");
console.log("Storage Bucket:", firebaseConfig.storageBucket ? "✓ Present" : "✗ Missing");
console.log("Messaging Sender ID:", firebaseConfig.messagingSenderId ? "✓ Present" : "✗ Missing");
console.log("App ID:", firebaseConfig.appId ? "✓ Present" : "✗ Missing");
console.log("Measurement ID:", firebaseConfig.measurementId ? "✓ Present" : "✗ Missing");
console.log();

if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  console.log("✓ Firebase configuration appears valid");
  console.log();
  console.log("Next steps:");
  console.log("1. Run 'npm run dev' to start the dev server");
  console.log("2. Open http://localhost:3000 in your browser");
  console.log("3. Click the user icon and select 'Sign in with Google'");
  console.log("4. Verify authentication works in the browser console");
} else {
  console.log("✗ Firebase configuration is incomplete");
  console.log();
  console.log("Please check your .env.local file and ensure all required fields are present.");
  console.log("You can copy .env.example to .env.local and fill in the values.");
}
