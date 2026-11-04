"use client";

import React, { useEffect, useState } from "react";
import { auth, isConfigured } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup, signInAnonymously, signOut, onAuthStateChanged, User } from "firebase/auth";
import { ensureUserDocument } from "@/lib/user-management";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  signInWithGoogle: () => Promise<void>;
  signInAnonymously: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // If Firebase is not configured, skip auth initialization
    if (!isConfigured) {
      console.log("Firebase auth not configured, skipping auth initialization");
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        setUser(user);
        if (user) {
          // Ensure user document exists in Firestore
          await ensureUserDocument();
        }
        setLoading(false);
      } catch (err) {
        console.error("Error in auth state change:", err);
        setError(err as Error);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    if (!isConfigured) {
      throw new Error("Firebase auth is not configured");
    }
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Error signing in with Google:", error);
      if (error.code) {
        console.error("Firebase auth error code:", error.code);
        console.error("Firebase auth error message:", error.message);
      }
      throw error;
    }
  };

  const signInAnonymouslyHandler = async () => {
    if (!isConfigured) {
      throw new Error("Firebase auth is not configured");
    }
    try {
      await signInAnonymously(auth);
    } catch (error) {
      console.error("Error signing in anonymously:", error);
      throw error;
    }
  };

  const signOutUser = async () => {
    if (!isConfigured) {
      console.log("Firebase auth not configured, skipping sign out");
      // Still clear the user state even without Firebase
      setUser(null);
      return;
    }
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    error,
    signInWithGoogle,
    signInAnonymously: signInAnonymouslyHandler,
    signOutUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
