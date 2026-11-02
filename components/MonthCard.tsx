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
    <a href={`/month/${month.id}`} className="block cursor-pointer group h-full">
      <Magnet padding={50} magnetStrength={3} maxOffset={12} scale={1.03} tilt={4}>
        <GlareHover
          variant="streak"
          glareColor="#8b5cf6"
          glareOpacity={0.4}
          glareAngle={-45}
          glareSize={30}
          softness={0.6}
          mode="hover"
          borderRadius="16px"
          className="w-full h-full"
        >
          <Card
            className={`cursor-pointer relative glass-card card-premium transition-all duration-500 hover:shadow-premium-2xl hover:-translate-y-2 dark:hover:bg-card/95 hover:bg-white overflow-hidden h-full flex flex-col min-h-[480px] border-2 ${
              cardData.isCurrentMonth ? "ring-2 ring-accent shadow-premium-xl gradient-border-animated border-accent" : "border-border/40"
            } ${cardData.isNotStarted ? "opacity-80" : ""}`}
          >
        {cardData.isCurrentMonth && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-accent to-purple-500 text-white text-xs px-3 py-1.5 rounded-full font-medium z-10 shadow-glow animate-pulse-glow flex items-center gap-1.5 backdrop-blur-sm">
            <Sparkles className="h-3 w-3" />
            Current
          </div>
        )}
        {month.image && (
          <div className="h-48 overflow-hidden relative flex-shrink-0">
            <Image
              src={month.image}
              alt={month.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
              quality={85}
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
        )}
        <CardHeader className="pb-4 pt-5 px-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-2 leading-tight">
                Month {month.id}
                {cardData.isCurrentMonth && (
                  <TrendingUp className="h-4 w-4 text-accent animate-icon-bounce" />
                )}
              </CardTitle>
              <CardDescription className="text-sm mt-1.5 line-clamp-2 text-foreground/70 group-hover:text-foreground/90 transition-colors font-medium">
                {month.title}
              </CardDescription>
            </div>
            <StatusPill status={month.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4 flex-1 flex flex-col justify-between px-5 pb-5">
          <div>
            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">{month.focus}</p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span className="tabular-nums font-medium">{cardData.tasksComplete}/{month.tasks.length} tasks</span>
              </div>
              <span className="font-bold tabular-nums text-primary text-base">{Math.round(cardData.taskProgress)}%</span>
            </div>
            <div className="relative h-3 bg-muted rounded-full overflow-hidden shadow-inner">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${getProgressGradient()} transition-all duration-700 relative shadow-sm`}
                style={{ width: `${cardData.taskProgress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              </div>
            </div>
          </div>
          {cardData.deadlineStatus && (
            <div className={`text-sm font-semibold flex items-center gap-1.5 ${cardData.deadlineStatus.color} bg-background/50 py-1.5 px-3 rounded-lg border border-border/30`}>
              <Clock className="h-3.5 w-3.5" />
              {cardData.deadlineStatus.text}
            </div>
          )}
          <div className="flex items-center justify-between pt-3 border-t border-border/50">
            <span className="text-sm text-muted-foreground font-medium">View details</span>
            <ArrowRight className="h-5 w-5 text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1.5" />
          </div>
        </CardContent>
      </Card>
      </GlareHover>
    </Magnet>
    </a>
  );
});
