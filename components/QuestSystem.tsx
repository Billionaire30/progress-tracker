"use client";

import { useApp } from "@/lib/context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Trophy, Flame, Target, Clock, Award, Zap } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { triggerConfetti } from "@/lib/confetti";

interface Quest {
  id: string;
  title: string;
  description: string;
  type: "daily" | "weekly" | "monthly" | "special";
  target: number;
  current: number;
  rewardXP: number;
  rewardCurrency: number;
  expiresAt: Date;
  completed: boolean;
  category: "study" | "consistency" | "milestone" | "special";
}

const DAILY_QUESTS_TEMPLATE: Omit<Quest, "current" | "completed">[] = [
  {
    id: "daily-1",
    title: "Study Marathon",
    description: "Log 3+ hours in a single day",
    type: "daily",
    target: 3,
    rewardXP: 50,
    rewardCurrency: 10,
    category: "study",
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  },
  {
    id: "daily-2",
    title: "Task Master",
    description: "Complete 5 tasks across all months",
    type: "daily",
    target: 5,
    rewardXP: 30,
    rewardCurrency: 5,
    category: "study",
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  },
  {
    id: "daily-3",
    title: "Consistency King",
    description: "Study for 7 consecutive days",
    type: "daily",
    target: 7,
    rewardXP: 100,
    rewardCurrency: 20,
    category: "consistency",
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  },
];

