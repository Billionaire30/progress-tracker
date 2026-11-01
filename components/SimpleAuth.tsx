"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, User, CheckCircle, Loader2 } from "lucide-react";
import { isConfigured } from "@/lib/firebase";

export function SimpleAuth() {
  const { user, loading, signInWithGoogle, signOutUser } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Sign in failed:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      setIsMenuOpen(false);
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  if (loading) {
    return (
      <div className="inline-flex items-center justify-center rounded-md p-2">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  if (!isConfigured) {
    return null; // Don't show auth button if Firebase is not configured
  }

  if (user) {
    return (
      <div className="relative group">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="inline-flex items-center justify-center rounded-md p-2 hover:bg-accent hover:text-accent-foreground transition-all duration-200 hover:scale-110"
          title={`Signed in as ${user.email}`}
        >
          <User className="h-4 w-4" />
        </button>
        {isMenuOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 p-2 bg-background border rounded-lg shadow-lg opacity-100 transition-opacity pointer-events-auto z-50">
            <div className="flex items-center gap-2 p-2 border-b">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-xs text-muted-foreground truncate">{user.email}</span>
            </div>
            <Button
              onClick={handleSignOut}
              variant="ghost"
              size="sm"
              className="w-full justify-start"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={handleSignIn}
      className="inline-flex items-center justify-center rounded-md p-2 hover:bg-accent hover:text-accent-foreground transition-all duration-200 hover:scale-110"
      title="Sign in with Google to sync your data"
    >
      <LogIn className="h-4 w-4" />
    </button>
  );
}
