"use client";

import { memo } from "react";

export const LoadingSpinner = memo(function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  return (
    <div className={`${sizeClasses[size]} relative`}>
      {/* Outer ring */}
      <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
      
      {/* Spinning ring */}
      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" style={{ animationDuration: '1s' }} />
      
      {/* Inner ring - counter-rotating */}
      <div className="absolute inset-2 rounded-full border-3 border-transparent border-b-purple-500 animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
      
      {/* Center dot */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
      </div>
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
