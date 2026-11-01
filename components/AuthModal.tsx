"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface AuthModalProps {
  open?: boolean;
  onClose?: () => void;
}

export function AuthModal({ open = true, onClose }: AuthModalProps) {
  const { signInWithGoogle, signInAnonymously } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      if (onClose) onClose();
    } catch (error: any) {
      console.error("Google sign-in failed:", error);
      if (error.code === 'auth/operation-not-allowed') {
        setError('Google sign-in is not enabled in Firebase Console. Please enable it in Authentication > Sign-in method.');
      } else if (error.code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized. Please add the current URL to authorized domains in Firebase Console > Authentication > Sign-in method > Authorized domains.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        setError('The authentication popup was closed. Please try again and ensure popups are allowed. If accessing via tunnel URL, add the domain to Firebase authorized domains.');
      } else if (error.code === 'auth/api-key-not-authorized') {
        setError('API key is not authorized. Please check API key restrictions in Google Cloud Console.');
      } else {
        setError(`Authentication failed: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymousSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInAnonymously();
      if (onClose) onClose();
    } catch (error: any) {
      console.error("Anonymous sign-in failed:", error);
      if (error.code === 'auth/admin-restricted-operation') {
        setError('Anonymous authentication is not enabled in Firebase Console. Please enable it in Authentication > Sign-in method.');
      } else {
        setError(`Authentication failed: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (onClose) onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Sign In to Sync Your Data</DialogTitle>
          <CardDescription className="pt-2">
            Sign in to automatically sync your progress between devices. Your data will be stored securely in the cloud.
          </CardDescription>
        </DialogHeader>
        <CardContent className="space-y-4 pt-4">
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <Button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full"
            variant="default"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" />
                Signing in...
              </>
            ) : (
              "Continue with Google"
            )}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <Button
            onClick={handleAnonymousSignIn}
            disabled={loading}
            className="w-full"
            variant="outline"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" />
                Signing in...
              </>
            ) : (
              "Continue without Account (Local Only)"
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Anonymous sign-in won't sync between devices. Use Google sign-in for automatic sync.
          </p>

          <Button
            onClick={handleClose}
            variant="ghost"
            className="w-full text-sm"
          >
            Cancel - Use App Without Sync
          </Button>
        </CardContent>
      </DialogContent>
    </Dialog>
  );
}
