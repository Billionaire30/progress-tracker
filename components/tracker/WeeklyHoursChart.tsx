"use client";

import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WeekEntriesList } from "@/components/tracker/WeekEntriesList";
import { Calendar, Plus, Table, Target } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useMemo, useCallback, memo } from "react";
import { getToday, getStartOfISOWeek } from "@/lib/timezone";
import { computeStudyGoalStatus } from "@/lib/goals";
import { StudySession } from "@/types/domain";

interface WeeklyHoursChartProps {
  onLogHoursClick: () => void;
}

export const WeeklyHoursChart = memo(function WeeklyHoursChart({ onLogHoursClick }: WeeklyHoursChartProps) {
  const studySessions = useAppStore((state) => state.studySessions);
  const settings = useAppStore((state) => state.settings);
  const deleteStudySession = useAppStore((state) => state.deleteStudySession);

  const showTable = false; // Simplified - can be re-added later with state

  const today = getToday();
  const weekStart = getStartOfISOWeek(today, settings.weekStartsOn);

  const thisWeekEntries = useMemo(() => {
    return studySessions.filter((entry) => entry.date >= weekStart);
  }, [studySessions, weekStart]);

  const weekTotal = useMemo(() => thisWeekEntries.reduce((sum, d) => sum + d.hours, 0), [thisWeekEntries]);
  const weeklyGoal = settings.weeklyGoalHours;
  const goalStatus = computeStudyGoalStatus(weekTotal, weeklyGoal);
  const goalProgress = goalStatus.percentage;
  const isGoalMet = weekTotal >= weeklyGoal;

  const weekData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day, index) => {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + index);
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const hours = thisWeekEntries
        .filter((entry) => entry.date === dateStr)
        .reduce((sum, entry) => sum + entry.hours, 0);
      return { day, hours };
    });
  }, [weekStart, thisWeekEntries]);

  const toggleView = useCallback(() => {
    // TODO: Implement table view toggle with state
  }, []);

  const handleDeleteEntry = useCallback((id: string) => {
    deleteStudySession(id);
  }, [deleteStudySession]);

  return (
    <Card className="hover-lift glass-card card-premium">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base sm:text-lg">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
            This Week
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleView}
            aria-label={showTable ? "View as chart" : "View as table"}
            aria-expanded={showTable}
            className="min-h-[36px] sm:min-h-[44px] min-w-[36px] sm:min-w-[44px] hover:bg-primary/10 hover:scale-105 transition-transform"
          >
            <Table className="h-4 w-4" aria-hidden="true" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        <div className="flex items-center gap-2 p-2 sm:p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
          <Target className={`h-4 w-4 sm:h-5 sm:w-5 ${isGoalMet ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs sm:text-sm font-medium">Weekly Goal</span>
              <span className={`text-xs sm:text-sm font-medium ${isGoalMet ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}>
                {weekTotal.toFixed(1)} / {weeklyGoal} hrs
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full ${isGoalMet ? "bg-gradient-to-r from-green-500 to-emerald-400" : "bg-gradient-to-r from-primary to-purple-500"} relative`}
                style={{ width: `${goalProgress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              </div>
            </div>
          </div>
        </div>
        {showTable ? (
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="border-b">
                <th scope="col" className="text-left py-1 sm:py-2">Day</th>
                <th scope="col" className="text-right py-1 sm:py-2 tabular-nums">Hours</th>
              </tr>
            </thead>
            <tbody>
              {weekData.map((day) => (
                <tr key={day.day} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="py-1 sm:py-2">{day.day}</td>
                  <td className="text-right py-1 sm:py-2 tabular-nums">{day.hours.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="min-h-[120px]">
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={weekData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar
                  dataKey="hours"
                  fill="url(#barGradient)"
                  radius={[4, 4, 0, 0]}
                  isAnimationActive={false}
                />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={1} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs sm:text-sm text-muted-foreground">
            {isGoalMet ? "🎉 Goal reached!" : "Keep going!"}
          </p>
          <Button size="sm" onClick={onLogHoursClick} className="text-xs sm:text-sm button-premium">
            <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Log hours</span>
            <span className="sm:hidden">Log</span>
          </Button>
        </div>
        <WeekEntriesList entries={thisWeekEntries} onDelete={handleDeleteEntry} />
      </CardContent>
    </Card>
  );
});
