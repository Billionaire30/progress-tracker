"use client";

import { useApp } from "@/lib/context";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";

export function AchievementsPanel() {
  const { data } = useApp();
  const unlockedCount = data.achievements.length;
  const totalCount = ACHIEVEMENTS.length;

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Achievements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {ACHIEVEMENTS.map((achievement) => {
            const isUnlocked = data.achievements.includes(achievement.id);
            return (
              <div
                key={achievement.id}
                className={`p-3 rounded-lg border text-center ${
                  isUnlocked
                    ? "bg-primary/10 border-primary"
                    : "bg-muted/30 border-muted opacity-50"
                }`}
                title={achievement.description}
              >
                <div className="text-2xl mb-1">{achievement.icon}</div>
                <div className="text-xs font-medium">{achievement.title}</div>
              </div>
            );
          })}
        </div>
        <p className="text-sm text-muted-foreground mt-4 text-center">
          {unlockedCount} of {totalCount} unlocked
        </p>
      </CardContent>
    </Card>
  );
}
