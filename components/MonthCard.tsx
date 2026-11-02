"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatusPill } from "@/components/StatusPill";
import { Month } from "@/lib/data";
import { getCurrentWeekNumber, getCurrentMonthNumber } from "@/lib/week";
import { useApp } from "@/lib/context";
import Image from "next/image";
import { memo, useMemo } from "react";
import { Sparkles, Clock, TrendingUp, ArrowRight } from "lucide-react";
import Magnet from "@/components/Magnet";
import GlareHover from "@/components/GlareHover";

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

  const getProgressGradient = () => {
    if (cardData.taskProgress >= 75) return "from-green-500 to-emerald-400";
    if (cardData.taskProgress >= 50) return "from-blue-500 to-cyan-400";
    if (cardData.taskProgress >= 25) return "from-purple-500 to-pink-400";
    return "from-primary to-purple-500";
  };

  return (
    <a href={`/month/${month.id}`} className="block cursor-pointer group">
      <Magnet padding={40} magnetStrength={2.5} maxOffset={10} scale={1.02} tilt={3}>
        <GlareHover
          variant="streak"
          glareColor="#8b5cf6"
          glareOpacity={0.3}
          glareAngle={-45}
          glareSize={25}
          softness={0.5}
          mode="hover"
          borderRadius="12px"
          className="w-full"
        >
          <Card
            className={`hover:border-primary cursor-pointer relative glass-card card-premium transition-all duration-300 hover:shadow-premium-xl hover:-translate-y-1 dark:hover:bg-card/95 hover:bg-white overflow-hidden ${
              cardData.isCurrentMonth ? "ring-2 ring-accent shadow-premium-lg gradient-border-animated" : ""
            } ${cardData.isNotStarted ? "opacity-85" : ""}`}
          >
        {cardData.isCurrentMonth && (
          <div className="absolute -top-2 -right-2 bg-gradient-to-r from-accent to-purple-500 text-white text-xs px-3 py-1.5 rounded-full font-medium z-10 shadow-glow animate-pulse-glow flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Current
          </div>
        )}
        {month.image && (
          <div className="h-36 overflow-hidden relative">
            <Image
              src={month.image}
              alt={month.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
              quality={80}
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        )}
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                Month {month.id}
                {cardData.isCurrentMonth && (
                  <TrendingUp className="h-4 w-4 text-accent animate-icon-bounce" />
                )}
              </CardTitle>
              <CardDescription className="text-xs mt-1 line-clamp-2 text-foreground/70 group-hover:text-foreground/90 transition-colors">
                {month.title}
              </CardDescription>
            </div>
            <StatusPill status={month.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-2">{month.focus}</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span className="tabular-nums">{cardData.tasksComplete}/{month.tasks.length} tasks</span>
              </div>
              <span className="font-medium tabular-nums text-primary">{Math.round(cardData.taskProgress)}%</span>
            </div>
            <div className="relative h-2.5 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${getProgressGradient()} transition-all duration-500 relative`}
                style={{ width: `${cardData.taskProgress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              </div>
            </div>
          </div>
          {cardData.deadlineStatus && (
            <div className={`text-xs font-medium flex items-center gap-1 ${cardData.deadlineStatus.color}`}>
              <Clock className="h-3 w-3" />
              {cardData.deadlineStatus.text}
            </div>
          )}
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <span className="text-xs text-muted-foreground">View details</span>
            <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1" />
          </div>
        </CardContent>
      </Card>
      </GlareHover>
    </Magnet>
    </a>
  );
});
