"use client";

import { useApp } from "@/lib/context";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useMemo, memo } from "react";

export const OverallProgress = memo(function OverallProgress() {
  const { data } = useApp();

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

  return (
    <Card className="transition-all duration-300">
      <CardContent className="pt-6">
        <div className="text-6xl font-bold tabular-nums mb-4 font-serif transition-all duration-300">
          {progress.overallProgress}%
        </div>
        <div>
          <Progress value={progress.overallProgress} className="h-3 transition-all duration-500" />
        </div>
        <p className="text-sm text-muted-foreground mt-2 text-center tabular-nums">
          {progress.monthsComplete} of 12 months · {progress.portfolioComplete} of 5 portfolio · {progress.competenciesComplete} of 17 competencies
        </p>
      </CardContent>
    </Card>
  );
});
