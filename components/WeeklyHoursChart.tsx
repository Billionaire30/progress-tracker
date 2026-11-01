import { useApp } from "@/lib/context";
import { getWeekData } from "@/lib/week";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WeekEntriesList } from "@/components/WeekEntriesList";
import { Calendar, Plus, Table, Target } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useMemo, useCallback, memo } from "react";

interface WeeklyHoursChartProps {
  onLogHoursClick: () => void;
}

export const WeeklyHoursChart = memo(function WeeklyHoursChart({ onLogHoursClick }: WeeklyHoursChartProps) {
  const { data, updatePreferences, setData, preferences } = useApp();
  const showTable = preferences.showChartAsTable || false;

  const weekData = useMemo(() => getWeekData(data.weeklyLog), [data.weeklyLog]);
  const weekTotal = useMemo(() => weekData.reduce((sum, d) => sum + d.hours, 0), [weekData]);
  const weeklyGoal = data.weeklyGoal || 20;
  const goalProgress = Math.min((weekTotal / weeklyGoal) * 100, 100);
  const isGoalMet = weekTotal >= weeklyGoal;

  const toggleView = useCallback(() => {
    updatePreferences({ showChartAsTable: !showTable });
  }, [showTable, updatePreferences]);

  const handleDeleteEntry = useCallback((id: string) => {
    setData({
      ...data,
      weeklyLog: data.weeklyLog.filter((entry) => entry.id !== id),
    });
  }, [data, setData]);

  const thisWeekEntries = useMemo(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startOfWeek.setDate(today.getDate() - diff);
    startOfWeek.setHours(0, 0, 0, 0);

    return data.weeklyLog.filter((entry) => {
      const entryDate = new Date(entry.date);
      return entryDate >= startOfWeek;
    });
  }, [data.weeklyLog]);

  return (
    <Card className="hover-lift glass-card">
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
            className="min-h-[36px] sm:min-h-[44px] min-w-[36px] sm:min-w-[44px]"
          >
            <Table className="h-4 w-4" aria-hidden="true" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        <div className="flex items-center gap-2 p-2 sm:p-3 bg-muted/50 rounded-lg">
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
                className={`h-full ${isGoalMet ? "bg-gradient-to-r from-green-500 to-emerald-400" : "bg-gradient-to-r from-primary to-purple-500"}`}
                style={{ width: `${goalProgress}%` }}
              />
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
                <tr key={day.day} className="border-b last:border-0">
                  <td className="py-1 sm:py-2">{day.day}</td>
                  <td className="text-right py-1 sm:py-2 tabular-nums">{day.hours.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ height: 120 }}>
            <ResponsiveContainer width="100%" height="100%">
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
                  animationDuration={150}
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
          <Button size="sm" onClick={onLogHoursClick} className="text-xs sm:text-sm">
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
