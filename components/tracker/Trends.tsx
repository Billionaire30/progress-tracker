"use client";

import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Minus, ArrowUp, ArrowDown } from "lucide-react";
import { useMemo } from "react";
import { getToday, addDays } from "@/lib/timezone";

interface TrendData {
  date: string;
  hours: number;
  habits: number;
}

export function Trends() {
  const studySessions = useAppStore((state) => state.studySessions);
  const habitLogs = useAppStore((state) => state.habitLogs);
  const habits = useAppStore((state) => state.habits);

  const trends = useMemo(() => {
    const today = getToday();
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      return addDays(today, -29 + i);
    });

    const trendData: TrendData[] = last30Days.map(date => {
      const hours = studySessions
        .filter(entry => entry.date === date)
        .reduce((sum, entry) => sum + entry.hours, 0);

      const habitsCompleted = habitLogs
        .filter(log => log.date === date && log.completed)
        .map(log => log.habitId);
      const uniqueHabits = new Set(habitsCompleted).size;

      return { date, hours, habits: uniqueHabits };
    });

    // Calculate trends
    const recent7Days = trendData.slice(-7);
    const previous7Days = trendData.slice(-14, -7);

    const recentHours = recent7Days.reduce((sum, d) => sum + d.hours, 0);
    const previousHours = previous7Days.reduce((sum, d) => sum + d.hours, 0);

    const recentHabits = recent7Days.reduce((sum, d) => sum + d.habits, 0);
    const previousHabits = previous7Days.reduce((sum, d) => sum + d.habits, 0);

    const hoursTrend = recentHours > previousHours ? 'up' : recentHours < previousHours ? 'down' : 'flat';
    const habitsTrend = recentHabits > previousHabits ? 'up' : recentHabits < previousHabits ? 'down' : 'flat';

    const hoursChange = previousHours > 0 ? ((recentHours - previousHours) / previousHours) * 100 : 0;
    const habitsChange = previousHabits > 0 ? ((recentHabits - previousHabits) / previousHabits) * 100 : 0;

    return {
      trendData,
      hoursTrend,
      habitsTrend,
      hoursChange,
      habitsChange,
      recentHours,
      previousHours,
      recentHabits,
      previousHabits,
    };
  }, [studySessions, habitLogs]);

  const TrendIcon = ({ trend }: { trend: string }) => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const ChangeBadge = ({ change, trend }: { change: number; trend: string }) => {
    const isPositive = trend === 'up';
    const color = isPositive ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-500';
    const icon = isPositive ? <ArrowUp className="h-3 w-3" /> : trend === 'down' ? <ArrowDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />;

    return (
      <span className={`flex items-center gap-1 text-xs ${color}`}>
        {icon}
        {Math.abs(change).toFixed(1)}%
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Hours (Last 7 days)</span>
              <TrendIcon trend={trends.hoursTrend} />
            </div>
            <div className="text-2xl font-bold tabular-nums">{trends.recentHours.toFixed(1)}h</div>
            <div className="mt-1">
              <ChangeBadge change={trends.hoursChange} trend={trends.hoursTrend} />
              <span className="text-xs text-muted-foreground ml-2">vs prev 7 days</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Habits (Last 7 days)</span>
              <TrendIcon trend={trends.habitsTrend} />
            </div>
            <div className="text-2xl font-bold tabular-nums">{trends.recentHabits}</div>
            <div className="mt-1">
              <ChangeBadge change={trends.habitsChange} trend={trends.habitsTrend} />
              <span className="text-xs text-muted-foreground ml-2">vs prev 7 days</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>30-Day Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trends.trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getMonth() + 1}/${date.getDate()}`;
                }}
                interval={4}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(value: any) => {
                  const date = new Date(value);
                  return date.toLocaleDateString();
                }}
              />
              <Line
                type="monotone"
                dataKey="hours"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
                name="Hours"
              />
              <Line
                type="monotone"
                dataKey="habits"
                stroke="hsl(var(--secondary))"
                strokeWidth={2}
                dot={false}
                name="Habits"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
