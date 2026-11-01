"use client";

import { ErrorBoundary } from "@/components/ErrorBoundary";

export function BodyWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="pointer-events-auto relative z-0 isolate">
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    </div>
  );
}
