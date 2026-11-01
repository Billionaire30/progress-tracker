"use client";

import { useApp } from "@/lib/context";
import { generateInsights, ProductivityInsight } from "@/lib/insights";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Lightbulb, Trophy, Target } from "lucide-react";
import { useMemo, memo } from "react";

export const ProductivityInsights = memo(function ProductivityInsights() {
  const { data } = useApp();
  const insights = useMemo(() => generateInsights(data), [data]);

  if (insights.length === 0) {
    return null;
  }

  const getIcon = (type: ProductivityInsight["type"]) => {
    switch (type) {
      case "achievement":
        return <Trophy className="h-5 w-5 text-yellow-600" />;
      case "recommendation":
        return <Lightbulb className="h-5 w-5 text-blue-600" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case "milestone":
        return <Target className="h-5 w-5 text-green-600" />;
    }
  };

  const getPriorityColor = (priority: ProductivityInsight["priority"]) => {
    switch (priority) {
      case "high":
        return "border-l-4 border-l-red-500";
      case "medium":
        return "border-l-4 border-l-yellow-500";
      case "low":
        return "border-l-4 border-l-blue-500";
    }
  };

  return (
    <Card className="glass-card card-premium">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary animate-pulse-glow" />
          Productivity Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg bg-muted/50 ${getPriorityColor(insight.priority)} hover:bg-muted transition-colors duration-300 animate-slide-in`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start gap-3">
              {getIcon(insight.type)}
              <div className="flex-1">
                <p className="font-medium text-sm">{insight.title}</p>
                <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
});
