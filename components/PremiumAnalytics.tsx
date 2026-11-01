"use client";

import { useApp } from "@/lib/context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Calendar, TrendingUp, Award, Target, Clock, Flame, Zap } from "lucide-react";
import { useState, useMemo } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { exportToPDF, exportToExcel, exportDetailedReport } from "@/lib/export-advanced";

export function PremiumAnalytics() {
  const { data } = useApp();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('all');

  const analytics = useMemo(() => {
    // Focus area breakdown
    const focusAreaData = data.weeklyLog.reduce((acc: any, log) => {
      const key = log.focus || "Other";
      acc[key] = (acc[key] || 0) + log.hours;
      return acc;
    }, {});

    const focusAreaChartData = Object.entries(focusAreaData).map(([name, hours]) => ({
      name,
      hours,
    }));

    // Productivity heatmap data (by hour of day)
    const hourlyData = new Array(24).fill(0);
    data.weeklyLog.forEach((log) => {
      const hour = new Date(log.date).getHours();
      hourlyData[hour] += log.hours;
    });

    const hourlyChartData = hourlyData.map((hours, hour) => ({
      hour: `${hour}:00`,
      hours,
    }));

    // Weekly comparison
    const weeksData: any[] = [];
    const weekGroups = new Map<string, number>();

    data.weeklyLog.forEach((log) => {
      const date = new Date(log.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split("T")[0];

      weekGroups.set(weekKey, (weekGroups.get(weekKey) || 0) + log.hours);
    });

    weekGroups.forEach((hours, week) => {
      weeksData.push({ week, hours });
    });

    weeksData.sort((a, b) => new Date(a.week).getTime() - new Date(b.week).getTime());

    // Task completion rate
    const totalTasks = data.months.reduce((sum, month) => sum + month.tasks.length, 0);
    const completedTasks = data.months.reduce(
      (sum, month) => sum + month.tasks.filter((t) => t.done).length,
      0
    );
    const completionRate = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : 0;

    // Average hours per day
    const daysWithLogs = new Set(data.weeklyLog.map((log) => log.date)).size;
    const totalHours = data.weeklyLog.reduce((sum, log) => sum + log.hours, 0);
    const avgHoursPerDay = daysWithLogs > 0 ? (totalHours / daysWithLogs).toFixed(1) : 0;

    // Most productive day
    const dayData = new Map<string, number>();
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    data.weeklyLog.forEach((log) => {
      const dayName = dayNames[new Date(log.date).getDay()];
      dayData.set(dayName, (dayData.get(dayName) || 0) + log.hours);
    });

    const dayChartData = dayNames.map((day) => ({
      day,
      hours: dayData.get(day) || 0,
    }));

    // Radar chart data for skills
    const skillData = [
      { skill: "Theory", value: data.competencyChecklist.filter(c => c.id.startsWith('c')).filter(c => c.done).length / 6 * 100 },
      { skill: "CAD", value: data.competencyChecklist.filter(c => c.id.startsWith('c')).filter(c => c.done).length / 6 * 100 },
      { skill: "Road", value: data.competencyChecklist.filter(c => c.id.startsWith('c')).filter(c => c.done).length / 6 * 100 },
      { skill: "Structural", value: data.competencyChecklist.filter(c => c.id.startsWith('c')).filter(c => c.done).length / 6 * 100 },
      { skill: "Management", value: data.competencyChecklist.filter(c => c.id.startsWith('c')).filter(c => c.done).length / 6 * 100 },
      { skill: "Professional", value: data.competencyChecklist.filter(c => c.id.startsWith('c')).filter(c => c.done).length / 6 * 100 },
    ];

    // Monthly progress trend
    const monthlyProgress = data.months.map((month, index) => ({
      month: `M${index + 1}`,
      progress: month.tasks.length > 0 ? (month.tasks.filter(t => t.done).length / month.tasks.length) * 100 : 0,
      hours: data.weeklyLog
        .filter((log) => {
          const monthStart = new Date(data.startDate || new Date());
          monthStart.setMonth(monthStart.getMonth() + index);
          const monthEnd = new Date(monthStart);
          monthEnd.setMonth(monthStart.getMonth() + 1);
          const entryDate = new Date(log.date);
          return entryDate >= monthStart && entryDate < monthEnd;
        })
        .reduce((sum, log) => sum + log.hours, 0),
    }));

    return {
      focusAreaChartData,
      hourlyChartData,
      weeksData,
      completionRate,
      avgHoursPerDay,
      dayChartData,
      totalHours,
      totalTasks,
      completedTasks,
      skillData,
      monthlyProgress,
    };
  }, [data.weeklyLog, data.months, data.competencyChecklist, data.startDate]);

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

  const handleExportPDF = () => {
    exportDetailedReport(data);
  };

  const handleExportExcel = () => {
    exportToExcel(data);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums">{analytics.totalHours.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card className="glass-card hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Task Completion</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums">{analytics.completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {analytics.completedTasks} of {analytics.totalTasks} tasks
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Hours/Day</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums">{analytics.avgHoursPerDay}</div>
            <p className="text-xs text-muted-foreground">On active days</p>
          </CardContent>
        </Card>

        <Card className="glass-card hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums">{data.currentStreak}</div>
            <p className="text-xs text-muted-foreground">Days</p>
          </CardContent>
        </Card>
      </div>

      {/* Export Controls */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold font-serif">Premium Analytics</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportPDF}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportExcel}>
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2">
        <Button
          variant={timeRange === 'week' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTimeRange('week')}
        >
          Week
        </Button>
        <Button
          variant={timeRange === 'month' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTimeRange('month')}
        >
          Month
        </Button>
        <Button
          variant={timeRange === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTimeRange('all')}
        >
          All Time
        </Button>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Focus Area Breakdown */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Hours by Focus Area</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.focusAreaChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.name}: ${entry.hours.toFixed(1)}h`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="hours"
                >
                  {analytics.focusAreaChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Productivity by Day of Week */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Productivity by Day</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.dayChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="hours" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weekly Progress */}
        <Card className="lg:col-span-2 glass-card">
          <CardHeader>
            <CardTitle>Weekly Progress Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics.weeksData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="hours" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Hourly Distribution */}
        <Card className="lg:col-span-2 glass-card">
          <CardHeader>
            <CardTitle>Hourly Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.hourlyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="hours" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Skill Radar */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Skill Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={analytics.skillData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="skill" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar
                  name="Skills"
                  dataKey="value"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Progress Trend */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Monthly Progress Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.monthlyProgress}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="progress" stroke="#3b82f6" strokeWidth={2} name="Completion %" />
                <Line type="monotone" dataKey="hours" stroke="#10b981" strokeWidth={2} name="Hours" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
