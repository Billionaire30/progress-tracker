import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatusPill } from "@/components/StatusPill";
import { Month } from "@/lib/data";
import { getCurrentWeekNumber, getCurrentMonthNumber } from "@/lib/week";
import { useApp } from "@/lib/context";
import Image from "next/image";
import { memo, useMemo } from "react";

interface MonthCardProps {
  month: Month;
}

export const MonthCard = memo(function MonthCard({ month }: MonthCardProps) {
  const { data } = useApp();

  const cardData = useMemo(() => {
    const tasksComplete = month.tasks.filter((t) => t.done).length;
    const taskProgress = month.tasks.length > 0 ? (tasksComplete / month.tasks.length) * 100 : 0;
    const currentMonth = getCurrentMonthNumber(data.startDate);
    const isCurrentMonth = month.id === currentMonth;
    const isNotStarted = month.status === "not-started";

    const getDeadlineStatus = () => {
      if (!month.deadline) return null;
      const deadline = new Date(month.deadline);
      const today = new Date();
      const daysUntil = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntil < 0) return { text: `${Math.abs(daysUntil)}d overdue`, color: "text-red-500" };
      if (daysUntil === 0) return { text: "Due today", color: "text-orange-500" };
      if (daysUntil <= 7) return { text: `${daysUntil}d left`, color: "text-yellow-500" };
      return null;
    };

    const deadlineStatus = getDeadlineStatus();

    return { tasksComplete, taskProgress, isCurrentMonth, isNotStarted, deadlineStatus };
  }, [month, data.startDate]);

  return (
    <a href={`/month/${month.id}`} className="block cursor-pointer">
      <Card
        className={`hover:border-primary cursor-pointer relative glass-card transition-all duration-200 hover:shadow-lg ${
          cardData.isCurrentMonth ? "ring-2 ring-accent" : ""
        } ${cardData.isNotStarted ? "opacity-85" : ""}`}
      >
        {cardData.isCurrentMonth && (
          <div className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs px-3 py-1.5 rounded-full font-medium z-10">
            Current
          </div>
        )}
        {month.image && (
          <div className="h-32 overflow-hidden relative">
            <Image
              src={month.image}
              alt={month.title}
              fill
              className="object-cover"
              loading="lazy"
              quality={70}
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 33vw"
            />
          </div>
        )}
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-base">Month {month.id}</CardTitle>
              <CardDescription className="text-xs mt-1 line-clamp-2">
                {month.title}
              </CardDescription>
            </div>
            <StatusPill status={month.status} />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">{month.focus}</p>
          <Progress value={cardData.taskProgress} className="h-2" />
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-muted-foreground tabular-nums">
              {cardData.tasksComplete}/{month.tasks.length} tasks
            </p>
            {cardData.deadlineStatus && (
              <p className={`text-xs font-medium ${cardData.deadlineStatus.color}`}>
                {cardData.deadlineStatus.text}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </a>
  );
});
