"use client";

import { useAuth } from "@/components/AuthProvider";
import { LoadingState } from "@/components/LoadingSpinner";

export function AuthRequired({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingState message="Authenticating..." />;
  }

  // Allow access without authentication - app will use localStorage
  // Auth is optional for cloud sync
  return <div className="pointer-events-auto">{children}</div>;
}
