"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn, LogOut, User, CheckCircle, Loader2, X, Shield } from "lucide-react";
import { isConfigured } from "@/lib/firebase";

export function SimpleAuth() {
  const { user, loading, signInWithGoogle, signOutUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

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
      setIsOpen(false);
      setIsAnimating(false);
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  const handleClickOutside = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false);
      setIsAnimating(false);
    }
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setIsAnimating(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

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
    if (!isOpen) {
      return (
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center justify-center rounded-md p-2 hover:bg-accent hover:text-accent-foreground transition-all duration-200 hover:scale-110"
          title={`Signed in as ${user.email}`}
        >
          <User className="h-4 w-4" />
        </button>
      );
    }

    return (
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClickOutside}
      >
        <div className={`w-full max-w-md transition-all duration-300 ${isAnimating ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}`}>
          <Card className="relative shadow-2xl border-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => { setIsOpen(false); setIsAnimating(false); }}
              className="absolute top-3 right-3 z-10 hover:bg-destructive/10 transition-colors"
            >
              <X className="h-4 w-4" />
            </Button>
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <User className="h-5 w-5 text-primary" />
                </div>
                Account
              </CardTitle>
              <p className="text-sm text-muted-foreground">Manage your account settings</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-green-500/10 to-green-500/5 rounded-lg border border-green-500/20">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">Signed in</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <div className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-primary mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    Your data is synced securely with Firebase. Changes are saved automatically.
                  </p>
                </div>
              </div>
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="w-full gap-2 hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
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
