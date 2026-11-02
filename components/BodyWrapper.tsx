"use client";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useEffect } from "react";

export function BodyWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pointer-events-auto relative z-0 isolate min-h-screen">
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    </div>
  );
}
