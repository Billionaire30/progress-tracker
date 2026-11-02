"use client";

import { memo } from "react";
import LatticeLoader from "@/components/LatticeLoader";

export const LoadingSpinner = memo(function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const cellSize = {
    sm: 8,
    md: 12,
    lg: 16,
  };

  return (
    <div style={{ '--ll-cell': `${cellSize[size]}px`, '--ll-color': '#8b5cf6', '--ll-idle': '0.2', '--ll-peak': '1', '--ll-cycle': '1s' } as React.CSSProperties}>
      <LatticeLoader
        pattern="orbit"
        grid={3}
        shape="round"
        color="#8b5cf6"
        cellSize={cellSize[size]}
        gap={4}
        glow={true}
        glowColor="#8b5cf6"
        className="ll-run"
      />
    </div>
  );
});

export const LoadingState = memo(function LoadingState({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-6">
        <LoadingSpinner size="lg" />
        <div className="space-y-2">
          <p className="text-foreground font-medium">{message}</p>
          <div className="flex items-center justify-center gap-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  );
});
