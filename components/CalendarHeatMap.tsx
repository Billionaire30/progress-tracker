"use client";

import { useApp } from "@/lib/context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WeeklyLogEntry } from "@/lib/data";
import { useMemo, memo } from "react";

interface CalendarHeatMapProps {
  year?: number;
}

export const CalendarHeatMap = memo(function CalendarHeatMap({ year = new Date().getFullYear() }: CalendarHeatMapProps) {
  const { data } = useApp();

  const calendarData = useMemo(() => {
    const getHoursForDate = (date: Date): number => {
      const dateStr = date.toISOString().split("T")[0];
      return data.weeklyLog
        .filter((entry) => entry.date === dateStr)
        .reduce((sum, entry) => sum + entry.hours, 0);
    };

    const getHeatColor = (hours: number): string => {
      if (hours === 0) return "bg-muted";
      if (hours < 2) return "bg-primary/20";
      if (hours < 4) return "bg-primary/40";
      if (hours < 6) return "bg-primary/60";
      return "bg-primary";
    };

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const weeks: (Date | null)[][] = [];
    let currentWeek: (Date | null)[] = [];

    // Start from first day of year
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    let currentDate = new Date(startDate);
    const startDay = startDate.getDay();

    // Fill first week with nulls
    for (let i = 0; i < startDay; i++) {
      currentWeek.push(null);
    }

    while (currentDate <= endDate) {
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Add final week
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }

    // Calculate which week each month starts in
    const monthStartWeeks: Record<number, number> = {};
    weeks.forEach((week, weekIndex) => {
      week.forEach(date => {
        if (date && date.getDate() === 1) {
          monthStartWeeks[date.getMonth()] = weekIndex;
        }
      });
    });

    const totalHours = data.weeklyLog.reduce((sum, entry) => sum + entry.hours, 0);

    return { monthStartWeeks, days, weeks, totalHours, getHoursForDate, getHeatColor };
  }, [data.weeklyLog, year]);

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Activity Calendar - {year}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Total hours: {calendarData.totalHours.toFixed(1)}</span>
            <div className="flex items-center gap-1">
              <span>Less</span>
              <div className="w-3 h-3 bg-muted rounded-sm" />
              <div className="w-3 h-3 bg-primary/20 rounded-sm" />
              <div className="w-3 h-3 bg-primary/40 rounded-sm" />
              <div className="w-3 h-3 bg-primary/60 rounded-sm" />
              <div className="w-3 h-3 bg-primary rounded-sm" />
              <span>More</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              <div className="flex gap-1 mb-1">
                <div className="w-8" />
                {calendarData.weeks.map((_, weekIndex) => {
                  const monthIndex = Object.entries(calendarData.monthStartWeeks).find(
                    ([, week]) => week === weekIndex
                  )?.[0];
                  if (monthIndex === undefined) return <div key={weekIndex} className="w-3" />;
                  const monthName = new Date(year, parseInt(monthIndex), 1).toLocaleDateString("en-US", { month: "short" });
                  return (
                    <div key={weekIndex} className="text-xs text-muted-foreground w-3">
                      {monthName}
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-1">
                <div className="flex flex-col gap-1">
                  {calendarData.days.map((day) => (
                    <div key={day} className="text-xs text-muted-foreground h-3 w-8">
                      {day}
                    </div>
                  ))}
                </div>

                {calendarData.weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-1">
                    {week.map((date, dayIndex) => {
                      if (!date) {
                        return <div key={dayIndex} className="w-3 h-3" />;
                      }

                      const hours = calendarData.getHoursForDate(date);
                      const colorClass = calendarData.getHeatColor(hours);
                      const hasHours = hours > 0;

                      return (
                        <div
                          key={`${date.toISOString()}-${dayIndex}`}
                          className={`w-3 h-3 rounded-sm ${colorClass} ${hasHours ? 'cursor-pointer' : ''}`}
                          title={`${date.toLocaleDateString()}: ${hours.toFixed(1)} hrs`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
