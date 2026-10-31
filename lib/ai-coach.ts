import { AppData } from "./data";

export interface AIInsight {
  type: "recommendation" | "prediction" | "analysis" | "motivation";
  title: string;
  content: string;
  confidence: number;
  actionable: boolean;
}

export function generateAIInsights(data: AppData): AIInsight[] {
  const insights: AIInsight[] = [];

  // Analyze study patterns
  const totalHours = data.weeklyLog.reduce((sum, log) => sum + log.hours, 0);
  const daysWithLogs = new Set(data.weeklyLog.map((log) => log.date)).size;
  const avgHoursPerDay = daysWithLogs > 0 ? totalHours / daysWithLogs : 0;

  // Productivity analysis
  if (avgHoursPerDay > 0) {
    const weeklyGoal = data.weeklyGoal || 20;
    const projectedWeeklyHours = avgHoursPerDay * 7;

    if (projectedWeeklyHours < weeklyGoal * 0.8) {
      insights.push({
        type: "recommendation",
        title: "Increase study time",
        content: `Based on your current pace (${avgHoursPerDay.toFixed(1)}h/day), you're projected to log ${projectedWeeklyHours.toFixed(1)}h this week. Consider increasing to ${((weeklyGoal / 7) * 1.2).toFixed(1)}h/day to reach your ${weeklyGoal}h goal.`,
        confidence: 0.85,
        actionable: true,
      });
    } else if (projectedWeeklyHours >= weeklyGoal) {
      insights.push({
        type: "motivation",
        title: "Great progress!",
        content: `You're on track to exceed your weekly goal of ${weeklyGoal}h! Keep up the excellent work.`,
        confidence: 0.9,
        actionable: false,
      });
    }
  }

  // Streak analysis
  if (data.currentStreak >= 7) {
    insights.push({
      type: "motivation",
      title: "Impressive streak!",
      content: `You've maintained a ${data.currentStreak}-day streak. Consistency is key to mastering civil engineering concepts.`,
      confidence: 1.0,
      actionable: false,
    });
  } else if (data.currentStreak === 0 && totalHours > 0) {
    insights.push({
      type: "recommendation",
      title: "Build momentum",
      content: "Try to log hours every day, even if it's just 30 minutes. Small consistent efforts compound over time.",
      confidence: 0.75,
      actionable: true,
    });
  }

  // Completion prediction
  const monthsComplete = data.months.filter((m) => m.status === "complete").length;
  const monthsInProgress = data.months.filter((m) => m.status === "in-progress").length;

  if (monthsComplete > 0) {
    const avgWeeksPerMonth = data.startDate
      ? (new Date().getTime() - new Date(data.startDate).getTime()) / (1000 * 60 * 60 * 24 * 7) / monthsComplete
      : 4;

    const remainingMonths = 12 - monthsComplete;
    const estimatedWeeksRemaining = remainingMonths * avgWeeksPerMonth;
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + estimatedWeeksRemaining * 7);

    insights.push({
      type: "prediction",
      title: "Estimated completion",
      content: `Based on your current pace, you're projected to complete all 12 months by ${estimatedDate.toLocaleDateString()}.`,
      confidence: 0.7,
      actionable: false,
    });
  }

  // Focus area recommendations
  const focusAreaHours = data.weeklyLog.reduce((acc: Record<string, number>, log) => {
    const focus = log.focus || "Other";
    acc[focus] = (acc[focus] || 0) + log.hours;
    return acc;
  }, {});

  const focusAreas = Object.entries(focusAreaHours).sort((a, b) => b[1] - a[1]);

  if (focusAreas.length > 0) {
    const topFocus = focusAreas[0];
    insights.push({
      type: "analysis",
      title: "Primary focus area",
      content: `You've spent most of your time on ${topFocus[0]} (${topFocus[1].toFixed(1)}h). ${focusAreas.length > 1 ? `Consider balancing with ${focusAreas[1][0]} for comprehensive learning.` : ""}`,
      confidence: 0.8,
      actionable: focusAreas.length > 1,
    });
  }

  // Task management insights
  const totalTasks = data.months.reduce((sum, month) => sum + month.tasks.length, 0);
  const completedTasks = data.months.reduce(
    (sum, month) => sum + month.tasks.filter((t) => t.done).length,
    0
  );

  if (totalTasks > 0) {
    const completionRate = (completedTasks / totalTasks) * 100;

    if (completionRate < 50) {
      insights.push({
        type: "recommendation",
        title: "Task completion",
        content: `Your task completion rate is ${completionRate.toFixed(0)}%. Try breaking down larger tasks into smaller subtasks to make progress more manageable.`,
        confidence: 0.75,
        actionable: true,
      });
    } else if (completionRate >= 80) {
      insights.push({
        type: "motivation",
        title: "Excellent task management",
        content: `You're completing ${completionRate.toFixed(0)}% of your tasks. This shows great discipline and planning.`,
        confidence: 0.85,
        actionable: false,
      });
    }
  }

  // Competency progress
  const competenciesComplete = data.competencyChecklist.filter((c) => c.done).length;
  if (competenciesComplete >= 10) {
    insights.push({
      type: "motivation",
      title: "Halfway to mastery",
      content: `You've completed ${competenciesComplete}/17 competencies. You're well on your way to becoming a master engineer!`,
      confidence: 0.9,
      actionable: false,
    });
  }

  return insights;
}

export function generateNaturalLanguageResponse(
  data: AppData,
  query: string
): string {
  const lowerQuery = query.toLowerCase();

  // Hours-related queries
  if (lowerQuery.includes("hour") || lowerQuery.includes("time")) {
    const totalHours = data.weeklyLog.reduce((sum, log) => sum + log.hours, 0);
    const thisWeekHours = data.weeklyLog
      .filter((log) => {
        const logDate = new Date(log.date);
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        return logDate >= weekStart;
      })
      .reduce((sum, log) => sum + log.hours, 0);

    if (lowerQuery.includes("total")) {
      return `You've logged a total of ${totalHours.toFixed(1)} hours across all time.`;
    } else if (lowerQuery.includes("week") || lowerQuery.includes("this week")) {
      return `You've logged ${thisWeekHours.toFixed(1)} hours this week. Your goal is ${data.weeklyGoal || 20} hours.`;
    } else {
      return `Total: ${totalHours.toFixed(1)}h | This week: ${thisWeekHours.toFixed(1)}h`;
    }
  }

  // Progress-related queries
  if (lowerQuery.includes("progress") || lowerQuery.includes("how am i doing")) {
    const monthsComplete = data.months.filter((m) => m.status === "complete").length;
    const portfolioComplete = data.portfolio.filter((p) => p.status === "complete").length;
    const competenciesComplete = data.competencyChecklist.filter((c) => c.done).length;
    const overallProgress = Math.round(
      ((monthsComplete + portfolioComplete + competenciesComplete) / (12 + 5 + 17)) * 100
    );

    return `You're ${overallProgress}% complete overall: ${monthsComplete}/12 months, ${portfolioComplete}/5 portfolio items, ${competenciesComplete}/17 competencies.`;
  }

  // Streak-related queries
  if (lowerQuery.includes("streak")) {
    return `Your current streak is ${data.currentStreak} days, and your longest streak was ${data.longestStreak} days.`;
  }

  // Default response
  const insights = generateAIInsights(data);
  if (insights.length > 0) {
    return insights[0].content;
  }

  return "I can help you analyze your progress. Try asking about your hours, streak, or overall progress.";
}
