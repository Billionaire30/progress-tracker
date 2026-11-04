"use client";

import { useAppStore, selectCompletedCompetencies, selectCompetencyProgress } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Clock, ChevronDown, ChevronRight } from "lucide-react";
import { useState, useCallback } from "react";
import { COMPETENCY_CATEGORIES } from "@/constants/seedData";
import { computeCompetencyPace } from "@/lib/goals";

export function Competencies() {
  const competencies = useAppStore((state) => state.competencies);
  const toggleCompetency = useAppStore((state) => state.toggleCompetency);
  const settings = useAppStore((state) => state.settings);
  
  const [expandedCategory, setExpandedCategory] = useState<string | null>("CAD & Surveying");

  const competenciesComplete = selectCompletedCompetencies(useAppStore.getState());
  const competencyProgress = selectCompetencyProgress(useAppStore.getState());

  const handleToggle = useCallback((id: string) => {
    toggleCompetency(id);
  }, [toggleCompetency]);

  const toggleCategory = useCallback((category: string) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  }, [expandedCategory]);

  // Calculate pace
  const pace = computeCompetencyPace(
    competenciesComplete.length,
    competencies.length,
    settings.startDate,
    settings.targetEndDate
  );

  // Handle invalid pace values
  const safeExpected = isNaN(pace.expected) ? 0 : pace.expected;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Competencies
        </CardTitle>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            {competenciesComplete.length} / {competencies.length} complete
          </p>
          <Progress value={competencyProgress} className="h-2" />
          <p className={`text-xs ${
            pace.status === 'ahead' ? 'text-green-600' :
            pace.status === 'behind' ? 'text-red-600' :
            'text-muted-foreground'
          }`}>
            {pace.status.charAt(0).toUpperCase() + pace.status.slice(1)} pace • Expected: {safeExpected}
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {Object.entries(COMPETENCY_CATEGORIES).map(([category, competencyIds]) => {
          const categoryCompetencies = competencies.filter((c) =>
            competencyIds.includes(c.id)
          );
          const categoryComplete = categoryCompetencies.filter((c) => c.completed).length;
          const categoryProgress = (categoryComplete / categoryCompetencies.length) * 100;
          const isExpanded = expandedCategory === category;

          return (
            <div key={category} className="border rounded-lg overflow-hidden">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium truncate">{category}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {categoryComplete}/{categoryCompetencies.length}
                    </span>
                  </div>
                  <Progress value={categoryProgress} className="h-1.5" />
                </div>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 ml-2 text-muted-foreground flex-shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 ml-2 text-muted-foreground flex-shrink-0" />
                )}
              </button>
              {isExpanded && (
                <div className="border-t p-2 space-y-1 bg-muted/30">
                  {categoryCompetencies.map((competency) => (
                    <div
                      key={competency.id}
                      className="flex items-start gap-2 p-2 rounded hover:bg-muted/50"
                    >
                      <Checkbox
                        checked={competency.completed}
                        onCheckedChange={() => handleToggle(competency.id)}
                        className="mt-0.5 flex-shrink-0"
                      />
                      <p
                        className={`text-sm flex-1 ${
                          competency.completed ? "line-through text-muted-foreground" : ""
                        }`}
                      >
                        {competency.title}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
