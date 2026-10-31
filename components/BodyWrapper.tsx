"use client";

import { ErrorBoundary } from "@/components/ErrorBoundary";

export function BodyWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="pointer-events-auto">
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    </div>
  );
}
