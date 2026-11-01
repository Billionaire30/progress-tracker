"use client";

import { useApp } from "@/lib/context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Award, Trophy, Star, Zap, Flame, Target } from "lucide-react";
import { useMemo } from "react";

export function GamificationPanel() {
  const { data } = useApp();

  const gamification = useMemo(() => data.gamification || {
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    totalXP: 0,
    badges: [],
    currentStreakBonus: 1,
    dailyChallenges: [],
    weeklyChallengesCompleted: 0,
  }, [data.gamification]);

  const xpProgress = useMemo(() => {
    return (gamification.xp / gamification.xpToNextLevel) * 100;
  }, [gamification.xp, gamification.xpToNextLevel]);

  const todayChallenges = useMemo(() => {
    const today = new Date().toDateString();
    return gamification.dailyChallenges.filter(
      (c) => new Date(c.expiresAt).toDateString() === today
    );
  }, [gamification.dailyChallenges]);

  return (
    <div className="space-y-6">
      {/* Level & XP */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Level {gamification.level}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>XP Progress</span>
              <span className="font-medium">
                {gamification.xp} / {gamification.xpToNextLevel} XP
              </span>
            </div>
            <Progress value={xpProgress} className="h-3" />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Star className="h-4 w-4" />
            <span>Total XP: {gamification.totalXP}</span>
          </div>
          {gamification.currentStreakBonus > 1 && (
            <div className="flex items-center gap-2 text-sm text-orange-600 font-medium">
              <Flame className="h-4 w-4" />
              <span>Streak Bonus: x{gamification.currentStreakBonus}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Daily Challenges */}
      {todayChallenges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              Daily Challenges
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {todayChallenges.map((challenge) => (
              <div
                key={challenge.id}
                className={`p-4 rounded-lg border ${
                  challenge.completed
                    ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
                    : "bg-muted/50"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{challenge.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {challenge.description}
                    </p>
                  </div>
                  {challenge.completed && (
                    <Badge variant="default" className="ml-2">
                      <Zap className="h-3 w-3 mr-1" />
                      +{challenge.rewardXP} XP
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Progress
                    value={(challenge.current / challenge.target) * 100}
                    className="flex-1 h-2"
                  />
                  <span className="text-xs text-muted-foreground">
                    {challenge.current} / {challenge.target}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Badges */}
      {gamification.badges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-500" />
              Badges Earned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {gamification.badges.map((badge) => (
                <Badge key={badge} variant="secondary" className="text-lg px-3 py-1">
                  {badge}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weekly Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold">{gamification.weeklyChallengesCompleted}</div>
              <div className="text-xs text-muted-foreground">Challenges Completed</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold">{data.currentStreak}</div>
              <div className="text-xs text-muted-foreground">Day Streak</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
