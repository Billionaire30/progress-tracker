"use client";

import { useApp } from "@/lib/context";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useMemo, memo, useState, useEffect } from "react";
import { TrendingUp, Award, CheckCircle2, Sparkles, Zap } from "lucide-react";

export const OverallProgress = memo(function OverallProgress() {
  const { data } = useApp();
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const progress = useMemo(() => {
    const monthsComplete = data.months.filter((m) => m.status === "complete").length;
    const portfolioComplete = data.portfolio.filter((p) => p.status === "complete").length;
    const competenciesComplete = data.competencyChecklist.filter((c) => c.done).length;
    const overallProgress = Math.round(
      ((monthsComplete + portfolioComplete + competenciesComplete) / (12 + 5 + 17)) * 100
    );
    return {
      overallProgress,
      monthsComplete,
      portfolioComplete,
      competenciesComplete
    };
  }, [data.months, data.portfolio, data.competencyChecklist]);

  useEffect(() => {
    setIsLoaded(true);
    const duration = 1500;
    const steps = 60;
    const increment = progress.overallProgress / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= progress.overallProgress) {
        setAnimatedProgress(progress.overallProgress);
        clearInterval(timer);
      } else {
        setAnimatedProgress(Math.round(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [progress.overallProgress]);

  const getProgressColor = () => {
    if (progress.overallProgress >= 75) return "from-green-500 to-emerald-400";
    if (progress.overallProgress >= 50) return "from-blue-500 to-cyan-400";
    if (progress.overallProgress >= 25) return "from-purple-500 to-pink-400";
    return "from-primary to-purple-500";
  };

  const getProgressIcon = () => {
    if (progress.overallProgress >= 75) return <Sparkles className="h-5 w-5 text-green-500 animate-icon-bounce" />;
    if (progress.overallProgress >= 50) return <TrendingUp className="h-5 w-5 text-blue-500" />;
    if (progress.overallProgress >= 25) return <Zap className="h-5 w-5 text-purple-500" />;
    return <Award className="h-5 w-5 text-primary" />;
  };

  return (
    <Card className={`glass-card shadow-premium-lg gradient-border gradient-border-animated card-premium ${isLoaded ? 'animate-scale-in' : ''}`}>
      <CardContent className="pt-6 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {getProgressIcon()}
            <span className="text-sm font-medium text-muted-foreground">Overall Progress</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground bg-primary/10 px-2 py-1 rounded-full">
            <Award className="h-3 w-3 text-primary" />
            Premium Tracker
          </div>
        </div>
        <div className="relative">
          <div className="text-7xl sm:text-8xl font-bold tabular-nums mb-4 font-serif gradient-text-blue counter-animate">
            {animatedProgress}%
          </div>
          <div className="absolute -top-2 -right-2">
            <div className={`h-3 w-3 rounded-full ${progress.overallProgress > 0 ? 'bg-green-500 animate-pulse-glow shadow-glow' : 'bg-muted'}`} />
          </div>
        </div>
        <div className="mb-4 relative">
          <div className="h-4 bg-muted rounded-full overflow-hidden shadow-inner">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${getProgressColor()} transition-all duration-700 ease-out relative`}
              style={{ width: `${animatedProgress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="text-center p-3 rounded-lg bg-muted/50 border hover:bg-muted transition-colors duration-300 hover:shadow-premium cursor-default group">
            <CheckCircle2 className="h-4 w-4 mx-auto mb-1 text-blue-500 group-hover:scale-110 transition-transform" />
            <div className="text-lg font-bold tabular-nums">{progress.monthsComplete}</div>
            <div className="text-xs text-muted-foreground">Months</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50 border hover:bg-muted transition-colors duration-300 hover:shadow-premium cursor-default group">
            <CheckCircle2 className="h-4 w-4 mx-auto mb-1 text-purple-500 group-hover:scale-110 transition-transform" />
            <div className="text-lg font-bold tabular-nums">{progress.portfolioComplete}</div>
            <div className="text-xs text-muted-foreground">Portfolio</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50 border hover:bg-muted transition-colors duration-300 hover:shadow-premium cursor-default group">
            <CheckCircle2 className="h-4 w-4 mx-auto mb-1 text-pink-500 group-hover:scale-110 transition-transform" />
            <div className="text-lg font-bold tabular-nums">{progress.competenciesComplete}</div>
            <div className="text-xs text-muted-foreground">Skills</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
