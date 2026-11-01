"use client";

import { useApp } from "@/lib/context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Clock, Target, Award } from "lucide-react";
import { useMemo } from "react";

export function StatsDashboard() {
  const { data } = useApp();

  const stats = useMemo(() => {
    const totalHours = data.weeklyLog.reduce((sum, entry) => sum + entry.hours, 0);
    const monthsComplete = data.months.filter((m) => m.status === "complete").length;
    const competenciesComplete = data.competencyChecklist.filter((c) => c.done).length;
    const portfolioComplete = data.portfolio.filter((p) => p.status === "complete").length;

    // Monthly hours data
    const monthlyHours = Array.from({ length: 12 }, (_, i) => {
      const monthStart = new Date(data.startDate || new Date());
      monthStart.setMonth(monthStart.getMonth() + i);
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthStart.getMonth() + 1);

      return {
        month: `M${i + 1}`,
        hours: data.weeklyLog
          .filter((entry) => {
            const entryDate = new Date(entry.date);
            return entryDate >= monthStart && entryDate < monthEnd;
          })
          .reduce((sum, entry) => sum + entry.hours, 0),
      };
    });

    // Status distribution - calculate in single pass
    let completeCount = 0;
    let inProgressCount = 0;
    let notStartedCount = 0;
    data.months.forEach((m) => {
      if (m.status === "complete") completeCount++;
      else if (m.status === "in-progress") inProgressCount++;
      else notStartedCount++;
    });

    const statusData = [
      { name: "Complete", value: completeCount, color: "#22c55e" },
      { name: "In Progress", value: inProgressCount, color: "#f59e0b" },
      { name: "Not Started", value: notStartedCount, color: "#6b7280" },
    ];

    return { totalHours, monthsComplete, competenciesComplete, portfolioComplete, monthlyHours, statusData };
  }, [data.weeklyLog, data.months, data.competencyChecklist, data.portfolio, data.startDate]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Total Hours</span>
            </div>
            <div className="text-2xl font-bold tabular-nums">{stats.totalHours.toFixed(1)}</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Months Complete</span>
            </div>
            <div className="text-2xl font-bold tabular-nums">{stats.monthsComplete}/12</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Competencies</span>
            </div>
            <div className="text-2xl font-bold tabular-nums">{stats.competenciesComplete}/17</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Portfolio</span>
            </div>
            <div className="text-2xl font-bold tabular-nums">{stats.portfolioComplete}/5</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Hours by Month</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.monthlyHours}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="hours" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Month Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={stats.statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  dataKey="value"
                  label
                >
                  {stats.statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
