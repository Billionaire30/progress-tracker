"use client";

import { useApp } from "@/lib/context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, TrendingUp } from "lucide-react";
import { memo, useMemo } from "react";

export const StreakTracker = memo(function StreakTracker() {
  const { data } = useApp();

  const streakPercentage = useMemo(() =>
    data.longestStreak > 0 ? (data.currentStreak / data.longestStreak) * 100 : 0,
    [data.currentStreak, data.longestStreak]
  );

  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (streakPercentage / 100) * circumference;

  return (
    <Card className="overflow-hidden hover-lift glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Flame className={`h-5 w-5 ${data.currentStreak > 0 ? "text-orange-500" : "text-muted-foreground"}`} />
          Current Streak
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="relative">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-muted/20"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="url(#streakGradient)"
                strokeWidth="8"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className={`${data.currentStreak > 0 ? "" : "text-muted"}`}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="streakGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold tabular-nums gradient-text-gold">
                {data.currentStreak}
              </span>
            </div>
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Best: {data.longestStreak} days</span>
            </div>
            {data.currentStreak >= 7 && (
              <div className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                🔥 Great job! Keep it up!
              </div>
            )}
            {data.currentStreak === 0 && data.longestStreak > 0 && (
              <div className="text-xs text-muted-foreground">
                Start today to build your streak!
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
