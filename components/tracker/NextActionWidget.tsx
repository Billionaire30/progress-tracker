"use client";

import { useMemo } from "react";
import { useAppStore, selectActiveHabits } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flame, BookOpen, Target, AlertTriangle, CheckCircle } from "lucide-react";
import { getToday, getStartOfISOWeek } from "@/lib/timezone";
import { getTimeOfDayPrompt } from "@/lib/timeOfDay";
import { computeStreak } from "@/lib/streak";

export function NextActionWidget() {
  const habits = useAppStore(selectActiveHabits);
  const habitLogs = useAppStore((state) => state.habitLogs);
  const competencies = useAppStore((state) => state.competencies);
  const portfolio = useAppStore((state) => state.portfolio);
  const studySessions = useAppStore((state) => state.studySessions);
  const settings = useAppStore((state) => state.settings);

  const today = getToday();
  const timePrompt = getTimeOfDayPrompt();
  const weekStart = getStartOfISOWeek(today, settings.weekStartsOn);

  const nextAction = useMemo(() => {
    // Priority 1: Streak at risk (urgent)
    for (const habit of habits) {
      const habitLogsForHabit = habitLogs.filter(log => log.habitId === habit.id);
      const isCompletedToday = habitLogsForHabit.some(log => log.date === today && log.completed);
      const streakResult = computeStreak(habitLogsForHabit, habit.id, today, {
        graceDays: habit.allowGraceDays ? 1 : 0,
        freezes: 0,
      });

      if (streakResult.current > 0 && !isCompletedToday && streakResult.atRisk) {
        return {
          type: "streak-risk",
          icon: <Flame className="h-5 w-5 text-orange-500" />,
          title: `${habit.name} - Streak at Risk!`,
          description: `You have a ${streakResult.current}-day streak. Complete it today to keep it alive.`,
          action: "Complete Habit",
          priority: "urgent",
        };
      }
    }

    // Priority 2: Habit with lowest weekly progress relative to target
    let lowestProgressHabit = null;
    let lowestProgress = Infinity;
    for (const habit of habits) {
      const habitLogsForHabit = habitLogs.filter(log => log.habitId === habit.id && log.completed);
      const completedThisWeek = habitLogsForHabit.filter(log => log.date >= weekStart).length;
      const progress = completedThisWeek / habit.targetPerWeek;

      if (progress < lowestProgress && progress < 1) {
        lowestProgress = progress;
        lowestProgressHabit = habit;
      }
    }

    if (lowestProgressHabit) {
      return {
        type: "habit-behind",
        icon: <Target className="h-5 w-5 text-blue-500" />,
        title: `Focus on ${lowestProgressHabit.name}`,
        description: `You're behind on this habit this week. Only ${Math.round(lowestProgress * 100)}% of your target.`,
        action: "Complete Habit",
        priority: "high",
      };
    }

    // Priority 3: Competency closest to completion
    const incompleteCompetencies = competencies.filter(c => !c.completed);
    if (incompleteCompetencies.length > 0 && incompleteCompetencies.length < 17) {
      const randomCompetency = incompleteCompetencies[Math.floor(Math.random() * incompleteCompetencies.length)];
      return {
        type: "competency",
        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
        title: "Complete a Competency",
        description: randomCompetency.title,
        action: "Mark Complete",
        priority: "medium",
      };
    }

    // Priority 4: Empty portfolio category
    if (portfolio.length === 0) {
      return {
        type: "portfolio",
        icon: <BookOpen className="h-5 w-5 text-purple-500" />,
        title: "Add Portfolio Item",
        description: "Start building your portfolio by adding your first project.",
        action: "Add Item",
        priority: "low",
      };
    }

    // Default: Log study hours if below weekly goal
    const weekTotal = studySessions
      .filter(s => s.date >= weekStart)
      .reduce((sum, entry) => sum + entry.hours, 0);
    const weeklyGoal = settings.weeklyGoalHours;
    if (weekTotal < weeklyGoal) {
      return {
        type: "study-hours",
        icon: <BookOpen className="h-5 w-5 text-blue-500" />,
        title: "Log Study Hours",
        description: `You've logged ${weekTotal.toFixed(1)} hrs this week. Target: ${weeklyGoal} hrs.`,
        action: "Log Hours",
        priority: "medium",
      };
    }

    // All caught up
    return {
      type: "all-caught-up",
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      title: "All Caught Up!",
      description: "You're on track with everything. Great job!",
      action: null,
      priority: "low",
    };
  }, [habits, habitLogs, competencies, portfolio, studySessions, settings, today, weekStart]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "border-orange-400 bg-orange-50 dark:bg-orange-950/20";
      case "high":
        return "border-blue-400 bg-blue-50 dark:bg-blue-950/20";
      case "medium":
        return "border-purple-400 bg-purple-50 dark:bg-purple-950/20";
      default:
        return "border-green-400 bg-green-50 dark:bg-green-950/20";
    }
  };

  return (
    <Card className={`border-2 ${getPriorityColor(nextAction.priority)} hover:shadow-premium transition-all duration-300`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          {nextAction.icon}
          Next Action
          {nextAction.priority === "urgent" && (
            <AlertTriangle className="h-4 w-4 text-orange-500 animate-pulse" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <h4 className="font-medium mb-1">{nextAction.title}</h4>
            <p className="text-sm text-muted-foreground">{nextAction.description}</p>
            <p className="text-xs text-primary mt-2 italic">{timePrompt}</p>
          </div>
          {nextAction.action && (
            <Button size="sm" className="w-full">
              {nextAction.action}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