const WEEKLY_QUESTS_TEMPLATE: Omit<Quest, "current" | "completed">[] = [
  {
    id: "weekly-1",
    title: "Week Warrior",
    description: "Log 20+ hours in a week",
    type: "weekly",
    target: 20,
    rewardXP: 200,
    rewardCurrency: 50,
    category: "study",
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: "weekly-2",
    title: "Month Conqueror",
    description: "Complete an entire month",
    type: "weekly",
    target: 1,
    rewardXP: 500,
    rewardCurrency: 100,
    category: "milestone",
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
];

const MILESTONE_QUESTS_TEMPLATE: Omit<Quest, "current" | "completed">[] = [
  {
    id: "milestone-1",
    title: "First 10 Hours",
    description: "Log your first 10 hours",
    type: "monthly",
    target: 10,
    rewardXP: 100,
    rewardCurrency: 25,
    category: "milestone",
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  },
  {
    id: "milestone-2",
    title: "Halfway Hero",
    description: "Complete 50% of all tasks",
    type: "monthly",
    target: 50,
    rewardXP: 500,
    rewardCurrency: 100,
    category: "milestone",
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  },
  {
    id: "milestone-3",
    title: "Century Club",
    description: "Log 100 total hours",
    type: "monthly",
    target: 100,
    rewardXP: 1000,
    rewardCurrency: 200,
    category: "milestone",
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  },
];

export function QuestSystem() {
  const { data, setData } = useApp();
  const [quests, setQuests] = useState<Quest[]>([]);

  // Generate quests based on current state
  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const endOfWeek = new Date(today);
    endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));

    const totalHours = data.weeklyLog.reduce((sum, log) => sum + log.hours, 0);
    const totalTasks = data.months.reduce((sum, month) => sum + month.tasks.length, 0);
    const completedTasks = data.months.reduce((sum, month) => sum + month.tasks.filter((t) => t.done).length, 0);
    const taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    const generatedQuests: Quest[] = [];

    // Daily quests
    DAILY_QUESTS_TEMPLATE.forEach((template) => {
      let current = 0;
      if (template.id === "daily-1") {
        const todayHours = data.weeklyLog
          .filter((log) => log.date === today.toISOString().split("T")[0])
          .reduce((sum, log) => sum + log.hours, 0);
        current = todayHours;
      } else if (template.id === "daily-2") {
        const todayTasks = data.weeklyLog
          .filter((log) => log.date === today.toISOString().split("T")[0])
          .length;
        current = todayTasks;
      } else if (template.id === "daily-3") {
        current = data.currentStreak;
      }

      generatedQuests.push({
        ...template,
        current,
        expiresAt: tomorrow,
        completed: current >= template.target,
      });
    });

    // Weekly quests
    WEEKLY_QUESTS_TEMPLATE.forEach((template) => {
      let current = 0;
      if (template.id === "weekly-1") {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekHours = data.weeklyLog
          .filter((log) => new Date(log.date) >= weekStart)
          .reduce((sum, log) => sum + log.hours, 0);
        current = weekHours;
      } else if (template.id === "weekly-2") {
        const completedMonths = data.months.filter((m) => m.status === "complete").length;
        current = completedMonths;
      }

      generatedQuests.push({
        ...template,
        current,
        expiresAt: endOfWeek,
        completed: current >= template.target,
      });
    });

    // Milestone quests
    MILESTONE_QUESTS_TEMPLATE.forEach((template) => {
      let current = 0;
      if (template.id === "milestone-1") {
        current = Math.min(totalHours, template.target);
      } else if (template.id === "milestone-2") {
        current = taskProgress;
      } else if (template.id === "milestone-3") {
        current = totalHours;
      }

      generatedQuests.push({
        ...template,
        current,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        completed: current >= template.target,
      });
    });

    setQuests(generatedQuests);
  }, [data.weeklyLog, data.months, data.currentStreak]);

  const claimReward = (quest: Quest) => {
    const updatedData = {
      ...data,
      gamification: {
        level: data.gamification?.level || 1,
        xp: data.gamification?.xp || 0,
        xpToNextLevel: data.gamification?.xpToNextLevel || 100,
        totalXP: (data.gamification?.totalXP || 0) + quest.rewardXP,
        badges: data.gamification?.badges || [],
        currentStreakBonus: data.gamification?.currentStreakBonus || 1,
        dailyChallenges: data.gamification?.dailyChallenges || [],
        weeklyChallengesCompleted: data.gamification?.weeklyChallengesCompleted || 0,
        currency: (data.gamification?.currency || 0) + quest.rewardCurrency,
        purchasedRewards: data.gamification?.purchasedRewards || [],
      },
    };
    setData(updatedData);
    triggerConfetti();
  };

  const getQuestIcon = (category: Quest["category"]) => {
    switch (category) {
      case "study":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "consistency":
        return <Flame className="h-4 w-4 text-orange-500" />;
      case "milestone":
        return <Trophy className="h-4 w-4 text-yellow-500" />;
      case "special":
        return <Star className="h-4 w-4 text-purple-500" />;
    }
  };

  const getCategoryColor = (category: Quest["category"]) => {
    switch (category) {
      case "study":
        return "border-l-4 border-l-blue-500";
      case "consistency":
        return "border-l-4 border-l-orange-500";
      case "milestone":
        return "border-l-4 border-l-yellow-500";
      case "special":
        return "border-l-4 border-l-purple-500";
    }
  };

  const activeQuests = quests.filter((q) => !q.completed);
  const completedQuests = quests.filter((q) => q.completed);

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-purple-500" />
          Quest System
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quest Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{activeQuests.length}</div>
            <div className="text-xs text-muted-foreground">Active</div>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{completedQuests.length}</div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </div>
          <div className="text-center p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {quests.reduce((sum, q) => sum + q.rewardXP, 0)}
            </div>
            <div className="text-xs text-muted-foreground">Total XP</div>
          </div>
        </div>

        {/* Active Quests */}
        <div>
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-500" />
            Active Quests
          </h3>
          <div className="space-y-3">
            {activeQuests.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No active quests. Great job completing them all!
              </p>
            ) : (
              activeQuests.map((quest) => {
                const progress = Math.min((quest.current / quest.target) * 100, 100);
                return (
                  <div
                    key={quest.id}
                    className={`p-4 rounded-lg border ${getCategoryColor(quest.category)} ${
                      progress >= 100 ? "bg-green-50 dark:bg-green-950/20" : "bg-muted/50"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getQuestIcon(quest.category)}
                          <h4 className="font-medium text-sm">{quest.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {quest.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{quest.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-primary">
                          +{quest.rewardXP} XP
                        </div>
                        <div className="text-xs text-muted-foreground">
                          +{quest.rewardCurrency} 🪙
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={progress} className="flex-1 h-2" />
                      <span className="text-xs text-muted-foreground w-16 text-right">
                        {quest.current}/{quest.target}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Completed Quests */}
        {completedQuests.length > 0 && (
          <div>
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Award className="h-4 w-4 text-green-500" />
              Completed Quests
            </h3>
            <div className="space-y-2">
              {completedQuests.slice(0, 5).map((quest) => (
                <div
                  key={quest.id}
                  className="p-3 rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/20 opacity-75"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">{quest.title}</span>
                    </div>
                    <span className="text-xs text-green-600 font-medium">
                      +{quest.rewardXP} XP
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
